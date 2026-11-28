// Controller de produtos: recebe o pedido, chama o service e devolve JSON.
const produtoService = require("../services/produtoService");

const TIPOS = { produto: "FISICO", servico: "SERVICO", FISICO: "FISICO", SERVICO: "SERVICO" };

function listar(req, res) {
    const { busca, tipo, categoria, status } = req.query;
    res.json(produtoService.listar({
        busca,
        tipo: TIPOS[tipo] || null,
        idCategoria: categoria || null,
        status: ["ATIVO", "INATIVO"].includes(status) ? status : null
    }));
}

function resumo(req, res) {
    res.json(produtoService.resumo());
}

function obter(req, res) {
    res.json(produtoService.obter(req.params.id));
}

async function cadastrar(req, res) {
    res.status(201).json(await produtoService.cadastrar(req.body, req.usuario));
}

async function editar(req, res) {
    res.json(await produtoService.editar(req.params.id, req.body));
}

async function inativar(req, res) {
    res.json(await produtoService.inativar(req.params.id));
}

module.exports = { listar, resumo, obter, cadastrar, editar, inativar };
