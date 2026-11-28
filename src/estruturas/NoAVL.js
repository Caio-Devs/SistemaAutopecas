// =====================================================================
// Nó da Árvore AVL
// Cada nó representa um produto do estoque.
// A chave do nó é o id_produto (código do produto).
// =====================================================================

class NoAVL {
    /**
     * @param {object} produto dados do produto vindos do banco
     */
    constructor(produto) {
        this.produto = produto;   // dados do produto (descrição, preço, estoque...)
        this.altura = 1;          // um nó sozinho (folha) tem altura 1
        this.esquerda = null;     // filho com código menor
        this.direita = null;      // filho com código maior
    }

    /** Chave usada para ordenar a árvore. */
    get chave() {
        return this.produto.idProduto;
    }
}

module.exports = NoAVL;
