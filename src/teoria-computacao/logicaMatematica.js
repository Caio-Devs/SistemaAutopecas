
// ======================================================
// GESTOR ÁGIL - TEORIA DA COMPUTAÇÃO
// Lógica Matemática e Tabelas-Verdade
// ======================================================

// Conjunção (E)
function conjuncao(p, q) {
    return p && q;
}

// Disjunção (OU)
function disjuncao(p, q) {
    return p || q;
}

// Negação (NÃO)
function negacao(p) {
    return !p;
}

// Implicação (SE... ENTÃO)
function implicacao(p, q) {
    return !p || q;
}

// Equivalência lógica
function equivalencia(p, q) {
    return p === q;
}

// Representação de verdadeiro e falso
function representar(valor) {
    return valor ? "V" : "F";
}

// ======================================================
// TABELA-VERDADE 01
// Autenticação e autorização
// Expressão: A ∧ P
// ======================================================

function tabelaVerdadeAcesso() {

    const valores = [true, false];
    const tabela = [];

    for (const A of valores) {
        for (const P of valores) {

            const resultado = conjuncao(A, P);

            tabela.push({
                A: representar(A),
                P: representar(P),
                "A ∧ P": representar(resultado),
                Resultado: resultado
                    ? "Permitido"
                    : "Negado"
            });
        }
    }

    return tabela;
}

// ======================================================
// TABELA-VERDADE 02
// Validação de itens e estoque
// Expressão: I ∧ Q ∧ E
// ======================================================

function tabelaVerdadeVenda() {

    const valores = [true, false];
    const tabela = [];

    for (const I of valores) {
        for (const Q of valores) {
            for (const E of valores) {

                const resultado = I && Q && E;

                tabela.push({
                    I: representar(I),
                    Q: representar(Q),
                    E: representar(E),
                    "I ∧ Q ∧ E": representar(resultado),
                    Resultado: resultado
                        ? "Aprovada"
                        : "Rejeitada"
                });
            }
        }
    }

    return tabela;
}

// ======================================================
// Exibição das tabelas no terminal
// ======================================================

function exibirTabelasVerdade() {

    console.log("\n====================================");
    console.log("TABELA 01 - CONTROLE DE ACESSO");
    console.log("====================================");

    console.table(tabelaVerdadeAcesso());

    console.log("\n====================================");
    console.log("TABELA 02 - ITENS E ESTOQUE");
    console.log("====================================");

    console.table(tabelaVerdadeVenda());
}

// Execução direta do arquivo
if (require.main === module) {
    exibirTabelasVerdade();
}

// ======================================================
// Exportação das funções
// ======================================================

module.exports = {
    conjuncao,
    disjuncao,
    negacao,
    implicacao,
    equivalencia,
    tabelaVerdadeAcesso,
    tabelaVerdadeVenda,
    exibirTabelasVerdade
};
