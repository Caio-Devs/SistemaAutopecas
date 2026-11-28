// =====================================================================
// Model de alertas de reposição (tabela alertas).
// Cada alerta guarda os dados de entrada, a regra e o resultado (RN10).
// =====================================================================

const { pool } = require("../config/database");

async function existeAtivo(idProduto) {
    const [linhas] = await pool.query(
        "SELECT id_alerta FROM alertas WHERE id_produto = ? AND tipo = 'REPOSICAO' AND status = 'ATIVO' LIMIT 1",
        [idProduto]
    );
    return linhas.length > 0;
}

async function gerar(alerta) {
    await pool.query(
        `INSERT INTO alertas (id_produto, tipo, dados_entrada, regra, resultado, status, data_geracao)
         VALUES (?, 'REPOSICAO', ?, ?, ?, 'ATIVO', NOW())`,
        [alerta.idProduto, alerta.dadosEntrada, alerta.regra, alerta.resultado]
    );
}

/** Marca como RESOLVIDO os alertas ativos do produto. Devolve quantos foram resolvidos. */
async function resolver(idProduto) {
    const [resultado] = await pool.query(
        `UPDATE alertas SET status = 'RESOLVIDO', data_resolucao = NOW()
          WHERE id_produto = ? AND tipo = 'REPOSICAO' AND status = 'ATIVO'`,
        [idProduto]
    );
    return resultado.affectedRows;
}

module.exports = { existeAtivo, gerar, resolver };
