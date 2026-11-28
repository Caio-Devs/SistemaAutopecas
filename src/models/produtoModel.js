// =====================================================================
// Model de produtos: SQL da tabela produtos.
// Todas as consultas são parametrizadas (?), contra injeção de SQL.
//
// Regra do projeto: as telas NÃO leem esta tabela diretamente.
// listarTodos() e buscarPorId() servem para montar e atualizar a
// Árvore AVL; o sistema consulta a árvore.
// =====================================================================

const { pool } = require("../config/database");

const SELECT_PRODUTO = `
    SELECT p.id_produto, p.descricao, p.preco, p.tipo,
           p.estoque_atual, p.estoque_minimo, p.ativo,
           p.id_categoria_produto, c.nome AS categoria
      FROM produtos p
      JOIN categorias_produto c
        ON c.id_categoria_produto = p.id_categoria_produto`;

/** Converte uma linha do banco no objeto guardado na árvore. */
function paraProduto(linha) {
    return {
        idProduto: linha.id_produto,
        descricao: linha.descricao,
        preco: Number(linha.preco),
        tipo: linha.tipo,
        estoqueAtual: linha.estoque_atual,
        estoqueMinimo: linha.estoque_minimo,
        ativo: linha.ativo === 1,
        idCategoria: linha.id_categoria_produto,
        categoria: linha.categoria
    };
}

/** Todos os produtos (ativos e inativos), ordenados pelo código. Usado na carga da árvore. */
async function listarTodos() {
    const [linhas] = await pool.query(`${SELECT_PRODUTO} ORDER BY p.id_produto`);
    return linhas.map(paraProduto);
}

/** Um produto pelo id (relido depois de cada gravação para atualizar a árvore). */
async function buscarPorId(idProduto, conexao = pool) {
    const [linhas] = await conexao.query(`${SELECT_PRODUTO} WHERE p.id_produto = ?`, [idProduto]);
    return linhas.length ? paraProduto(linhas[0]) : null;
}

/** Trava a linha do produto até o fim da transação (evita duas saídas ao mesmo tempo). */
async function travarParaMovimentacao(conexao, idProduto) {
    const [linhas] = await conexao.query(
        `SELECT id_produto, descricao, tipo, estoque_atual, ativo
           FROM produtos WHERE id_produto = ? FOR UPDATE`,
        [idProduto]
    );
    return linhas[0] || null;
}

async function inserir(conexao, dados) {
    const [resultado] = await conexao.query(
        `INSERT INTO produtos
            (descricao, preco, tipo, estoque_atual, estoque_minimo, ativo, id_categoria_produto)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [dados.descricao, dados.preco, dados.tipo, dados.estoqueAtual,
         dados.estoqueMinimo, dados.ativo ? 1 : 0, dados.idCategoria]
    );
    return resultado.insertId;
}

async function atualizar(conexao, idProduto, dados) {
    await conexao.query(
        `UPDATE produtos
            SET descricao = ?, preco = ?, estoque_minimo = ?, ativo = ?, id_categoria_produto = ?
          WHERE id_produto = ?`,
        [dados.descricao, dados.preco, dados.estoqueMinimo, dados.ativo ? 1 : 0,
         dados.idCategoria, idProduto]
    );
}

async function alterarAtivo(conexao, idProduto, ativo) {
    await conexao.query("UPDATE produtos SET ativo = ? WHERE id_produto = ?", [ativo ? 1 : 0, idProduto]);
}

/**
 * Soma (ou subtrai, com valor negativo) no estoque.
 * A condição estoque_atual + ? >= 0 garante, no próprio banco,
 * que o estoque nunca fica negativo (RN03).
 * Devolve true se a linha foi alterada.
 */
async function alterarEstoque(conexao, idProduto, diferenca) {
    const [resultado] = await conexao.query(
        `UPDATE produtos
            SET estoque_atual = estoque_atual + ?
          WHERE id_produto = ? AND tipo = 'FISICO' AND estoque_atual + ? >= 0`,
        [diferenca, idProduto, diferenca]
    );
    return resultado.affectedRows === 1;
}

module.exports = {
    listarTodos, buscarPorId, travarParaMovimentacao,
    inserir, atualizar, alterarAtivo, alterarEstoque
};
