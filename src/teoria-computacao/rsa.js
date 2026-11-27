
// ======================================================
// GESTOR ÁGIL - TEORIA DA COMPUTAÇÃO
// Algoritmo RSA - Demonstração acadêmica
// ======================================================

const {
    ehPrimo,
    mdc,
    totienteEuler,
    inversoModular,
    potenciaModular
} = require("./teoriaNumeros");

// ======================================================
// Geração das chaves RSA
// ======================================================

function gerarChavesRSA(p, q, e) {

    p = BigInt(p);
    q = BigInt(q);
    e = BigInt(e);

    // Validar números primos

    if (!ehPrimo(p) || !ehPrimo(q)) {
        throw new Error(
            "P e Q devem ser números primos."
        );
    }

    if (p === q) {
        throw new Error(
            "Os números primos devem ser distintos."
        );
    }

    // Calcular n = p * q

    const n = p * q;

    // Calcular o totiente de Euler

    const phi = totienteEuler(p, q);

    // Validar o expoente público

    if (e <= 1n || e >= phi) {
        throw new Error(
            "O expoente público deve estar entre 1 e phi."
        );
    }

    // Verificar se MDC(e, phi) = 1

    if (mdc(e, phi) !== 1n) {
        throw new Error(
            "O expoente público e phi devem ser coprimos."
        );
    }

    // Calcular o expoente privado

    const d = inversoModular(e, phi);

    return {
        p,
        q,
        n,
        phi,
        e,
        d,

        chavePublica: {
            n,
            e
        },

        chavePrivada: {
            n,
            d
        }
    };
}

// ======================================================
// Criptografia RSA
// Fórmula: C = m^e mod n
// ======================================================

function criptografarRSA(mensagem, chavePublica) {

    const m = BigInt(mensagem);

    const n = BigInt(chavePublica.n);
    const e = BigInt(chavePublica.e);

    if (n <= 1n || e <= 0n) {
        throw new Error("Chave pública inválida.");
    }

    if (m < 0n || m >= n) {
        throw new Error(
            "A mensagem deve ser maior ou igual a zero e menor que n."
        );
    }

    return potenciaModular(m, e, n);
}

// ======================================================
// Descriptografia RSA
// Fórmula: m = C^d mod n
// ======================================================

function descriptografarRSA(
    mensagemCifrada,
    chavePrivada
) {

    const c = BigInt(mensagemCifrada);

    const n = BigInt(chavePrivada.n);
    const d = BigInt(chavePrivada.d);

    if (n <= 1n || d <= 0n) {
        throw new Error("Chave privada inválida.");
    }

    if (c < 0n || c >= n) {
        throw new Error(
            "Mensagem cifrada inválida."
        );
    }

    return potenciaModular(c, d, n);
}

// ======================================================
// Demonstração conforme o relatório acadêmico
// ======================================================

function demonstrarRSA() {

    // Valores apresentados no relatório

    const p = 5n;
    const q = 11n;
    const e = 3n;

    // Identificador fictício de pedido

    const mensagemOriginal = 7n;

    // Gerar chaves

    const chaves = gerarChavesRSA(p, q, e);

    // Criptografar mensagem

    const mensagemCifrada = criptografarRSA(
        mensagemOriginal,
        chaves.chavePublica
    );

    // Descriptografar mensagem

    const mensagemRecuperada = descriptografarRSA(
        mensagemCifrada,
        chaves.chavePrivada
    );

    // Verificar integridade da demonstração

    const sucesso =
        mensagemOriginal === mensagemRecuperada;

    return {
        chaves,
        mensagemOriginal,
        mensagemCifrada,
        mensagemRecuperada,
        sucesso
    };
}

// ======================================================
// Exportação das funções
// ======================================================

module.exports = {
    gerarChavesRSA,
    criptografarRSA,
    descriptografarRSA,
    demonstrarRSA
};
