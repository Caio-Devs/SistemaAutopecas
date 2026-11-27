
// ======================================================
// GESTOR ÁGIL - TEORIA DA COMPUTAÇÃO
// Testes automatizados
// ======================================================

const assert = require("node:assert/strict");

const logica = require("./logicaMatematica");
const numeros = require("./teoriaNumeros");
const rsa = require("./rsa");
const regras = require("./regrasNegocio");

let aprovados = 0;
let reprovados = 0;

// ======================================================
// Função auxiliar para executar testes
// ======================================================

function testar(nome, funcao) {

    try {

        funcao();

        aprovados++;

        console.log("[OK] " + nome);

    } catch (erro) {

        reprovados++;

        console.log("[ERRO] " + nome);
        console.log("       " + erro.message);
    }
}

// ======================================================
// TESTES DE LÓGICA MATEMÁTICA
// ======================================================

function testarLogica() {

    console.log("\n--- LOGICA MATEMATICA ---");

    testar("Conjuncao verdadeira", () => {
        assert.equal(
            logica.conjuncao(true, true),
            true
        );
    });

    testar("Conjuncao falsa", () => {
        assert.equal(
            logica.conjuncao(true, false),
            false
        );
    });

    testar("Disjuncao", () => {
        assert.equal(
            logica.disjuncao(false, true),
            true
        );
    });

    testar("Negacao", () => {
        assert.equal(
            logica.negacao(true),
            false
        );
    });

    testar("Implicacao falsa", () => {
        assert.equal(
            logica.implicacao(true, false),
            false
        );
    });

    testar("Implicacao verdadeira", () => {
        assert.equal(
            logica.implicacao(false, true),
            true
        );
    });

    testar("Equivalencia", () => {
        assert.equal(
            logica.equivalencia(true, true),
            true
        );
    });

    testar("Tabela-verdade de acesso", () => {

        const tabela =
            logica.tabelaVerdadeAcesso();

        assert.equal(tabela.length, 4);

        assert.deepEqual(
            tabela.map(linha => linha["A ∧ P"]),
            ["V", "F", "F", "F"]
        );
    });

    testar("Tabela-verdade de venda", () => {

        const tabela =
            logica.tabelaVerdadeVenda();

        assert.equal(tabela.length, 8);

        assert.deepEqual(
            tabela.map(linha => linha["I ∧ Q ∧ E"]),
            ["V", "F", "F", "F", "F", "F", "F", "F"]
        );
    });
}

// ======================================================
// TESTES DE TEORIA DOS NÚMEROS
// ======================================================

function testarTeoriaNumeros() {

    console.log("\n--- TEORIA DOS NUMEROS ---");

    testar("Divisibilidade", () => {
        assert.equal(
            numeros.divisivel(20, 5),
            true
        );
    });

    testar("Numero primo 5", () => {
        assert.equal(
            numeros.ehPrimo(5),
            true
        );
    });

    testar("Numero primo 11", () => {
        assert.equal(
            numeros.ehPrimo(11),
            true
        );
    });

    testar("Numero composto 15", () => {
        assert.equal(
            numeros.ehPrimo(15),
            false
        );
    });

    testar("Numero 1 nao e primo", () => {
        assert.equal(
            numeros.ehPrimo(1),
            false
        );
    });

    testar("MDC de 3 e 40", () => {
        assert.equal(
            numeros.mdc(3, 40),
            1n
        );
    });

    testar("MDC de 36 e 48", () => {
        assert.equal(
            numeros.mdc(36, 48),
            12n
        );
    });

    testar("Numeros relativamente primos", () => {
        assert.equal(
            numeros.relativamentePrimos(3, 40),
            true
        );
    });

    testar("Congruencia modular", () => {
        assert.equal(
            numeros.congruentes(81, 1, 40),
            true
        );
    });

    testar("Modulo negativo", () => {
        assert.equal(
            numeros.modulo(-7, 5),
            3n
        );
    });

    testar("Totiente de Euler", () => {
        assert.equal(
            numeros.totienteEuler(5, 11),
            40n
        );
    });

    testar("Inverso modular", () => {
        assert.equal(
            numeros.inversoModular(3, 40),
            27n
        );
    });

    testar("Rejeitar inverso inexistente", () => {
        assert.throws(() => {
            numeros.inversoModular(2, 40);
        });
    });

    testar("Exponenciacao modular", () => {
        assert.equal(
            numeros.potenciaModular(7, 3, 55),
            13n
        );
    });
}

