// =====================================================================
// Rotas da API (todas começam com /api)
// =====================================================================

const express = require("express");
const produtoController = require("../controllers/produtoController");
const estoqueController = require("../controllers/estoqueController");
const apoioController = require("../controllers/apoioController");
const { arvoreDisponivel } = require("../middlewares/arvoreDisponivel");
const { usuarioAtual } = require("../middlewares/usuario");

const router = express.Router();

// Passa erros de funções assíncronas para o middleware de erros.
const tratar = (funcao) => (req, res, next) => Promise.resolve(funcao(req, res, next)).catch(next);

router.get("/saude", (req, res) => res.json({ ok: true }));

router.use(arvoreDisponivel, usuarioAtual);

// Produtos e serviços
router.get("/produtos", tratar(produtoController.listar));
router.get("/produtos/resumo", tratar(produtoController.resumo));
router.get("/produtos/:id", tratar(produtoController.obter));
router.post("/produtos", tratar(produtoController.cadastrar));
router.put("/produtos/:id", tratar(produtoController.editar));
router.patch("/produtos/:id/inativar", tratar(produtoController.inativar));

// Estoque
router.get("/estoque", tratar(estoqueController.listarPosicao));
router.get("/estoque/resumo", tratar(estoqueController.resumo));
router.get("/estoque/movimentacoes", tratar(estoqueController.historico));
router.post("/estoque/entradas", tratar(estoqueController.registrarEntrada));
router.post("/estoque/saidas", tratar(estoqueController.registrarSaida));

// Apoio
router.get("/categorias", tratar(apoioController.categorias));
router.get("/fornecedores", tratar(apoioController.fornecedores));
router.get("/estrutura/avl", tratar(apoioController.arvore));
router.post("/estrutura/avl/recarregar", tratar(apoioController.recarregarArvore));

router.use((req, res) => res.status(404).json({ erro: "Rota não encontrada." }));

module.exports = router;
