// =====================================================================
// Conexão com o MySQL (biblioteca mysql2, com promessas)
// Os dados vêm das variáveis de ambiente (.env no computador,
// painel "Environment" no Render).
// =====================================================================

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "autopecas",
    ssl: process.env.DB_SSL === "true" ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
    charset: "utf8mb4",
    waitForConnections: true,
    enableKeepAlive: true,     // evita quedas de conexão em bancos na nuvem (TiDB Cloud)
    connectionLimit: 10,
    decimalNumbers: true,      // DECIMAL volta como número, e não como texto
    dateStrings: false
});

/**
 * Executa uma função dentro de uma transação.
 * Se a função terminar sem erro: COMMIT. Se der erro: ROLLBACK.
 * A função recebe a conexão da transação para fazer as consultas.
 */
async function emTransacao(funcao) {
    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();
        const resultado = await funcao(conexao);
        await conexao.commit();
        return resultado;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
}

module.exports = { pool, emTransacao };
