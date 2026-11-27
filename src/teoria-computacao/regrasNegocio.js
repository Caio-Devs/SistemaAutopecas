
/*
 * Projeto Integrador - Gestor Ágil
 * Disciplina: Teoria da Computação
 * Módulo: Regras de Negócio
 */

// ======================================================
// RN01 - Validação do cadastro de produtos
// ======================================================

function validarCadastroProduto(
    produto,
    produtosCadastrados,
    categoriasValidas
) {

    // U: Identificador único
    const U =
        typeof produto.codigo === "string" &&
        produto.codigo.trim() !== "" &&
        !produtosCadastrados.some(
            p => p.codigo === produto.codigo
        );

    // D: Descrição preenchida
    const D =
        typeof produto.descricao === "string" &&
        produto.descricao.trim() !== "";

    // K: Categoria válida
    const K = categoriasValidas.includes(
        produto.categoria
    );

    // P: Preço maior ou igual a zero
    const P =
        Number.isFinite(produto.preco) &&
        produto.preco >= 0;

    // Conjunção lógica: U ∧ D ∧ K ∧ P
    const cadastroValido = U && D && K && P;

    const erros = [];

    if (!U) {
        erros.push("Identificador inválido ou duplicado.");
    }

    if (!D) {
        erros.push("Descrição obrigatória.");
    }

    if (!K) {
        erros.push("Categoria inválida.");
    }

    if (!P) {
        erros.push("O preço deve ser maior ou igual a zero.");
    }

    return {
        regra: "RN01",
        valido: cadastroValido,
        condicoes: { U, D, K, P },
        erros
    };
}


// ======================================================
// RN02 - Validação dos itens e total da venda
// ======================================================

function validarVenda(venda) {

    // I: A venda possui pelo menos um item
    const I =
        Array.isArray(venda.itens) &&
        venda.itens.length >= 1;

    const erros = [];

    if (!I) {
        return {
            regra: "RN02",
            valido: false,
            totalCalculado: 0,
            erros: ["A venda deve possuir pelo menos um item."]
        };
    }

    // Validação dos dados utilizados no cálculo
    const itensValidos = venda.itens.every(item =>
        Number.isSafeInteger(item.quantidade) &&
        item.quantidade > 0 &&
        Number.isFinite(item.precoUnitario) &&
        item.precoUnitario >= 0
    );

    if (!itensValidos) {
        return {
            regra: "RN02",
            valido: false,
            erros: ["Existem itens com valores inválidos."]
        };
    }

    // Somatório dos subtotais em centavos
    const totalCentavos = venda.itens.reduce(
        (total, item) =>
            total +
            item.quantidade *
            Math.round(item.precoUnitario * 100),
        0
    );

    const totalCalculado = totalCentavos / 100;

    // T: Total informado corresponde ao calculado
    const T =
        Number.isFinite(venda.total) &&
        venda.total >= 0 &&
        Math.round(venda.total * 100) === totalCentavos;

    if (!T) {
        erros.push(
            "O total informado não corresponde à soma dos itens."
        );
    }

    // Conjunção lógica: I ∧ T
    const vendaValida = I && T;

    return {
        regra: "RN02",
        valido: vendaValida,
        totalCalculado,
        condicoes: { I, T },
        erros
    };
}


// ======================================================
// RN03 e RN12 - Validação de quantidade e estoque
// ======================================================

function validarEstoque(venda, catalogo) {

    const erros = [];
    const quantidades = new Map();
    const movimentacoes = [];

    // I: A venda possui itens
    const I =
        Array.isArray(venda.itens) &&
        venda.itens.length > 0;

    if (!I) {
        return {
            regra: "RN03/RN12",
            valido: false,
            movimentacoes: [],
            erros: ["A venda não possui itens."]
        };
    }

    // Q: Todas as quantidades são positivas
    const Q = venda.itens.every(item =>
        Number.isSafeInteger(item.quantidade) &&
        item.quantidade > 0
    );

    if (!Q) {
        erros.push("Todas as quantidades devem ser positivas.");
    }

    // Verificar os itens da venda
    for (const item of venda.itens) {

        const produto = catalogo.find(
            p => p.codigo === item.codigo
        );

        if (!produto) {
            erros.push(
                `Item ${item.codigo} não encontrado.`
            );
            continue;
        }

        if (
            !Number.isSafeInteger(item.quantidade) ||
            item.quantidade <= 0
        ) {
            continue;
        }

        // RN12: Serviços não movimentam estoque
        if (produto.tipo === "servico") {
            continue;
        }

        if (produto.tipo !== "produto") {
            erros.push(
                `Tipo inválido para ${item.codigo}.`
            );
            continue;
        }

        // Somar linhas repetidas do mesmo produto
        const quantidadeAnterior =
            quantidades.get(item.codigo) || 0;

        quantidades.set(
            item.codigo,
            quantidadeAnterior + item.quantidade
        );
    }

    // E: Estoque suficiente
    let E = true;

    for (const [codigo, quantidade] of quantidades) {

        const produto = catalogo.find(
            p => p.codigo === codigo
        );

        const estoqueAtual = produto.estoque;

        if (
            !Number.isSafeInteger(estoqueAtual) ||
            estoqueAtual < 0 ||
            !Number.isSafeInteger(quantidade)
        ) {
            E = false;
            erros.push(`Estoque inválido: ${codigo}.`);
            continue;
        }

        const saldoFinal = estoqueAtual - quantidade;

        // RN03: O saldo não pode ficar negativo
        if (saldoFinal < 0) {

            E = false;

            erros.push(
                `Estoque insuficiente para ${codigo}. ` +
                `Disponível: ${estoqueAtual}. ` +
                `Solicitado: ${quantidade}.`
            );

        } else {

            movimentacoes.push({
                codigo,
                estoqueAnterior: estoqueAtual,
                quantidadeSaida: quantidade,
                saldoFinal
            });
        }
    }

    // Conjunção lógica: I ∧ Q ∧ E
    const valido = I && Q && E && erros.length === 0;

    return {
        regra: "RN03/RN12",
        valido,
        condicoes: { I, Q, E },
        movimentacoes: valido ? movimentacoes : [],
        erros
    };
}


