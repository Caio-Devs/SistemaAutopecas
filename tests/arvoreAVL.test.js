// =====================================================================
// Testes da Árvore AVL (Estrutura de Dados II)
// Rodar com: npm test
// =====================================================================

const { test } = require("node:test");
const assert = require("node:assert/strict");
const ArvoreAVL = require("../src/estruturas/ArvoreAVL");

function produto(id, extra = {}) {
    return {
        idProduto: id,
        descricao: `Produto ${id}`,
        tipo: "FISICO",
        ativo: true,
        estoqueAtual: 10,
        estoqueMinimo: 5,
        ...extra
    };
}

function chaves(arvore) {
    return arvore.listarEmOrdem().map((p) => p.idProduto);
}

test("árvore vazia", () => {
    const arvore = new ArvoreAVL();
    assert.equal(arvore.altura(), 0);
    assert.equal(arvore.tamanho, 0);
    assert.equal(arvore.buscar(1), null);
    assert.deepEqual(arvore.listarEmOrdem(), []);
});

test("rotação simples à esquerda: inserir 1, 2, 3 (exemplo da Figura 1 do relatório)", () => {
    const arvore = new ArvoreAVL();
    [1, 2, 3].forEach((id) => arvore.inserir(produto(id)));
    assert.equal(arvore.raiz.chave, 2);
    assert.equal(arvore.raiz.esquerda.chave, 1);
    assert.equal(arvore.raiz.direita.chave, 3);
    assert.equal(arvore.altura(), 2);
});

test("rotação simples à direita: inserir 3, 2, 1", () => {
    const arvore = new ArvoreAVL();
    [3, 2, 1].forEach((id) => arvore.inserir(produto(id)));
    assert.equal(arvore.raiz.chave, 2);
    assert.equal(arvore.altura(), 2);
});

test("rotação dupla esquerda-direita: inserir 3, 1, 2", () => {
    const arvore = new ArvoreAVL();
    [3, 1, 2].forEach((id) => arvore.inserir(produto(id)));
    assert.equal(arvore.raiz.chave, 2);
    assert.equal(arvore.altura(), 2);
});

test("rotação dupla direita-esquerda: inserir 1, 3, 2", () => {
    const arvore = new ArvoreAVL();
    [1, 3, 2].forEach((id) => arvore.inserir(produto(id)));
    assert.equal(arvore.raiz.chave, 2);
    assert.equal(arvore.altura(), 2);
});

test("1.000 produtos inseridos em ordem (como vêm do banco) continuam balanceados", () => {
    const arvore = new ArvoreAVL();
    for (let id = 1; id <= 1000; id++) arvore.inserir(produto(id));

    assert.equal(arvore.tamanho, 1000);
    assert.ok(arvore.verificar(), "ordem, alturas e balanceamento corretos");
    // Altura máxima teórica de uma AVL com 1.000 nós é 14.
    assert.ok(arvore.altura() <= 14, `altura ${arvore.altura()} deveria ser no máximo 14`);
    // Uma árvore binária comum teria altura 1.000.
});

test("busca por código encontra o produto em poucas comparações", () => {
    const arvore = new ArvoreAVL();
    for (let id = 1; id <= 1000; id++) arvore.inserir(produto(id));

    assert.equal(arvore.buscar(737).idProduto, 737);
    assert.ok(arvore.ultimasComparacoes <= arvore.altura());
    assert.equal(arvore.buscar(5000), null);
});

test("percurso em ordem devolve os produtos ordenados por código", () => {
    const arvore = new ArvoreAVL();
    [50, 20, 80, 10, 30, 70, 90, 25].forEach((id) => arvore.inserir(produto(id)));
    assert.deepEqual(chaves(arvore), [10, 20, 25, 30, 50, 70, 80, 90]);
});

test("código repetido é recusado e a árvore não muda", () => {
    const arvore = new ArvoreAVL();
    [1, 2, 3].forEach((id) => arvore.inserir(produto(id)));
    assert.throws(() => arvore.inserir(produto(2)), /já cadastrado/);
    assert.equal(arvore.tamanho, 3);
    assert.ok(arvore.verificar());
});

test("remoção de folha, de nó com um filho e de nó com dois filhos mantém a árvore balanceada", () => {
    const arvore = new ArvoreAVL();
    for (let id = 1; id <= 31; id++) arvore.inserir(produto(id));

    assert.ok(arvore.remover(31));        // folha
    assert.ok(arvore.remover(30));        // nó com um filho
    assert.ok(arvore.remover(arvore.raiz.chave)); // raiz, com dois filhos
    assert.equal(arvore.remover(999), false);     // não existe

    assert.equal(arvore.tamanho, 28);
    assert.ok(arvore.verificar());
    assert.equal(arvore.buscar(30), null);
});

test("remover muitos produtos seguidos não desbalanceia a árvore", () => {
    const arvore = new ArvoreAVL();
    for (let id = 1; id <= 200; id++) arvore.inserir(produto(id));
    for (let id = 1; id <= 200; id += 2) arvore.remover(id);

    assert.equal(arvore.tamanho, 100);
    assert.ok(arvore.verificar());
    assert.deepEqual(chaves(arvore).slice(0, 3), [2, 4, 6]);
});

test("atualizar troca os dados do nó sem mudar a posição", () => {
    const arvore = new ArvoreAVL();
    [1, 2, 3].forEach((id) => arvore.inserir(produto(id)));

    assert.ok(arvore.atualizar(produto(2, { descricao: "Pastilha de freio", estoqueAtual: 3 })));
    assert.equal(arvore.buscar(2).descricao, "Pastilha de freio");
    assert.ok(arvore.atualizarQuantidade(2, 40));
    assert.equal(arvore.buscar(2).estoqueAtual, 40);
    assert.equal(arvore.atualizar(produto(9)), false);
});

test("busca por descrição ignora maiúsculas e acentos", () => {
    const arvore = new ArvoreAVL();
    arvore.inserir(produto(1, { descricao: "Filtro de óleo" }));
    arvore.inserir(produto(2, { descricao: "Pastilha de freio" }));
    arvore.inserir(produto(3, { descricao: "Filtro de ar" }));

    assert.deepEqual(arvore.buscarPorDescricao("FILTRO").map((p) => p.idProduto), [1, 3]);
    assert.deepEqual(arvore.buscarPorDescricao("oleo").map((p) => p.idProduto), [1]);
    assert.deepEqual(arvore.buscarPorDescricao("correia"), []);
});

test("alertas: só produtos físicos e ativos com estoque <= mínimo", () => {
    const arvore = new ArvoreAVL();
    arvore.inserir(produto(1, { estoqueAtual: 25, estoqueMinimo: 10 }));                 // normal
    arvore.inserir(produto(2, { estoqueAtual: 3, estoqueMinimo: 10 }));                  // crítico
    arvore.inserir(produto(3, { estoqueAtual: 8, estoqueMinimo: 8 }));                   // no limite
    arvore.inserir(produto(4, { estoqueAtual: 0, estoqueMinimo: 4, ativo: false }));     // inativo
    arvore.inserir(produto(5, { tipo: "SERVICO", estoqueAtual: null, estoqueMinimo: null })); // serviço

    assert.deepEqual(arvore.gerarAlertas().map((p) => p.idProduto), [2, 3]);
});
