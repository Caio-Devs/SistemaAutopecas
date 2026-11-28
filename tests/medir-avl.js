// =====================================================================
// Medição da Árvore AVL com os produtos do banco (Estrutura de Dados II)
// Usado para preencher o Quadro 4 do relatório.
//
// Rodar com o .env configurado:  npm run medir
// =====================================================================

require("dotenv").config({ quiet: true });

const { pool } = require("../src/config/database");
const produtoModel = require("../src/models/produtoModel");
const ArvoreAVL = require("../src/estruturas/ArvoreAVL");

async function medir() {
    // 1) Carga: banco -> árvore (o mesmo caminho usado pelo servidor)
    const inicioLeitura = process.hrtime.bigint();
    const produtos = await produtoModel.listarTodos();
    const fimLeitura = process.hrtime.bigint();

    const arvore = new ArvoreAVL();
    for (const produto of produtos) arvore.inserir(produto);
    const fimMontagem = process.hrtime.bigint();

    // 2) Busca por código de todos os produtos
    let soma = 0, maximo = 0;
    for (const produto of produtos) {
        arvore.buscar(produto.idProduto);
        soma += arvore.ultimasComparacoes;
        maximo = Math.max(maximo, arvore.ultimasComparacoes);
    }

    // 3) Conferência: a listagem da árvore é igual à do banco?
    const [linhas] = await pool.query("SELECT id_produto FROM produtos ORDER BY id_produto");
    const idsBanco = linhas.map((l) => l.id_produto).join(",");
    const idsArvore = arvore.listarEmOrdem().map((p) => p.idProduto).join(",");

    const n = produtos.length;
    console.log("Produtos carregados do banco ........", n);
    console.log("Altura da árvore depois da carga ....", arvore.altura());
    console.log("Altura máxima teórica (AVL) .........", Math.floor(1.4405 * Math.log2(n + 2) - 0.3277));
    console.log("Leitura no banco (ms) ...............", (Number(fimLeitura - inicioLeitura) / 1e6).toFixed(2));
    console.log("Montagem da árvore (ms) .............", (Number(fimMontagem - fimLeitura) / 1e6).toFixed(2));
    console.log("Comparações por busca (média) .......", (soma / n).toFixed(2));
    console.log("Comparações por busca (máximo) ......", maximo);
    console.log("Lista comum: comparações (média) ....", ((n + 1) / 2).toFixed(1));
    console.log("Árvore balanceada e ordenada ........", arvore.verificar() ? "sim" : "não");
    console.log("Listagem igual à do banco ...........", idsBanco === idsArvore ? "sim" : "não");

    await pool.end();
}

medir().catch((erro) => {
    console.error("Erro na medição:", erro.message);
    process.exit(1);
});
