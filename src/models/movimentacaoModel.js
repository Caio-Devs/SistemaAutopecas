// =====================================================================
// Model de movimentações de estoque (entradas e saídas).
// =====================================================================

const { pool } = require("../config/database");

async function inserir(conexao, mov) {
    const [resultado] = await conexao.query(
        `INSERT INTO movimentacao_estoque
            (id_usuario, id_produto, id_fornecedor, tipo, motivo, quantidade, data_hora)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [mov.idUsuario, mov.idProduto, mov.idFornecedor, mov.tipo, mov.motivo,
         mov.quantidade, mov.dataHora]
    );
    return resultado.insertId;
}

/**
 * Histórico de movimentações com filtros opcionais.
 * O nome do produto NÃO vem daqui: o service busca na Árvore AVL.
 */
async function listar({ inicio, fim, tipo, idProduto, limite = 100 }) {
    const condicoes = [];
    const valores = [];

    if (inicio) { condicoes.push("m.data_hora >= ?"); valores.push(`${inicio} 00:00:00`); }
    if (fim)    { condicoes.push("m.data_hora <= ?"); valores.push(`${fim} 23:59:59`); }
    if (tipo)   { condicoes.push("m.tipo = ?");       valores.push(tipo); }
    if (idProduto) { condicoes.push("m.id_produto = ?"); valores.push(idProduto); }

    const onde = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";
    valores.push(limite);

    const [linhas] = await pool.query(
        `SELECT m.id_movimentacao AS idMovimentacao, m.id_produto AS idProduto,
                m.tipo, m.motivo, m.quantidade, m.data_hora AS dataHora,
                u.nome_usuario AS responsavel, f.nome AS fornecedor
           FROM movimentacao_estoque m
           JOIN usuarios u     ON u.id_usuario = m.id_usuario
           JOIN fornecedores f ON f.id_fornecedor = m.id_fornecedor
           ${onde}
          ORDER BY m.data_hora DESC, m.id_movimentacao DESC
          LIMIT ?`,
        valores
    );
    return linhas;
}

/** Total de unidades que entraram e saíram no mês atual. */
async function totaisDoMes() {
    const [linhas] = await pool.query(
        `SELECT tipo, COALESCE(SUM(quantidade), 0) AS total
           FROM movimentacao_estoque
          WHERE data_hora >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            AND data_hora <  DATE_FORMAT(CURDATE(), '%Y-%m-01') + INTERVAL 1 MONTH
          GROUP BY tipo`
    );
    const totais = { entradas: 0, saidas: 0 };
    for (const linha of linhas) {
        if (linha.tipo === "ENTRADA") totais.entradas = Number(linha.total);
        if (linha.tipo === "SAIDA") totais.saidas = Number(linha.total);
    }
    return totais;
}

module.exports = { inserir, listar, totaisDoMes };
