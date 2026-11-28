// =====================================================================
// Árvore de produtos do sistema: Banco de dados → Árvore AVL → Sistema
//
// - Na inicialização, os produtos são lidos do MySQL e inseridos na AVL.
// - Toda consulta de produtos é respondida pela árvore.
// - Depois de cada gravação confirmada (commit), o produto é relido do
//   banco e o nó é atualizado. O banco continua sendo a fonte oficial.
// - Se algo sair do lugar, a árvore é montada de novo a partir do banco.
// =====================================================================

const ArvoreAVL = require("../estruturas/ArvoreAVL");
const produtoModel = require("../models/produtoModel");

const arvore = new ArvoreAVL();

const estado = {
    carregada: false,
    ultimaCarga: null,     // data e hora da última carga
    tempoCargaMs: null,    // quanto tempo levou para montar a árvore
    ultimoErro: null,
    ultimaTentativa: 0
};

/** Lê todos os produtos do banco e monta a árvore do zero. */
async function carregarDoBanco() {
    estado.ultimaTentativa = Date.now();
    const inicio = process.hrtime.bigint();

    const produtos = await produtoModel.listarTodos();   // 1) banco
    arvore.limpar();
    for (const produto of produtos) {
        arvore.inserir(produto);                          // 2) árvore
    }

    estado.tempoCargaMs = Number(process.hrtime.bigint() - inicio) / 1e6;
    estado.carregada = true;
    estado.ultimaCarga = new Date();
    estado.ultimoErro = null;
    return informacoes();
}

/**
 * Garante que a árvore foi carregada. Se o banco estava fora do ar quando
 * o servidor iniciou, tenta de novo (no máximo a cada 10 segundos).
 */
async function garantirCarregada() {
    if (estado.carregada) return true;
    if (Date.now() - estado.ultimaTentativa < 10000) return false;
    try {
        await carregarDoBanco();
        return true;
    } catch (erro) {
        estado.ultimoErro = erro.message;
        return false;
    }
}

/**
 * Relê um produto no banco (depois do commit) e atualiza a árvore:
 * se o nó existe, troca os dados; se não existe (produto novo), insere.
 */
async function sincronizarProduto(idProduto, conexao) {
    const produto = await produtoModel.buscarPorId(idProduto, conexao);
    if (!produto) {
        arvore.remover(idProduto);
        return null;
    }
    if (!arvore.atualizar(produto)) {
        arvore.inserir(produto);
    }
    return produto;
}

/** Dados da árvore para a apresentação e para o relatório de Estrutura de Dados II. */
function informacoes() {
    const n = arvore.tamanho;
    return {
        carregada: estado.carregada,
        produtos: n,
        altura: arvore.altura(),
        // Altura máxima de uma AVL com n nós: cerca de 1,44 · log2(n + 2) - 0,328
        alturaMaximaTeorica: n > 0 ? Math.floor(1.4405 * Math.log2(n + 2) - 0.3277) : 0,
        balanceadaEOrdenada: arvore.verificar(),
        tempoCargaMs: estado.tempoCargaMs,
        ultimaCarga: estado.ultimaCarga,
        ultimoErro: estado.ultimoErro
    };
}

module.exports = { arvore, estado, carregarDoBanco, garantirCarregada, sincronizarProduto, informacoes };
