
// ======================================================
// GESTOR ÁGIL - TEORIA DA COMPUTAÇÃO
// Teoria dos Números aplicada à criptografia
// ======================================================

// Divisibilidade
function divisivel(a, b) {
    a = BigInt(a);
    b = BigInt(b);

    if (b === 0n) {
        return false;
    }

    return a % b === 0n;
}

// ======================================================
// Verificação de números primos
// ======================================================

function ehPrimo(numero) {

    const n = BigInt(numero);

    if (n < 2n) {
        return false;
    }

    for (let i = 2n; i * i <= n; i++) {

        if (n % i === 0n) {
            return false;
        }
    }

    return true;
}

// ======================================================
// MDC - Algoritmo de Euclides
// ======================================================

function mdc(a, b) {

    a = BigInt(a);
    b = BigInt(b);

    if (a < 0n) a = -a;
    if (b < 0n) b = -b;

    while (b !== 0n) {

        const resto = a % b;

        a = b;
        b = resto;
    }

    return a;
}

// Verificar se dois números são relativamente primos
function relativamentePrimos(a, b) {
    return mdc(a, b) === 1n;
}

// ======================================================
// Aritmética modular
// ======================================================

function modulo(a, n) {

    a = BigInt(a);
    n = BigInt(n);

    if (n <= 0n) {
        throw new Error("O módulo deve ser positivo.");
    }

    return ((a % n) + n) % n;
}

// Congruência modular: a ≡ b (mod n)
function congruentes(a, b, n) {

    return modulo(
        BigInt(a) - BigInt(b),
        n
    ) === 0n;
}

// ======================================================
// Função totiente de Euler
// Para dois números primos distintos
// φ(n) = (p - 1) * (q - 1)
// ======================================================

function totienteEuler(p, q) {

    p = BigInt(p);
    q = BigInt(q);

    if (!ehPrimo(p) || !ehPrimo(q) || p === q) {
        throw new Error(
            "Os valores devem ser primos distintos."
        );
    }

    return (p - 1n) * (q - 1n);
}

// ======================================================
// Algoritmo de Euclides Estendido
// ======================================================

function euclidesEstendido(a, b) {

    a = BigInt(a);
    b = BigInt(b);

    if (b === 0n) {

        return {
            mdc: a < 0n ? -a : a,
            x: a < 0n ? -1n : 1n,
            y: 0n
        };
    }

    const resultado = euclidesEstendido(
        b,
        a % b
    );

    return {
        mdc: resultado.mdc,
        x: resultado.y,
        y: resultado.x -
            (a / b) * resultado.y
    };
}

// ======================================================
// Inverso modular
// Encontrar d tal que: e * d ≡ 1 (mod n)
// ======================================================

function inversoModular(a, n) {

    a = BigInt(a);
    n = BigInt(n);

    if (n <= 1n) {
        throw new Error("Módulo inválido.");
    }

    const resultado = euclidesEstendido(a, n);

    if (resultado.mdc !== 1n) {

        throw new Error(
            "O inverso modular não existe."
        );
    }

    return modulo(resultado.x, n);
}

// ======================================================
// Exponenciação modular
// Calcular: base^expoente mod n
// ======================================================

function potenciaModular(base, expoente, n) {

    base = BigInt(base);
    expoente = BigInt(expoente);
    n = BigInt(n);

    if (n <= 0n || expoente < 0n) {

        throw new Error(
            "Módulo ou expoente inválido."
        );
    }

    let resultado = 1n % n;

    base = modulo(base, n);

    while (expoente > 0n) {

        if (expoente % 2n === 1n) {

            resultado =
                (resultado * base) % n;
        }

        expoente = expoente / 2n;

        base = (base * base) % n;
    }

    return resultado;
}

// ======================================================
// Exportação das funções
// ======================================================

module.exports = {
    divisivel,
    ehPrimo,
    mdc,
    relativamentePrimos,
    modulo,
    congruentes,
    totienteEuler,
    euclidesEstendido,
    inversoModular,
    potenciaModular
};
