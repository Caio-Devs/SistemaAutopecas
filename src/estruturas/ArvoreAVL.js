// =====================================================================
// Árvore AVL de produtos (Estrutura de Dados II)
//
// Árvore binária de busca que se mantém balanceada sozinha: em cada nó,
// a altura da subárvore da esquerda e a da direita diferem em no máximo 1
// (fator de balanceamento -1, 0 ou +1). Quando uma inserção ou remoção
// quebra essa regra, a árvore faz rotações.
//
// Chave: id_produto. Os produtos vêm do banco ordenados pelo id; numa
// árvore binária comum isso viraria uma lista, mas na AVL a altura fica
// próxima de log2(n).
//
// Custos: buscar, inserir, remover e atualizar = O(log n);
//         percursos (listar, buscar por descrição, alertas) = O(n).
// =====================================================================

const NoAVL = require("./NoAVL");

class ArvoreAVL {
    constructor() {
        this.raiz = null;
        this.tamanho = 0;              // quantidade de nós
        this.ultimasComparacoes = 0;   // comparações feitas na última busca
    }

    // -----------------------------------------------------------------
    // Funções auxiliares
    // -----------------------------------------------------------------

    /** Altura de um nó (nó vazio tem altura 0). */
    alturaDe(no) {
        return no ? no.altura : 0;
    }

    /** Fator de balanceamento = altura da esquerda - altura da direita. */
    fator(no) {
        return no ? this.alturaDe(no.esquerda) - this.alturaDe(no.direita) : 0;
    }

    atualizarAltura(no) {
        no.altura = 1 + Math.max(this.alturaDe(no.esquerda), this.alturaDe(no.direita));
    }

    /** Altura da árvore inteira. */
    altura() {
        return this.alturaDe(this.raiz);
    }

    // -----------------------------------------------------------------
    // Rotações
    // -----------------------------------------------------------------

    /**
     * Rotação simples à direita (nó pesado à esquerda).
     *
     *         y                x
     *        / \              / \
     *       x   C    ==>     A   y
     *      / \                  / \
     *     A   B                B   C
     */
    rotacaoDireita(y) {
        const x = y.esquerda;
        y.esquerda = x.direita;
        x.direita = y;
        this.atualizarAltura(y);
        this.atualizarAltura(x);
        return x; // x é a nova raiz deste trecho
    }

    /**
     * Rotação simples à esquerda (nó pesado à direita).
     *
     *       x                    y
     *      / \                  / \
     *     A   y      ==>       x   C
     *        / \              / \
     *       B   C            A   B
     */
    rotacaoEsquerda(x) {
        const y = x.direita;
        x.direita = y.esquerda;
        y.esquerda = x;
        this.atualizarAltura(x);
        this.atualizarAltura(y);
        return y;
    }

    /**
     * Confere o fator de balanceamento e aplica a rotação certa.
     * Usada depois de inserir e de remover.
     */
    balancear(no) {
        const fb = this.fator(no);

        if (fb > 1) {                               // pesado à esquerda
            if (this.fator(no.esquerda) < 0) {      // caso esquerda-direita
                no.esquerda = this.rotacaoEsquerda(no.esquerda);
            }
            return this.rotacaoDireita(no);
        }

        if (fb < -1) {                              // pesado à direita
            if (this.fator(no.direita) > 0) {       // caso direita-esquerda
                no.direita = this.rotacaoDireita(no.direita);
            }
            return this.rotacaoEsquerda(no);
        }

        return no;                                  // já está balanceado
    }

    // -----------------------------------------------------------------
    // Inserção - O(log n)
    // -----------------------------------------------------------------

    /**
     * Insere um produto. Código repetido é recusado (lança erro).
     * @param {object} produto precisa ter idProduto
     */
    inserir(produto) {
        if (produto == null || !Number.isInteger(produto.idProduto)) {
            throw new Error("Produto inválido: idProduto precisa ser um número inteiro.");
        }
        this.raiz = this._inserir(this.raiz, produto);
        this.tamanho++;
    }

    _inserir(no, produto) {
        if (no === null) {
            return new NoAVL(produto);
        }

        if (produto.idProduto < no.chave) {
            no.esquerda = this._inserir(no.esquerda, produto);
        } else if (produto.idProduto > no.chave) {
            no.direita = this._inserir(no.direita, produto);
        } else {
            throw new Error(`Código já cadastrado na árvore: ${produto.idProduto}`);
        }

        this.atualizarAltura(no);
        return this.balancear(no);
    }

    // -----------------------------------------------------------------
    // Busca por código - O(log n)
    // -----------------------------------------------------------------

    /**
     * Procura o produto pelo id. Devolve o produto ou null.
     * Guarda em ultimasComparacoes quantos nós foram visitados.
     */
    buscar(idProduto) {
        let no = this.raiz;
        let comparacoes = 0;

        while (no !== null) {
            comparacoes++;
            if (idProduto === no.chave) {
                this.ultimasComparacoes = comparacoes;
                return no.produto;
            }
            no = idProduto < no.chave ? no.esquerda : no.direita;
        }

        this.ultimasComparacoes = comparacoes;
        return null;
    }

    // -----------------------------------------------------------------
    // Atualização dos dados de um nó - O(log n)
    // -----------------------------------------------------------------

    /**
     * Troca os dados do produto no nó (descrição, preço, estoque...).
     * O id não muda, então a posição do nó na árvore continua a mesma.
     * Devolve true se encontrou o produto.
     */
    atualizar(produto) {
        let no = this.raiz;
        while (no !== null) {
            if (produto.idProduto === no.chave) {
                no.produto = produto;
                return true;
            }
            no = produto.idProduto < no.chave ? no.esquerda : no.direita;
        }
        return false;
    }

