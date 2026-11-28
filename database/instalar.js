// =====================================================================
// Instala o banco de dados: roda schema/01.schema.sql e seed/01.seed.sql
// no MySQL configurado no .env (MySQL local ou TiDB Cloud).
//
//   npm run banco               cria as tabelas e coloca os dados iniciais
//   npm run banco -- --recriar  APAGA o banco autopecas e cria tudo de novo
//
// O usuário do .env precisa ter permissão para criar banco e tabelas.
// =====================================================================

require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const ARQUIVOS = [
    path.join(__dirname, "schema", "01.schema.sql"),
    path.join(__dirname, "seed", "01.seed.sql")
];

/** Separa o arquivo em comandos SQL (sem os comentários). */
function lerComandos(arquivo) {
    return fs.readFileSync(arquivo, "utf8")
        .split("\n")
        .filter((linha) => !linha.trim().startsWith("--"))
        .join("\n")
        .split(/;\s*(?:\n|$)/)
        .map((comando) => comando.trim())
        .filter((comando) => comando.length > 0);
}

async function instalar() {
    const recriar = process.argv.includes("--recriar");

    const conexao = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        charset: "utf8mb4",
        ssl: process.env.DB_SSL === "true" ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined
    });

    const [[versao]] = await conexao.query("SELECT VERSION() AS v");
    console.log(`Conectado em ${process.env.DB_HOST} (versão ${versao.v}).`);

    if (recriar) {
        await conexao.query("DROP DATABASE IF EXISTS autopecas");
        console.log("Banco autopecas apagado (--recriar).");
    }

    for (const arquivo of ARQUIVOS) {
        const comandos = lerComandos(arquivo);
        console.log(`Rodando ${path.relative(process.cwd(), arquivo)} (${comandos.length} comandos)...`);

        for (const comando of comandos) {
            try {
                await conexao.query(comando);
            } catch (erro) {
                // Os SET do início/fim do script do Workbench são opcionais:
                // alguns bancos compatíveis (ex.: TiDB) não conhecem todas as variáveis.
                if (/^SET\s/i.test(comando)) {
                    console.log(`  aviso: comando ignorado (${erro.message})`);
                    continue;
                }
                if (erro.code === "ER_DUP_ENTRY") {
                    throw new Error("Os dados iniciais já existem. Para apagar e criar tudo de novo: npm run banco -- --recriar");
                }
                throw new Error(`${erro.message}\nNo comando:\n${comando.slice(0, 300)}`);
            }
        }
    }

    const [[total]] = await conexao.query("SELECT COUNT(*) AS n FROM autopecas.produtos");
    console.log(`Pronto! Banco autopecas instalado com ${total.n} produtos.`);
    await conexao.end();
}

instalar().catch((erro) => {
    console.error("Erro ao instalar o banco:", erro.message);
    process.exit(1);
});
