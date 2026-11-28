// Erro de regra de negócio: vira uma resposta com mensagem clara para a tela.
class ErroNegocio extends Error {
    constructor(mensagem, status = 422) {
        super(mensagem);
        this.name = "ErroNegocio";
        this.status = status;
    }
}

module.exports = { ErroNegocio };