    /** Atualiza só a quantidade em estoque (valor lido do banco após o commit). */
    atualizarQuantidade(idProduto, quantidadeDoBanco) {
        const produto = this.buscar(idProduto);
        if (!produto) return false;
        produto.estoqueAtual = quantidadeDoBanco;
        return true;
    }

    // -----------------------------------------------------------------
    // Remoção - O(log n)
    // -----------------------------------------------------------------

    /** Remove o produto da árvore. Devolve true se ele existia. */
    remover(idProduto) {
        const antes = this.tamanho;
        this.raiz = this._remover(this.raiz, idProduto);
        return this.tamanho < antes;
    }

    _remover(no, idProduto) {
        if (no === null) {
            return null;
        }

        if (idProduto < no.chave) {
            no.esquerda = this._remover(no.esquerda, idProduto);
        } else if (idProduto > no.chave) {
            no.direita = this._remover(no.direita, idProduto);
        } else {
            // Achou o nó. Casos com 0 ou 1 filho: o filho assume o lugar.
            if (no.esquerda === null || no.direita === null) {
                this.tamanho--;
                return no.esquerda || no.direita;
            }
            // Caso com 2 filhos: copia o sucessor (menor código à direita)
            // e remove o sucessor da subárvore direita.
            let sucessor = no.direita;
            while (sucessor.esquerda !== null) {
                sucessor = sucessor.esquerda;
            }
            no.produto = sucessor.produto;
            no.direita = this._remover(no.direita, sucessor.chave);
        }

        this.atualizarAltura(no);
        return this.balancear(no);
    }

    // -----------------------------------------------------------------
    // Percursos em ordem - O(n)
    // -----------------------------------------------------------------

    /**
     * Visita os nós em ordem crescente de código (esquerda, nó, direita).
     * Feito com pilha para não estourar a pilha de chamadas em árvores grandes.
     */
    percorrerEmOrdem(visitar) {
        const pilha = [];
        let no = this.raiz;
        while (no !== null || pilha.length > 0) {
            while (no !== null) {
                pilha.push(no);
                no = no.esquerda;
            }
            no = pilha.pop();
            visitar(no.produto);
            no = no.direita;
        }
    }

    /** Lista todos os produtos já ordenados por código. */
    listarEmOrdem() {
        const lista = [];
        this.percorrerEmOrdem((produto) => lista.push(produto));
        return lista;
    }

    /** Lista, em ordem, só os produtos que passam no filtro. */
    filtrar(condicao) {
        const lista = [];
        this.percorrerEmOrdem((produto) => {
            if (condicao(produto)) lista.push(produto);
        });
        return lista;
    }

    /** Produtos cuja descrição contém o texto (sem diferenciar maiúsculas e acentos). */
    buscarPorDescricao(texto) {
        const procurado = normalizar(texto);
        return this.filtrar((produto) => normalizar(produto.descricao).includes(procurado));
    }

    /** Produtos físicos e ativos com estoque_atual <= estoque_minimo (alerta de reposição). */
    gerarAlertas() {
        return this.filtrar(precisaRepor);
    }

    // -----------------------------------------------------------------
    // Outras operações
    // -----------------------------------------------------------------

    /** Esvazia a árvore (usado antes de reconstruir a partir do banco). */
    limpar() {
        this.raiz = null;
        this.tamanho = 0;
    }

    /** Confere se a árvore está correta: ordem das chaves, alturas e balanceamento. */
    verificar() {
        let anterior = -Infinity;
        let ordemOk = true;
        this.percorrerEmOrdem((produto) => {
            if (produto.idProduto <= anterior) ordemOk = false;
            anterior = produto.idProduto;
        });

        const conferir = (no) => {
            if (no === null) return { ok: true, altura: 0 };
            const e = conferir(no.esquerda);
            const d = conferir(no.direita);
            const altura = 1 + Math.max(e.altura, d.altura);
            const ok = e.ok && d.ok && Math.abs(e.altura - d.altura) <= 1 && no.altura === altura;
            return { ok, altura };
        };

        return ordemOk && conferir(this.raiz).ok;
    }

    /** Desenho da árvore em texto, para mostrar no terminal (só os códigos). */
    desenhar(maximoNiveis = 4) {
        const linhas = [];
        const desenharNo = (no, prefixo, ehEsquerda, nivel) => {
            if (no === null || nivel > maximoNiveis) return;
            desenharNo(no.direita, prefixo + (ehEsquerda ? "│   " : "    "), false, nivel + 1);
            linhas.push(prefixo + (ehEsquerda ? "└── " : "┌── ") + no.chave);
            desenharNo(no.esquerda, prefixo + (ehEsquerda ? "    " : "│   "), true, nivel + 1);
        };
        desenharNo(this.raiz, "", true, 1);
        return linhas.join("\n");
    }
}

/** Regra de reposição (RN09): só produto físico e ativo, com estoque <= mínimo. */
function precisaRepor(produto) {
    return produto.tipo === "FISICO"
        && produto.ativo
        && produto.estoqueAtual !== null
        && produto.estoqueMinimo !== null
        && produto.estoqueAtual <= produto.estoqueMinimo;
}

/** Deixa o texto em minúsculas e sem acentos, para comparar. */
function normalizar(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim();
}

module.exports = ArvoreAVL;
module.exports.precisaRepor = precisaRepor;
