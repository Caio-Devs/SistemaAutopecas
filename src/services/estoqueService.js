// =====================================================================
// Regras de negócio do estoque
// - Entradas e saídas sempre numa transação.
// - O estoque nunca fica negativo (RN03): conferido na transação, com a
//   linha travada, e de novo no UPDATE.
// - Depois do commit: relê o produto no banco, atualiza a Árvore AVL e
//   confere o estoque mínimo (RN07, RN09, RN10).
// =====================================================================

const { emTransacao } = require("../config/database");
const { arvore, sincronizarProduto } = require("./arvoreProdutos");
const { precisaRepor } = require("../estruturas/ArvoreAVL");
const produtoModel = require("../models/produtoModel");
const movimentacaoModel = require("../models/movimentacaoModel");
const fornecedorModel = require("../models/fornecedorModel");
const alertaModel = require("../models/alertaModel");
const { formatarCodigo, lerCodigo } = require("../utils/codigo");
const { ErroNegocio } = require("../utils/erros");

const FORNECEDOR_PADRAO_ID = () => Number(process.env.FORNECEDOR_PADRAO_ID) || 1;

const MOTIVOS_ENTRADA = ["COMPRA", "AJUSTE"];
const MOTIVOS_SAIDA = ["PERDA", "AJUSTE"];

/** "Normal", "Crítico" ou "Sem estoque". Serviços não têm situação de estoque. */
function situacaoDoEstoque(produto) {
    if (produto.tipo !== "FISICO") return null;
    if (produto.estoqueAtual <= 0) return "Sem estoque";
    if (produto.estoqueAtual <= produto.estoqueMinimo) return "Crítico";
    return "Normal";
}

function paraTela(produto) {
    return {
        ...produto,
        codigo: formatarCodigo(produto.idProduto, produto.tipo),
        situacao: situacaoDoEstoque(produto)
    };
}

// ---------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------

/** Posição de estoque: produtos físicos e ativos, vindos da árvore. */
function listarPosicao({ busca, idCategoria, situacao } = {}) {
    const texto = String(busca || "").trim();
    const id = lerCodigo(texto);
    let produtos;

    if (texto === "") {
        produtos = arvore.listarEmOrdem();
    } else if (id !== null) {
        const encontrado = arvore.buscar(id);          // O(log n)
        produtos = encontrado ? [encontrado] : [];
    } else {
        produtos = arvore.buscarPorDescricao(texto);   // O(n)
    }

    return produtos
        .filter((p) => p.tipo === "FISICO" && p.ativo)
        .filter((p) => !idCategoria || p.idCategoria === Number(idCategoria))
        .map(paraTela)
        .filter((p) => !situacao || p.situacao === situacao);
}

/** Números dos cards da tela de Estoque. */
async function resumo() {
    let unidades = 0;
    arvore.percorrerEmOrdem((p) => {
        if (p.tipo === "FISICO" && p.ativo) unidades += p.estoqueAtual || 0;
    });
    const { entradas, saidas } = await movimentacaoModel.totaisDoMes();
    return { unidades, entradasNoMes: entradas, saidasNoMes: saidas, criticos: arvore.gerarAlertas().length };
}

/** Histórico de movimentações. O nome do produto vem da Árvore AVL. */
async function historico({ inicio, fim, tipo, produto } = {}) {
    const dataValida = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || "");
    const movimentacoes = await movimentacaoModel.listar({
        inicio: dataValida(inicio) ? inicio : null,
        fim: dataValida(fim) ? fim : null,
        tipo: ["ENTRADA", "SAIDA"].includes(tipo) ? tipo : null,
        idProduto: Number.isInteger(Number(produto)) && Number(produto) > 0 ? Number(produto) : null
    });

    return movimentacoes.map((m) => {
        const produto = arvore.buscar(m.idProduto);
        return {
            ...m,
            codigo: produto ? formatarCodigo(produto.idProduto, produto.tipo) : formatarCodigo(m.idProduto, "FISICO"),
            produto: produto ? produto.descricao : "(produto não encontrado)",
            fornecedor: m.fornecedor === "Não se aplica" ? null : m.fornecedor
        };
    });
}

// ---------------------------------------------------------------------
// Movimentações
// ---------------------------------------------------------------------

function validarQuantidade(valor) {
    const quantidade = Number(valor);
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        throw new ErroNegocio("A quantidade deve ser um número inteiro maior que zero.");
    }
    if (quantidade > 1000000) throw new ErroNegocio("Quantidade muito alta.");
    return quantidade;
}

/** Data escolhida na tela (AAAA-MM-DD) com a hora atual. Sem data = agora. */
function lerData(data) {
    if (!data) return new Date();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new ErroNegocio("Data inválida.");
    const agora = new Date();
    const [ano, mes, dia] = data.split("-").map(Number);
    const escolhida = new Date(ano, mes - 1, dia, agora.getHours(), agora.getMinutes(), agora.getSeconds());
    if (Number.isNaN(escolhida.getTime())) throw new ErroNegocio("Data inválida.");
    if (escolhida > agora) throw new ErroNegocio("A data da movimentação não pode ser no futuro.");
    return escolhida;
}