// ======================================================
// TESTES DE CRIPTOGRAFIA RSA
// ======================================================

function testarRSA() {

    console.log("\n--- CRIPTOGRAFIA RSA ---");

    const chaves = rsa.gerarChavesRSA(
        5,
        11,
        3
    );

    testar("Calculo de n", () => {
        assert.equal(chaves.n, 55n);
    });

    testar("Calculo de phi", () => {
        assert.equal(chaves.phi, 40n);
    });

    testar("Chave publica", () => {
        assert.deepEqual(
            chaves.chavePublica,
            {
                n: 55n,
                e: 3n
            }
        );
    });

    testar("Chave privada", () => {
        assert.deepEqual(
            chaves.chavePrivada,
            {
                n: 55n,
                d: 27n
            }
        );
    });

    testar("Criptografar mensagem 7", () => {

        const resultado =
            rsa.criptografarRSA(
                7,
                chaves.chavePublica
            );

        assert.equal(resultado, 13n);
    });

    testar("Descriptografar mensagem 13", () => {

        const resultado =
            rsa.descriptografarRSA(
                13,
                chaves.chavePrivada
            );

        assert.equal(resultado, 7n);
    });

    testar("Demonstracao completa do relatorio", () => {

        const resultado = rsa.demonstrarRSA();

        assert.equal(resultado.sucesso, true);

        assert.equal(
            resultado.mensagemOriginal,
            resultado.mensagemRecuperada
        );
    });

    testar("Rejeitar numeros nao primos", () => {

        assert.throws(() => {
            rsa.gerarChavesRSA(4, 11, 3);
        });
    });

    testar("Rejeitar primos iguais", () => {

        assert.throws(() => {
            rsa.gerarChavesRSA(5, 5, 3);
        });
    });

    testar("Rejeitar expoente invalido", () => {

        assert.throws(() => {
            rsa.gerarChavesRSA(5, 11, 2);
        });
    });

    testar("Rejeitar mensagem fora do limite", () => {

        assert.throws(() => {
            rsa.criptografarRSA(
                55,
                chaves.chavePublica
            );
        });
    });

    testar("Validar todas as mensagens de 0 a 54", () => {

        for (let m = 0n; m < chaves.n; m++) {

            const cifrada =
                rsa.criptografarRSA(
                    m,
                    chaves.chavePublica
                );

            const recuperada =
                rsa.descriptografarRSA(
                    cifrada,
                    chaves.chavePrivada
                );

            assert.equal(recuperada, m);
        }
    });
}

// ======================================================
// TESTES DAS REGRAS DE NEGÓCIO
// ======================================================

