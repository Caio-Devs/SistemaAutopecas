// Controller de estoque
const estoqueService = require("../services/estoqueService");

const SITUACOES = ["Normal", "Crítico", "Sem estoque"];

function listarPosicao(req, res) {
    const { busca, categoria, situacao } = req.query;
    res.json(estoqueService.listarPosicao({
        busca,
        idCategoria: categoria || null,
        situacao: SITUACOES.includes(situacao) ? situacao : null
    }));
}

async function resumo(req, res) {
    res.json(await estoqueService.resumo());
}

async function historico(req, res) {
    res.json(await estoqueService.historico(req.query));
}

async function registrarEntrada(req, res) {
    res.status(201).json(await estoqueService.registrarEntrada(req.body, req.usuario));
}

async function registrarSaida(req, res) {
    res.status(201).json(await estoqueService.registrarSaida(req.body, req.usuario));
}

module.exports = { listarPosicao, resumo, historico, registrarEntrada, registrarSaida };
