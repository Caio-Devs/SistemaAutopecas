// =====================================================================
// Regras de negócio de produtos e serviços
// Consultas: pela Árvore AVL. Gravações: banco (transação) → árvore.
// =====================================================================

const { emTransacao } = require("../config/database");
const { arvore, sincronizarProduto } = require("./arvoreProdutos");
const produtoModel = require("../models/produtoModel");
const categoriaModel = require("../models/categoriaModel");
const movimentacaoModel = require("../models/movimentacaoModel");
const estoqueService = require("./estoqueService");
const { formatarCodigo, lerCodigo } = require("../utils/codigo");
const { ErroNegocio } = require("../utils/erros");

const FORNECEDOR_PADRAO_ID = () => Number(process.env.FORNECEDOR_PADRAO_ID) || 1;

/** Produto do jeito que a tela recebe (com código formatado e situação do estoque). */
function paraTela(produto) {
    return {
        ...produto,
        codigo: formatarCodigo(produto.idProduto, produto.tipo),
        situacao: estoqueService.situacaoDoEstoque(produto)
    };
}

// ---------------------------------------------------------------------
// Consultas (pela árvore)
// ---------------------------------------------------------------------

/**
 * Lista com pesquisa e filtros.
 * - Pesquisa por código (P001): busca na AVL, O(log n).
 * - Pesquisa por nome: percurso em ordem na AVL, O(n).
 */
function listar({ busca, tipo, idCategoria, status } = {}) {
    let produtos;
    const texto = String(busca || "").trim();
    const id = lerCodigo(texto);

    if (texto === "") {
        produtos = arvore.listarEmOrdem();
    } else if (id !== null) {
        const encontrado = arvore.buscar(id);
        produtos = encontrado ? [encontrado] : [];
    } else {
        produtos = arvore.buscarPorDescricao(texto);
    }

    return produtos
        .filter((p) => !tipo || p.tipo === tipo)
        .filter((p) => !idCategoria || p.idCategoria === Number(idCategoria))
        .filter((p) => !status || (status === "ATIVO" ? p.ativo : !p.ativo))
        .map(paraTela);
}

function obter(idProduto) {
    const produto = arvore.buscar(Number(idProduto));
    if (!produto) throw new ErroNegocio("Produto não encontrado.", 404);
    return paraTela(produto);
}

/** Números dos cards da tela de Produtos. */
function resumo() {
    let produtos = 0, ativos = 0, servicos = 0;
    arvore.percorrerEmOrdem((p) => {
        if (p.tipo === "FISICO") {
            produtos++;
            if (p.ativo) ativos++;
        } else {
            servicos++;
        }
    });
    return { produtos, ativos, servicos, criticos: arvore.gerarAlertas().length };
}

// ---------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------

function inteiroNaoNegativo(valor, nomeDoCampo) {
    const numero = Number(valor);
    if (valor === "" || valor === null || valor === undefined || !Number.isInteger(numero) || numero < 0) {
        throw new ErroNegocio(`${nomeDoCampo} deve ser um número inteiro maior ou igual a zero.`);
    }
    return numero;
}

async function validar(dados, { novo }) {
    const descricao = String(dados.descricao || "").trim();
    if (!descricao) throw new ErroNegocio("Informe o nome do produto.");
    if (descricao.length > 150) throw new ErroNegocio("O nome do produto pode ter no máximo 150 caracteres.");

    if (dados.preco === "" || dados.preco === null || dados.preco === undefined) {
        throw new ErroNegocio("Informe o preço de venda.");
    }
    const preco = Number(dados.preco);
    if (!Number.isFinite(preco)) throw new ErroNegocio("Preço de venda inválido.");
    if (preco < 0) throw new ErroNegocio("O preço de venda não pode ser negativo (RN01).");
    if (preco > 99999999.99) throw new ErroNegocio("Preço de venda muito alto.");

    const idCategoria = Number(dados.idCategoria);
    if (!Number.isInteger(idCategoria) || !(await categoriaModel.buscarAtiva(idCategoria))) {
        throw new ErroNegocio("Selecione uma categoria válida.");
    }

    const resultado = {
        descricao,
        preco: Math.round(preco * 100) / 100,
        idCategoria,
        ativo: dados.ativo === undefined ? true : Boolean(dados.ativo)
    };

    if (novo) {
        if (!["FISICO", "SERVICO"].includes(dados.tipo)) {
            throw new ErroNegocio("Tipo inválido: use produto (FISICO) ou serviço (SERVICO).");
        }
        resultado.tipo = dados.tipo;
    }

    return resultado;
}

// ---------------------------------------------------------------------
// Gravações (banco → árvore)
// ---------------------------------------------------------------------

async function cadastrar(dados, usuario) {
    const produto = await validar(dados, { novo: true });

    if (produto.tipo === "FISICO") {
        produto.estoqueAtual = inteiroNaoNegativo(dados.estoqueInicial ?? 0, "O estoque inicial");
        produto.estoqueMinimo = inteiroNaoNegativo(dados.estoqueMinimo, "O estoque mínimo");
    } else {
        // RN12: serviço não tem estoque
        produto.estoqueAtual = null;
        produto.estoqueMinimo = null;
    }

    const idProduto = await emTransacao(async (conexao) => {
        const id = await produtoModel.inserir(conexao, produto);
        // O estoque inicial fica registrado como movimentação, para o histórico explicar o saldo.
        if (produto.tipo === "FISICO" && produto.estoqueAtual > 0) {
            await movimentacaoModel.inserir(conexao, {
                idUsuario: usuario.idUsuario,
                idProduto: id,
                idFornecedor: FORNECEDOR_PADRAO_ID(),
                tipo: "ENTRADA",
                motivo: "AJUSTE",
                quantidade: produto.estoqueAtual,
                dataHora: new Date()
            });
        }
        return id;
    });

    const salvo = await sincronizarProduto(idProduto);           // banco → árvore
    const alerta = await estoqueService.verificarEstoqueMinimo(salvo);
    return { produto: paraTela(salvo), alerta };
}

async function editar(idProduto, dados) {
    const atual = arvore.buscar(Number(idProduto));
    if (!atual) throw new ErroNegocio("Produto não encontrado.", 404);

    const produto = await validar(dados, { novo: false });
    produto.estoqueMinimo = atual.tipo === "FISICO"
        ? inteiroNaoNegativo(dados.estoqueMinimo, "O estoque mínimo")
        : null;

    await emTransacao((conexao) => produtoModel.atualizar(conexao, atual.idProduto, produto));

    const salvo = await sincronizarProduto(atual.idProduto);
    const alerta = await estoqueService.verificarEstoqueMinimo(salvo);
    return { produto: paraTela(salvo), alerta };
}

/** Inativa (RN06): o produto sai das vendas e do estoque, mas continua no histórico. */
async function inativar(idProduto) {
    const atual = arvore.buscar(Number(idProduto));
    if (!atual) throw new ErroNegocio("Produto não encontrado.", 404);
    if (!atual.ativo) throw new ErroNegocio("Este produto já está inativo.");

    await emTransacao((conexao) => produtoModel.alterarAtivo(conexao, atual.idProduto, false));

    const salvo = await sincronizarProduto(atual.idProduto);
    const alerta = await estoqueService.verificarEstoqueMinimo(salvo);
    return { produto: paraTela(salvo), alerta };
}

module.exports = { listar, obter, resumo, cadastrar, editar, inativar, paraTela };
