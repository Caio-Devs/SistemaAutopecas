
// ======================================================
// GESTOR ÁGIL - TEORIA DA COMPUTAÇÃO
// Arquivo principal
// Projeto Integrador - SENAI FATESG
// ======================================================

const readline = require("node:readline");

const regras = require("./regrasNegocio");
const logica = require("./logicaMatematica");
const numeros = require("./teoriaNumeros");
const rsa = require("./rsa");
const testes = require("./testes");

// Interface de comunicação com o terminal

const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ======================================================
// Apresentação do sistema
// ======================================================

function exibirCabecalho() {

    console.log("\n======================================");
    console.log("           GESTOR AGIL");
    console.log("      TEORIA DA COMPUTACAO");
    console.log("======================================");
}

// ======================================================
// Regras de negócio implementadas
// ======================================================

function exibirRegrasNegocio() {

    console.log("\n--- REGRAS DE NEGOCIO ---\n");

    console.table([
        {
            Regra: "RN01",
            Descricao: "Cadastro valido de produtos",
            Funcao: "validarCadastroProduto"
        },
        {
            Regra: "RN02",
            Descricao: "Validacao dos itens e total da venda",
            Funcao: "validarVenda"
        },
        {
            Regra: "RN03",
            Descricao: "Impedir estoque negativo",
            Funcao: "validarEstoque"
        },
        {
            Regra: "RN04",
            Descricao: "Atomicidade da venda",
            Funcao: "processarVendaAtomica"
        },
        {
            Regra: "RN05",
            Descricao: "Autenticacao e autorizacao",
            Funcao: "validarAcesso"
        },
        {
            Regra: "RN12",
            Descricao: "Servicos sem baixa de estoque",
            Funcao: "validarEstoque"
        }
    ]);

    console.log("\nFuncoes disponiveis no modulo:");

    console.table(
        Object.keys(regras).map(nome => ({
            Funcao: nome,
            Disponivel:
                typeof regras[nome] === "function"
                    ? "Sim"
                    : "Nao"
        }))
    );
}

// ======================================================
// Demonstração de teoria dos números
// ======================================================

function exibirTeoriaNumeros() {

    console.log("\n--- TEORIA DOS NUMEROS ---\n");

    console.log(
        "5 e primo:",
        numeros.ehPrimo(5)
    );

    console.log(
        "11 e primo:",
        numeros.ehPrimo(11)
    );

    console.log(
        "15 e primo:",
        numeros.ehPrimo(15)
    );

    console.log(
        "MDC(3, 40):",
        numeros.mdc(3, 40).toString()
    );

    console.log(
        "MDC(36, 48):",
        numeros.mdc(36, 48).toString()
    );

    console.log(
        "3 e 40 sao coprimos:",
        numeros.relativamentePrimos(3, 40)
    );

    console.log(
        "Totiente de Euler:",
        numeros.totienteEuler(5, 11).toString()
    );

    console.log(
        "Inverso modular de 3 modulo 40:",
        numeros.inversoModular(3, 40).toString()
    );

    console.log(
        "81 congruente a 1 modulo 40:",
        numeros.congruentes(81, 1, 40)
    );

    console.log(
        "7 elevado a 3 modulo 55:",
        numeros.potenciaModular(7, 3, 55).toString()
    );
}

// ======================================================
// Demonstração de criptografia RSA
// ======================================================

function exibirRSA() {

    const resultado = rsa.demonstrarRSA();

    const chaves = resultado.chaves;

    console.log("\n--- CRIPTOGRAFIA RSA ---\n");

    console.log("P:", chaves.p.toString());
    console.log("Q:", chaves.q.toString());

    console.log(
        "N = P * Q:",
        chaves.n.toString()
    );

    console.log(
        "Totiente de Euler:",
        chaves.phi.toString()
    );

    console.log(
        "Expoente publico:",
        chaves.e.toString()
    );

    console.log(
        "Expoente privado:",
        chaves.d.toString()
    );

    console.log(
        "\nChave publica: (" +
        chaves.n + ", " +
        chaves.e + ")"
    );

    console.log(
        "Chave privada: (" +
        chaves.n + ", " +
        chaves.d + ")"
    );

    console.log(
        "\nMensagem original:",
        resultado.mensagemOriginal.toString()
    );

    console.log(
        "Mensagem criptografada:",
        resultado.mensagemCifrada.toString()
    );

    console.log(
        "Mensagem descriptografada:",
        resultado.mensagemRecuperada.toString()
    );

    console.log(
        "\nResultado:",
        resultado.sucesso
            ? "SUCESSO"
            : "FALHA"
    );

    console.log(
        "\nRSA utilizado exclusivamente para fins academicos."
    );
}

// ======================================================
// Executar todas as demonstrações
// ======================================================

function executarDemonstracoes() {

    exibirRegrasNegocio();

    logica.exibirTabelasVerdade();

    exibirTeoriaNumeros();

    exibirRSA();

    testes.executarTestes();
}

// ======================================================
// Menu principal
// ======================================================

function exibirMenu() {

    exibirCabecalho();

    console.log("1 - Regras de negocio");
    console.log("2 - Tabelas-verdade");
    console.log("3 - Teoria dos numeros");
    console.log("4 - Criptografia RSA");
    console.log("5 - Testes automatizados");
    console.log("6 - Executar todas as demonstracoes");
    console.log("0 - Sair");

    console.log("======================================");

    terminal.question(
        "Escolha uma opcao: ",
        processarOpcao
    );
}

// ======================================================
// Processamento das opções
// ======================================================

function processarOpcao(opcao) {

    try {

        switch (opcao.trim()) {

            case "1":
                exibirRegrasNegocio();
                break;

            case "2":
                logica.exibirTabelasVerdade();
                break;

            case "3":
                exibirTeoriaNumeros();
                break;

            case "4":
                exibirRSA();
                break;

            case "5":
                testes.executarTestes();
                break;

            case "6":
                executarDemonstracoes();
                break;

            case "0":

                console.log(
                    "\nPrograma encerrado."
                );

                terminal.close();

                return;

            default:

                console.log(
                    "\nOpcao invalida."
                );
        }

    } catch (erro) {

        console.log(
            "\nErro: " + erro.message
        );
    }

    terminal.question(
        "\nPressione ENTER para continuar...",
        () => exibirMenu()
    );
}

// ======================================================
// Inicialização do programa
// ======================================================

exibirMenu();
