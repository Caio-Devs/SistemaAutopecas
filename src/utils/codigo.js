// =====================================================================
// Código mostrado na tela.
// O banco identifica o produto pelo id_produto (número). Na tela, o
// código aparece como P001, P002... (produtos físicos) e S007, S008...
// (serviços). A chave da Árvore AVL é sempre o id_produto.
// =====================================================================

function formatarCodigo(idProduto, tipo) {
    const prefixo = tipo === "SERVICO" ? "S" : "P";
    return prefixo + String(idProduto).padStart(3, "0");
}

/**
 * Converte o texto digitado na pesquisa em id_produto.
 * Aceita "P001", "p1", "S007" ou só o número ("1").
 * Devolve null se o texto não for um código.
 */
function lerCodigo(texto) {
    const limpo = String(texto || "").trim();
    const encontrado = /^[PpSs]?0*(\d+)$/.exec(limpo);
    return encontrado ? Number(encontrado[1]) : null;
}

module.exports = { formatarCodigo, lerCodigo };