function testarRegrasNegocio() {

    console.log("\n--- REGRAS DE NEGOCIO ---");

    // Dados simulados do Gestor Ágil

    const categorias = [
        "Filtros",
        "Freios",
        "Motor",
        "Eletrica",
        "Suspensao"
    ];

    const catalogo = [
        {
            codigo: "P001",
            descricao: "Filtro de oleo",
            categoria: "Filtros",
            tipo: "produto",
            preco: 35.90,
            estoque: 25
        },
        {
            codigo: "P002",
            descricao: "Pastilha de freio",
            categoria: "Freios",
            tipo: "produto",
            preco: 89.90,
            estoque: 3
        },
        {
            codigo: "S001",
            descricao: "Troca de oleo",
            categoria: "Motor",
            tipo: "servico",
            preco: 50
        }
    ];

    const produtoNovo = {
        codigo: "P003",
        descricao: "Correia dentada",
        categoria: "Motor",
        preco: 129.90
    };

    const administrador = {
        perfil: "administrador",
        autenticado: true,
        ativo: true
    };

    const operador = {
        perfil: "operador",
        autenticado: true,
        ativo: true
    };

    const vendaValida = {
        codigo: "V001",
        itens: [
            {
                codigo: "P001",
                quantidade: 2,
                precoUnitario: 35.90
            },
            {
                codigo: "P002",
                quantidade: 1,
                precoUnitario: 89.90
            },
            {
                codigo: "S001",
                quantidade: 1,
                precoUnitario: 50
            }
        ],
        total: 211.70
    };

    // ==================================================
    // RN01 - Cadastro de produtos
    // ==================================================

    testar("RN01 - Cadastro valido", () => {
        const resultado = regras.validarCadastroProduto(
            produtoNovo, catalogo, categorias
        );

        assert.equal(resultado.valido, true);
    });

    testar("RN01 - Codigo duplicado", () => {
        const resultado = regras.validarCadastroProduto(
            { ...produtoNovo, codigo: "P001" },
            catalogo,
            categorias
        );

        assert.equal(resultado.valido, false);
        assert.equal(resultado.condicoes.U, false);
    });

    testar("RN01 - Codigo vazio", () => {
        const resultado = regras.validarCadastroProduto(
            { ...produtoNovo, codigo: "" },
            catalogo,
            categorias
        );

        assert.equal(resultado.valido, false);
    });

    testar("RN01 - Descricao vazia", () => {
        const resultado = regras.validarCadastroProduto(
            { ...produtoNovo, descricao: "" },
            catalogo,
            categorias
        );

        assert.equal(resultado.valido, false);
        assert.equal(resultado.condicoes.D, false);
    });

    testar("RN01 - Categoria invalida", () => {
        const resultado = regras.validarCadastroProduto(
            { ...produtoNovo, categoria: "Inexistente" },
            catalogo,
            categorias
        );

        assert.equal(resultado.valido, false);
        assert.equal(resultado.condicoes.K, false);
    });

    testar("RN01 - Preco negativo", () => {
        const resultado = regras.validarCadastroProduto(
            { ...produtoNovo, preco: -10 },
            catalogo,
            categorias
        );

        assert.equal(resultado.valido, false);
        assert.equal(resultado.condicoes.P, false);
    });

    testar("RN01 - Preco zero permitido", () => {
        const resultado = regras.validarCadastroProduto(
            { ...produtoNovo, preco: 0 },
            catalogo,
            categorias
        );

        assert.equal(resultado.valido, true);
    });

    // ==================================================
    // RN02 - Validação de vendas
    // ==================================================

    testar("RN02 - Venda valida", () => {
        const resultado = regras.validarVenda(vendaValida);

        assert.equal(resultado.valido, true);
        assert.equal(resultado.totalCalculado, 211.70);
    });

    testar("RN02 - Venda sem itens", () => {
        const resultado = regras.validarVenda({
            itens: [],
            total: 0
        });

        assert.equal(resultado.valido, false);
    });

    testar("RN02 - Total incorreto", () => {
        const resultado = regras.validarVenda({
            ...vendaValida,
            total: 100
        });

        assert.equal(resultado.valido, false);
    });

    testar("RN02 - Quantidade negativa", () => {
        const resultado = regras.validarVenda({
            itens: [
                {
                    codigo: "P001",
                    quantidade: -1,
                    precoUnitario: 35.90
                }
            ],
            total: 0
        });

        assert.equal(resultado.valido, false);
    });

    testar("RN02 - Preco unitario negativo", () => {
        const resultado = regras.validarVenda({
            itens: [
                {
                    codigo: "P001",
                    quantidade: 1,
                    precoUnitario: -10
                }
            ],
            total: -10
        });

        assert.equal(resultado.valido, false);
    });

    // ==================================================
    // RN03 - Controle de estoque
    // ==================================================

    testar("RN03 - Estoque suficiente", () => {
        const resultado = regras.validarEstoque(
            vendaValida,
            catalogo
        );

        assert.equal(resultado.valido, true);
        assert.equal(resultado.movimentacoes.length, 2);

        assert.equal(
            resultado.movimentacoes[0].saldoFinal,
            23
        );

        assert.equal(
            resultado.movimentacoes[1].saldoFinal,
            2
        );
    });

    testar("RN03 - Estoque insuficiente", () => {
        const resultado = regras.validarEstoque({
            itens: [
                {
                    codigo: "P002",
                    quantidade: 4
                }
            ]
        }, catalogo);

        assert.equal(resultado.valido, false);
        assert.equal(resultado.movimentacoes.length, 0);
    });

    testar("RN03 - Estoque final igual a zero", () => {
        const resultado = regras.validarEstoque({
            itens: [
                {
                    codigo: "P002",
                    quantidade: 3
                }
            ]
        }, catalogo);

        assert.equal(resultado.valido, true);
        assert.equal(
            resultado.movimentacoes[0].saldoFinal,
            0
        );
    });

    testar("RN03 - Quantidade zero", () => {
        const resultado = regras.validarEstoque({
            itens: [
                {
                    codigo: "P002",
                    quantidade: 0
                }
            ]
        }, catalogo);

        assert.equal(resultado.valido, false);
    });

    testar("RN03 - Produto inexistente", () => {
        const resultado = regras.validarEstoque({
            itens: [
                {
                    codigo: "P999",
                    quantidade: 1
                }
            ]
        }, catalogo);

        assert.equal(resultado.valido, false);
    });

    testar("RN03 - Produtos repetidos acima do estoque", () => {
        const resultado = regras.validarEstoque({
            itens: [
                { codigo: "P002", quantidade: 2 },
                { codigo: "P002", quantidade: 2 }
            ]
        }, catalogo);

        assert.equal(resultado.valido, false);
    });

    // ==================================================
    // RN04 - Atomicidade
    // ==================================================

    testar("RN04 - COMMIT da venda", () => {

        const resultado = regras.processarVendaAtomica(
            vendaValida,
            catalogo,
            []
        );

        assert.equal(resultado.valido, true);
        assert.equal(resultado.transacao, "COMMIT");
        assert.equal(resultado.vendaConfirmada, true);
        assert.equal(resultado.baixaConfirmada, true);
        assert.equal(resultado.vendas.length, 1);
        assert.equal(resultado.catalogo[0].estoque, 23);
        assert.equal(resultado.catalogo[1].estoque, 2);

        // Os dados originais devem permanecer intactos
        assert.equal(catalogo[0].estoque, 25);
        assert.equal(catalogo[1].estoque, 3);
    });

    testar("RN04 - ROLLBACK por falha simulada", () => {

        const resultado = regras.processarVendaAtomica(
            vendaValida,
            catalogo,
            [],
            true
        );

        assert.equal(resultado.valido, false);
        assert.equal(resultado.transacao, "ROLLBACK");
        assert.equal(resultado.vendaConfirmada, false);
        assert.equal(resultado.baixaConfirmada, false);
        assert.equal(resultado.vendas.length, 0);
        assert.deepEqual(resultado.catalogo, catalogo);
    });

    testar("RN04 - ROLLBACK por venda invalida", () => {

        const resultado = regras.processarVendaAtomica(
            { itens: [], total: 0 },
            catalogo,
            []
        );

        assert.equal(resultado.transacao, "ROLLBACK");
        assert.equal(resultado.vendas.length, 0);
        assert.deepEqual(resultado.catalogo, catalogo);
    });

    testar("RN04 - ROLLBACK por estoque insuficiente", () => {

        const resultado = regras.processarVendaAtomica(
            {
                itens: [
                    {
                        codigo: "P002",
                        quantidade: 4,
                        precoUnitario: 89.90
                    }
                ],
                total: 359.60
            },
            catalogo,
            []
        );

        assert.equal(resultado.transacao, "ROLLBACK");
        assert.equal(resultado.vendas.length, 0);
        assert.deepEqual(resultado.catalogo, catalogo);
    });

    // ==================================================
    // RN05 - Autenticação e autorização
    // ==================================================

    testar("RN05 - Administrador autorizado", () => {
        const resultado = regras.validarAcesso(
            administrador,
            "alterar_preco"
        );

        assert.equal(resultado.valido, true);
    });

    testar("RN05 - Operador autorizado para vendas", () => {
        const resultado = regras.validarAcesso(
            operador,
            "registrar_venda"
        );

        assert.equal(resultado.valido, true);
    });

    testar("RN05 - Operador sem permissao", () => {
        const resultado = regras.validarAcesso(
            operador,
            "alterar_preco"
        );

        assert.equal(resultado.valido, false);
    });

    testar("RN05 - Usuario nao autenticado", () => {
        const resultado = regras.validarAcesso(
            { ...administrador, autenticado: false },
            "alterar_preco"
        );

        assert.equal(resultado.valido, false);
    });

    testar("RN05 - Usuario inativo", () => {
        const resultado = regras.validarAcesso(
            { ...administrador, ativo: false },
            "alterar_preco"
        );

        assert.equal(resultado.valido, false);
    });

    testar("RN05 - Perfil desconhecido", () => {
        const resultado = regras.validarAcesso(
            { ...operador, perfil: "desconhecido" },
            "registrar_venda"
        );

        assert.equal(resultado.valido, false);
    });

    testar("RN05 - Venda autorizada", () => {

        const resultado = regras.registrarVenda(
            operador,
            vendaValida,
            catalogo,
            []
        );

        assert.equal(resultado.transacao, "COMMIT");
        assert.equal(resultado.valido, true);
    });

    testar("RN05 - Venda bloqueada sem autenticacao", () => {

        const resultado = regras.registrarVenda(
            { ...operador, autenticado: false },
            vendaValida,
            catalogo,
            []
        );

        assert.equal(resultado.transacao, "NEGADA");
        assert.equal(resultado.valido, false);
        assert.equal(resultado.vendas.length, 0);
        assert.deepEqual(resultado.catalogo, catalogo);
    });

    // ==================================================
    // RN12 - Serviços sem baixa de estoque
    // ==================================================

    testar("RN12 - Servico sem movimentacao", () => {

        const resultado = regras.validarEstoque({
            itens: [
                {
                    codigo: "S001",
                    quantidade: 1
                }
            ]
        }, catalogo);

        assert.equal(resultado.valido, true);
        assert.equal(resultado.movimentacoes.length, 0);
    });

    testar("RN12 - Venda exclusivamente de servico", () => {

        const resultado = regras.registrarVenda(
            operador,
            {
                itens: [
                    {
                        codigo: "S001",
                        quantidade: 1,
                        precoUnitario: 50
                    }
                ],
                total: 50
            },
            catalogo,
            []
        );

        assert.equal(resultado.transacao, "COMMIT");
        assert.equal(resultado.vendaConfirmada, true);
        assert.equal(resultado.baixaConfirmada, false);
        assert.deepEqual(resultado.catalogo, catalogo);
    });

    testar("RN12 - Servico com quantidade invalida", () => {

        const resultado = regras.validarEstoque({
            itens: [
                {
                    codigo: "S001",
                    quantidade: 0
                }
            ]
        }, catalogo);

        assert.equal(resultado.valido, false);
    });
}

// ======================================================
// EXECUÇÃO DOS TESTES
// ======================================================

function executarTestes() {

    aprovados = 0;
    reprovados = 0;

    console.log("====================================");
    console.log("GESTOR AGIL - TESTES AUTOMATIZADOS");
    console.log("====================================");

  testarRegrasNegocio();
testarLogica();
testarTeoriaNumeros();
testarRSA();

    const total = aprovados + reprovados;

    console.log("\n====================================");
    console.log("RESULTADO FINAL");
    console.log("====================================");

    console.log("Total: " + total);
    console.log("Aprovados: " + aprovados);
    console.log("Reprovados: " + reprovados);

    console.log(
        "Aproveitamento: " +
        ((aprovados / total) * 100).toFixed(2) +
        "%"
    );

    return {
        total,
        aprovados,
        reprovados
    };
}

if (require.main === module) {

    const resultado = executarTestes();

    process.exitCode =
        resultado.reprovados > 0 ? 1 : 0;
}

module.exports = {
    executarTestes
};
