// Model de fornecedores
const { pool } = require("../config/database");

/** Fornecedores ativos, sem o fornecedor padrão ("Não se aplica"). */
async function listarAtivos(idFornecedorPadrao) {
    const [linhas] = await pool.query(
        `SELECT id_fornecedor AS idFornecedor, nome, telefone
           FROM fornecedores
          WHERE ativo = 1 AND id_fornecedor <> ?
          ORDER BY nome`,
        [idFornecedorPadrao]
    );
    return linhas;
}

async function buscarAtivo(idFornecedor, conexao = pool) {
    const [linhas] = await conexao.query(
        "SELECT id_fornecedor FROM fornecedores WHERE id_fornecedor = ? AND ativo = 1",
        [idFornecedor]
    );
    return linhas.length > 0;
}

module.exports = { listarAtivos, buscarAtivo };
