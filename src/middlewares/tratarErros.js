// Transforma erros em respostas JSON. Erros de regra de negócio mostram a
// mensagem; erros internos não mostram detalhes do banco (RNF05).
const { ErroNegocio } = require("../utils/erros");

function tratarErros(erro, req, res, next) {
    if (erro instanceof ErroNegocio) {
        return res.status(erro.status).json({ erro: erro.message });
    }
    if (erro.type === "entity.parse.failed") {
        return res.status(400).json({ erro: "Dados enviados em formato inválido." });
    }
    console.error("[erro]", req.method, req.originalUrl, erro);
    res.status(500).json({ erro: "Erro interno no servidor. Tente novamente." });
}

module.exports = { tratarErros };