/** Confere na árvore se o produto pode ser movimentado (resposta rápida para a tela). */
function produtoMovimentavel(idProduto) {
    const produto = arvore.buscar(Number(idProduto));
    if (!produto) throw new ErroNegocio("Produto não encontrado.", 404);
    if (produto.tipo !== "FISICO") throw new ErroNegocio("Serviços não têm estoque (RN12).");
    if (!produto.ativo) throw new ErroNegocio("Produto inativo não pode ser movimentado.");
    return produto;
}

async function registrarEntrada(dados, usuario) {
    const produto = produtoMovimentavel(dados.idProduto);
    const quantidade = validarQuantidade(dados.quantidade);
    const motivo = dados.motivo || "COMPRA";
    if (!MOTIVOS_ENTRADA.includes(motivo)) throw new ErroNegocio("Motivo de entrada inválido.");
    const dataHora = lerData(dados.data);

    let idFornecedor = FORNECEDOR_PADRAO_ID();
    if (dados.idFornecedor) {
        idFornecedor = Number(dados.idFornecedor);
        if (!(await fornecedorModel.buscarAtivo(idFornecedor))) throw new ErroNegocio("Fornecedor inválido.");
    }

    await emTransacao(async (conexao) => {
        const linha = await produtoModel.travarParaMovimentacao(conexao, produto.idProduto);
        if (!linha || linha.ativo !== 1 || linha.tipo !== "FISICO") {
            throw new ErroNegocio("Produto indisponível para movimentação.");
        }
        await produtoModel.alterarEstoque(conexao, produto.idProduto, quantidade);
        await movimentacaoModel.inserir(conexao, {
            idUsuario: usuario.idUsuario, idProduto: produto.idProduto, idFornecedor,
            tipo: "ENTRADA", motivo, quantidade, dataHora
        });
    });

    return depoisDaMovimentacao(produto.idProduto);
}

async function registrarSaida(dados, usuario) {
    const produto = produtoMovimentavel(dados.idProduto);
    const quantidade = validarQuantidade(dados.quantidade);
    const motivo = dados.motivo || "PERDA";
    if (!MOTIVOS_SAIDA.includes(motivo)) throw new ErroNegocio("Motivo de saída inválido.");
    const dataHora = lerData(dados.data);

    await emTransacao(async (conexao) => {
        // Trava a linha: duas saídas ao mesmo tempo não conseguem passar do saldo.
        const linha = await produtoModel.travarParaMovimentacao(conexao, produto.idProduto);
        if (!linha || linha.ativo !== 1 || linha.tipo !== "FISICO") {
            throw new ErroNegocio("Produto indisponível para movimentação.");
        }
        if (linha.estoque_atual < quantidade) {
            throw new ErroNegocio(
                `Estoque insuficiente: há ${linha.estoque_atual} unidade(s) de ${linha.descricao} ` +
                `e a saída pede ${quantidade}. O estoque não pode ficar negativo.`
            );
        }
        const alterou = await produtoModel.alterarEstoque(conexao, produto.idProduto, -quantidade);
        if (!alterou) throw new ErroNegocio("Estoque insuficiente. O estoque não pode ficar negativo.");

        await movimentacaoModel.inserir(conexao, {
            idUsuario: usuario.idUsuario, idProduto: produto.idProduto,
            idFornecedor: FORNECEDOR_PADRAO_ID(),
            tipo: "SAIDA", motivo, quantidade, dataHora
        });
    });

    return depoisDaMovimentacao(produto.idProduto);
}

/** Depois do commit: banco → árvore, e confere o estoque mínimo. */
async function depoisDaMovimentacao(idProduto) {
    const produto = await sincronizarProduto(idProduto);
    const alerta = await verificarEstoqueMinimo(produto);
    return { produto: paraTela(produto), alerta };
}

// ---------------------------------------------------------------------
// Verificação de estoque mínimo (alerta inteligente de reposição)
// ---------------------------------------------------------------------

/**
 * Se o produto ficou com estoque <= mínimo, gera um alerta ATIVO
 * com dados de entrada, regra e resultado. Se voltou a ficar acima do
 * mínimo (ou foi inativado), resolve os alertas ativos.
 * Devolve "gerado", "resolvido" ou null.
 */
async function verificarEstoqueMinimo(produto) {
    if (!produto || produto.tipo !== "FISICO") return null;

    if (precisaRepor(produto)) {
        if (await alertaModel.existeAtivo(produto.idProduto)) return null;
        await alertaModel.gerar({
            idProduto: produto.idProduto,
            dadosEntrada: `estoque_atual = ${produto.estoqueAtual}, estoque_minimo = ${produto.estoqueMinimo}`,
            regra: "estoque_atual <= estoque_minimo",
            resultado: `Repor ${produto.descricao}`
        });
        return "gerado";
    }

    const resolvidos = await alertaModel.resolver(produto.idProduto);
    return resolvidos > 0 ? "resolvido" : null;
}

module.exports = {
    situacaoDoEstoque, listarPosicao, resumo, historico,
    registrarEntrada, registrarSaida, verificarEstoqueMinimo
};
