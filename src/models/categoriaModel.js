// Model de categorias de produto
const { pool } = require("../config/database");

async function listarAtivas() {
    const [linhas] = await pool.query(
        `SELECT id_categoria_produto AS idCategoria, nome
           FROM categorias_produto WHERE ativo = 1 ORDER BY nome`
    );
    return linhas;
}

async function buscarAtiva(idCategoria, conexao = pool) {
    const [linhas] = await conexao.query(
        "SELECT id_categoria_produto FROM categorias_produto WHERE id_categoria_produto = ? AND ativo = 1",
        [idCategoria]
    );
    return linhas.length > 0;
}

module.exports = { listarAtivas, buscarAtiva };
