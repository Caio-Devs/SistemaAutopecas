// Listas de apoio para os campos de seleção das telas e dados da Árvore AVL.
const categoriaModel = require("../models/categoriaModel");
const fornecedorModel = require("../models/fornecedorModel");
const arvoreProdutos = require("../services/arvoreProdutos");

async function categorias(req, res) {
    res.json(await categoriaModel.listarAtivas());
}

async function fornecedores(req, res) {
    res.json(await fornecedorModel.listarAtivos(Number(process.env.FORNECEDOR_PADRAO_ID) || 1));
}

/** Situação da Árvore AVL (evidência para o relatório de Estrutura de Dados II). */
function arvore(req, res) {
    const info = arvoreProdutos.informacoes();
    const id = Number(req.query.buscar);
    if (Number.isInteger(id) && id > 0) {
        const encontrado = arvoreProdutos.arvore.buscar(id);
        info.busca = { idProduto: id, encontrado: Boolean(encontrado), comparacoes: arvoreProdutos.arvore.ultimasComparacoes };
    }
    info.desenho = arvoreProdutos.arvore.desenhar(5);
    res.json(info);
}

async function recarregarArvore(req, res) {
    res.json(await arvoreProdutos.carregarDoBanco());
}

module.exports = { categorias, fornecedores, arvore, recarregarArvore };
