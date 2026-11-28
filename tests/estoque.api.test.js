// =====================================================================
// Testes da API de produtos e estoque (precisam do servidor e do banco).
//
// Como rodar:
//   1. Recrie o banco com database/schema/01.schema.sql e database/seed/01.seed.sql
//   2. Inicie o servidor: npm start
//   3. Em outro terminal (Linux/Mac):  API_URL=http://localhost:3000 npm test
//      No Windows (PowerShell):        $env:API_URL="http://localhost:3000"; npm test
//
// Sem API_URL, estes testes são pulados e só os testes da Árvore AVL rodam.
// =====================================================================

const { test } = require("node:test");
const assert = require("node:assert/strict");

const URL_BASE = process.env.API_URL;
const pular = !URL_BASE && "defina API_URL para testar a API";

async function chamar(metodo, caminho, corpo) {
    const resposta = await fetch(URL_BASE + caminho, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: corpo ? JSON.stringify(corpo) : undefined
    });
    return { status: resposta.status, dados: await resposta.json() };
}

/** Cria um produto novo para cada teste não depender dos outros. */
async function novoProduto(estoqueInicial, estoqueMinimo) {
    const { status, dados } = await chamar("POST", "/api/produtos", {
        descricao: `Produto de teste ${Date.now()}`, tipo: "FISICO", idCategoria: 1,
        preco: 10, estoqueInicial, estoqueMinimo
    });
    assert.equal(status, 201);
    return dados.produto;
}

test("CT02 - saída maior que o estoque é bloqueada e nada muda", { skip: pular }, async () => {
    const produto = await novoProduto(5, 1);
    const { status, dados } = await chamar("POST", "/api/estoque/saidas", { idProduto: produto.idProduto, quantidade: 6 });

    assert.equal(status, 422);
    assert.match(dados.erro, /Estoque insuficiente/);
    const depois = await chamar("GET", `/api/produtos/${produto.idProduto}`);
    assert.equal(depois.dados.estoqueAtual, 5);
});

test("entrada aumenta o estoque exatamente na quantidade informada", { skip: pular }, async () => {
    const produto = await novoProduto(5, 1);
    const { status, dados } = await chamar("POST", "/api/estoque/entradas", { idProduto: produto.idProduto, quantidade: 7 });

    assert.equal(status, 201);
    assert.equal(dados.produto.estoqueAtual, 12);
});

test("CT03 - saída que chega ao mínimo gera alerta; entrada resolve", { skip: pular }, async () => {
    const produto = await novoProduto(10, 5);

    const saida = await chamar("POST", "/api/estoque/saidas", { idProduto: produto.idProduto, quantidade: 6 });
    assert.equal(saida.dados.produto.estoqueAtual, 4);
    assert.equal(saida.dados.produto.situacao, "Crítico");
    assert.equal(saida.dados.alerta, "gerado");

    const entrada = await chamar("POST", "/api/estoque/entradas", { idProduto: produto.idProduto, quantidade: 20 });
    assert.equal(entrada.dados.alerta, "resolvido");
});

test("duas saídas ao mesmo tempo não deixam o estoque negativo", { skip: pular }, async () => {
    const produto = await novoProduto(10, 0);
    const pedidos = [1, 2].map(() => chamar("POST", "/api/estoque/saidas", { idProduto: produto.idProduto, quantidade: 7 }));
    const respostas = await Promise.all(pedidos);

    assert.deepEqual(respostas.map((r) => r.status).sort(), [201, 422]);
    const depois = await chamar("GET", `/api/produtos/${produto.idProduto}`);
    assert.equal(depois.dados.estoqueAtual, 3);
});

test("produto inativado não pode ser movimentado", { skip: pular }, async () => {
    const produto = await novoProduto(3, 1);
    assert.equal((await chamar("PATCH", `/api/produtos/${produto.idProduto}/inativar`)).status, 200);

    const { status } = await chamar("POST", "/api/estoque/entradas", { idProduto: produto.idProduto, quantidade: 1 });
    assert.equal(status, 422);
});

test("pesquisa por código passa pela árvore e acha o produto", { skip: pular }, async () => {
    const produto = await novoProduto(1, 0);
    const { dados } = await chamar("GET", `/api/produtos?busca=${produto.codigo}`);
    assert.equal(dados.length, 1);
    assert.equal(dados[0].idProduto, produto.idProduto);
});

test("a árvore continua balanceada depois das operações", { skip: pular }, async () => {
    const { dados } = await chamar("GET", "/api/estrutura/avl");
    assert.equal(dados.balanceadaEOrdenada, true);
    assert.ok(dados.altura <= dados.alturaMaximaTeorica);
});