// ======================================================
// RN04 - Atomicidade da venda
// ======================================================

function processarVendaAtomica(
    venda,
    catalogo,
    vendas,
    simularFalha = false
) {

    // Preservar o estado original
    const catalogoOriginal = structuredClone(catalogo);
    const vendasOriginais = structuredClone(vendas);

    try {

        // Validar RN02
        const resultadoVenda = validarVenda(venda);

        if (!resultadoVenda.valido) {
            throw new Error(
                resultadoVenda.erros.join(" ")
            );
        }

        // Validar RN03 e RN12
        const resultadoEstoque = validarEstoque(
            venda,
            catalogo
        );

        if (!resultadoEstoque.valido) {
            throw new Error(
                resultadoEstoque.erros.join(" ")
            );
        }

        // BEGIN - Início da transação simulada
        const catalogoTemporario =
            structuredClone(catalogo);

        const vendasTemporarias =
            structuredClone(vendas);

        // Registrar a venda temporariamente
        vendasTemporarias.push({
            ...structuredClone(venda),
            status: "concluida"
        });

        // Aplicar as baixas de estoque
        for (const movimento of
            resultadoEstoque.movimentacoes) {

            const produto = catalogoTemporario.find(
                p => p.codigo === movimento.codigo
            );

            produto.estoque = movimento.saldoFinal;
        }

        // Simular uma falha antes do COMMIT
        if (simularFalha) {
            throw new Error(
                "Falha simulada durante a transação."
            );
        }

        // COMMIT - Confirmar o novo estado
        return {
            regra: "RN04",
            valido: true,
            transacao: "COMMIT",
            vendaConfirmada: true,
            baixaConfirmada:
                resultadoEstoque.movimentacoes.length > 0,
            catalogo: catalogoTemporario,
            vendas: vendasTemporarias,
            mensagem: "Venda concluída com sucesso."
        };

    } catch (erro) {

        // ROLLBACK - Preservar o estado original
        return {
            regra: "RN04",
            valido: false,
            transacao: "ROLLBACK",
            vendaConfirmada: false,
            baixaConfirmada: false,
            catalogo: catalogoOriginal,
            vendas: vendasOriginais,
            mensagem: erro.message
        };
    }
}


// ======================================================
// RN05 - Autenticação e autorização
// ======================================================

const permissoes = {

    administrador: [
        "consultar_produtos",
        "consultar_estoque",
        "registrar_venda",
        "consultar_clientes",
        "cadastrar_produto",
        "alterar_preco",
        "movimentar_estoque",
        "gerenciar_funcionarios",
        "gerenciar_despesas",
        "consultar_relatorios",
        "alterar_configuracoes"
    ],

    operador: [
        "consultar_produtos",
        "consultar_estoque",
        "registrar_venda",
        "consultar_clientes"
    ]
};

function validarAcesso(usuario, acao) {

    // A: Usuário autenticado e ativo
    const A =
        usuario?.autenticado === true &&
        usuario?.ativo === true;

    // Identificar as permissões do perfil
    const perfil = usuario?.perfil;

    const acoesPermitidas =
        Object.hasOwn(permissoes, perfil)
            ? permissoes[perfil]
            : [];

    // P: Usuário autorizado para a ação
    const P = acoesPermitidas.includes(acao);

    // Conjunção lógica: A ∧ P
    const L = A && P;

    const erros = [];

    if (!A) {
        erros.push(
            "Usuário não autenticado ou inativo."
        );
    }

    if (!P) {
        erros.push(
            "Usuário sem permissão para esta operação."
        );
    }

    return {
        regra: "RN05",
        valido: L,
        acessoPermitido: L,
        condicoes: { A, P, L },
        perfil,
        acao,
        erros
    };
}

// ======================================================
// Integração da RN05 com a RN04
// ======================================================

function registrarVenda(
    usuario,
    venda,
    catalogo,
    vendas,
    simularFalha = false
) {

    const acesso = validarAcesso(
        usuario,
        "registrar_venda"
    );

    // Impedir operações não autorizadas
    if (!acesso.valido) {

        return {
            regra: "RN05",
            valido: false,
            transacao: "NEGADA",
            vendaConfirmada: false,
            baixaConfirmada: false,
            catalogo: structuredClone(catalogo),
            vendas: structuredClone(vendas),
            mensagem: acesso.erros.join(" ")
        };
    }

    // Executar a venda após autorização
    return processarVendaAtomica(
        venda,
        catalogo,
        vendas,
        simularFalha
    );
}

// ======================================================
// Exportação das funções
// ======================================================

module.exports = {
    validarCadastroProduto,
    validarVenda,
    validarEstoque,
    processarVendaAtomica,
    validarAcesso,
    registrarVenda
};




