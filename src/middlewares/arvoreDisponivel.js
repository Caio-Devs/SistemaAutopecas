// Recusa as chamadas da API enquanto a Árvore AVL não foi carregada do banco.
const { garantirCarregada, estado } = require("../services/arvoreProdutos");

async function arvoreDisponivel(req, res, next) {
    if (await garantirCarregada()) return next();
    res.status(503).json({
        erro: "Banco de dados indisponível: não foi possível carregar os produtos. Confira a conexão com o MySQL.",
        detalhe: process.env.NODE_ENV === "production" ? undefined : estado.ultimoErro
    });
}

module.exports = { arvoreDisponivel };
