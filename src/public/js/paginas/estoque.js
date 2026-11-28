// ==================================================
// CARWEAR - TELA DE ESTOQUE
// Posição de estoque (pela Árvore AVL), entradas, saídas e histórico.
// ==================================================

window.CarWear.paginas.estoque = {

    iniciar(raiz) {
        const C = window.CarWear;
        const $ = (id) => raiz.querySelector(`#${id}`);

        const mensagens = $("mensagensEstoque");
        let produtosMovimentaveis = [];   // produtos físicos e ativos (para os selects)
        let produtoDoHistorico = null;    // filtro do histórico por produto

        const NOMES_MOTIVO = { COMPRA: "Compra de mercadoria", VENDA: "Venda", PERDA: "Perda ou dano", AJUSTE: "Ajuste de estoque" };

        // ------------------------------------------
        // Carregamento
        // ------------------------------------------

        async function carregarApoio() {
            try {
                const [categorias, fornecedores] = await Promise.all([
                    C.api.get("/api/categorias"),
                    C.api.get("/api/fornecedores")
                ]);
                C.preencherSelect($("categoriaEstoque"), categorias, "idCategoria", "nome");
                C.preencherSelect($("fornecedorEntrada"), fornecedores, "idFornecedor", "nome");
            } catch (erro) {
                C.mensagem(mensagens, erro.message, "danger");
            }
        }

        async function carregarResumo() {
            try {
                const resumo = await C.api.get("/api/estoque/resumo");
                $("resumoUnidades").textContent = C.numero(resumo.unidades);
                $("resumoEntradas").textContent = C.numero(resumo.entradasNoMes);
                $("resumoSaidas").textContent = C.numero(resumo.saidasNoMes);
                $("resumoCriticos").textContent = C.numero(resumo.criticos);
            } catch (erro) {
                // a mensagem aparece na tabela
            }
        }

        async function carregarPosicao() {
            const filtros = {
                busca: $("pesquisaEstoque").value.trim(),
                categoria: $("categoriaEstoque").value,
                situacao: $("situacaoEstoque").value
            };
            try {
                const produtos = await C.api.get("/api/estoque" + C.parametros(filtros));
                desenharPosicao(produtos);
            } catch (erro) {
                $("tabelaEstoque").innerHTML =
                    `<tr><td colspan="7" class="text-center text-danger py-4">${C.esc(erro.message)}</td></tr>`;
            }
        }

        /** Lista para os selects de entrada e saída (todos os físicos ativos, sem filtro). */
        async function carregarProdutosMovimentaveis() {
            try {
                produtosMovimentaveis = await C.api.get("/api/estoque");
                const opcoes = produtosMovimentaveis.map((p) => ({
                    idProduto: p.idProduto,
                    texto: `${p.codigo} - ${p.descricao} (estoque: ${p.estoqueAtual})`
                }));
                C.preencherSelect($("produtoEntrada"), opcoes, "idProduto", "texto");
                C.preencherSelect($("produtoSaida"), opcoes, "idProduto", "texto");
            } catch (erro) {
                // a mensagem aparece na tabela
            }
        }

        async function carregarHistorico() {
            const filtros = {
                inicio: $("movimentacaoInicio").value,
                fim: $("movimentacaoFim").value,
                tipo: $("tipoMovimentacao").value,
                produto: produtoDoHistorico ? produtoDoHistorico.idProduto : ""
            };
            try {
                const movimentacoes = await C.api.get("/api/estoque/movimentacoes" + C.parametros(filtros));
                desenharHistorico(movimentacoes);
            } catch (erro) {
                $("tabelaMovimentacoes").innerHTML =
                    `<tr><td colspan="7" class="text-center text-danger py-4">${C.esc(erro.message)}</td></tr>`;
            }
        }

        function atualizarTudo() {
            carregarResumo();
            carregarPosicao();
            carregarProdutosMovimentaveis();
            carregarHistorico();
        }

        // ------------------------------------------
        // Tabelas
        // ------------------------------------------

        function desenharPosicao(produtos) {
            const corpo = $("tabelaEstoque");
            if (produtos.length === 0) {
                corpo.innerHTML = `<tr><td colspan="7" class="text-center text-secondary py-4">Nenhum produto encontrado.</td></tr>`;
                $("totalEstoque").textContent = "";
                return;
            }

            corpo.innerHTML = produtos.map((p) => {
                const destaque = p.situacao === "Normal" ? "" : ` class="text-danger fw-semibold"`;
                const nome = C.esc(p.descricao);
                return `<tr>
                    <td>${C.esc(p.codigo)}</td>
                    <td class="fw-semibold">${nome}</td>
                    <td>${C.esc(p.categoria)}</td>
                    <td${destaque}>${C.numero(p.estoqueAtual)}</td>
                    <td>${C.numero(p.estoqueMinimo)}</td>
                    <td>${C.badgeSituacao(p.situacao)}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary" data-id="${p.idProduto}"
                                title="Consultar movimentações" aria-label="Consultar movimentações de ${nome}">
                            <i class="bi bi-clock-history"></i>
                        </button>
                    </td>
                </tr>`;
            }).join("");

            $("totalEstoque").textContent = `${produtos.length} produto(s) exibido(s).`;
        }

        function desenharHistorico(movimentacoes) {
            $("descricaoHistorico").textContent = produtoDoHistorico
                ? `Movimentações de ${produtoDoHistorico.codigo} - ${produtoDoHistorico.descricao}.`
                : "Consulte as entradas e saídas de mercadorias.";

            const corpo = $("tabelaMovimentacoes");
            if (movimentacoes.length === 0) {
                corpo.innerHTML = `<tr><td colspan="7" class="text-center text-secondary py-4">Nenhuma movimentação encontrada.</td></tr>`;
                return;
            }

            corpo.innerHTML = movimentacoes.map((m) => {
                const entrada = m.tipo === "ENTRADA";
                return `<tr>
                    <td class="text-nowrap">${C.dataHora(m.dataHora)}</td>
                    <td class="fw-semibold">${C.esc(m.codigo)} - ${C.esc(m.produto)}</td>
                    <td><span class="badge ${entrada ? "text-bg-success" : "text-bg-danger"}">${entrada ? "Entrada" : "Saída"}</span></td>
                    <td class="${entrada ? "text-success" : "text-danger"} fw-semibold">${entrada ? "+" : "-"}${C.numero(m.quantidade)}</td>
                    <td>${C.esc(NOMES_MOTIVO[m.motivo] || m.motivo)}</td>
                    <td>${m.fornecedor ? C.esc(m.fornecedor) : `<span class="text-secondary">—</span>`}</td>
                    <td>${C.esc(m.responsavel)}</td>
                </tr>`;
            }).join("");
        }

        // ------------------------------------------
        // Entrada e saída
        // ------------------------------------------

        function mostrarSaldo(select, destino) {
            const produto = produtosMovimentaveis.find((p) => p.idProduto === Number(select.value));
            destino.textContent = produto
                ? `Estoque atual: ${produto.estoqueAtual} · mínimo: ${produto.estoqueMinimo} · situação: ${produto.situacao}`
                : "";
        }

        function abrirMovimentacao(tipo) {
            const entrada = tipo === "entrada";
            const form = $(entrada ? "formEntradaEstoque" : "formSaidaEstoque");
            form.reset();
            const campoData = $(entrada ? "dataEntrada" : "dataSaida");
            campoData.value = C.hoje();
            campoData.max = C.hoje();
            $(entrada ? "saldoEntrada" : "saldoSaida").textContent = "";
            C.mostrarErroNoFormulario($(entrada ? "erroEntrada" : "erroSaida"), "");
            C.modal(entrada ? "modalEntradaEstoque" : "modalSaidaEstoque").show();
        }

        async function registrar(evento, tipo) {
            evento.preventDefault();
            const entrada = tipo === "entrada";
            const erro = $(entrada ? "erroEntrada" : "erroSaida");
            const botao = $(entrada ? "btnSalvarEntrada" : "btnSalvarSaida");

            const dados = {
                idProduto: Number($(entrada ? "produtoEntrada" : "produtoSaida").value),
                quantidade: Number($(entrada ? "quantidadeEntrada" : "quantidadeSaida").value),
                data: $(entrada ? "dataEntrada" : "dataSaida").value,
                motivo: $(entrada ? "motivoEntrada" : "motivoSaida").value
            };
            if (entrada) dados.idFornecedor = $("fornecedorEntrada").value || null;

            if (!dados.idProduto) return C.mostrarErroNoFormulario(erro, "Selecione o produto.");
            if (!Number.isInteger(dados.quantidade) || dados.quantidade <= 0) {
                return C.mostrarErroNoFormulario(erro, "Informe uma quantidade inteira maior que zero.");
            }

            botao.disabled = true;
            C.mostrarErroNoFormulario(erro, "");
            try {
                const resposta = await C.api.post(entrada ? "/api/estoque/entradas" : "/api/estoque/saidas", dados);
                const p = resposta.produto;
                C.modal(entrada ? "modalEntradaEstoque" : "modalSaidaEstoque").hide();
                C.mensagem(
                    mensagens,
                    `${entrada ? "Entrada" : "Saída"} de ${dados.quantidade} unidade(s) de ${p.codigo} - ${p.descricao} registrada. ` +
                        `Estoque atual: ${p.estoqueAtual}.` + C.textoAlerta(resposta.alerta, p),
                    resposta.alerta === "gerado" ? "warning" : "success"
                );
                atualizarTudo();
            } catch (e) {
                C.mostrarErroNoFormulario(erro, e.message);
            } finally {
                botao.disabled = false;
            }
        }

        // ------------------------------------------
        // Eventos
        // ------------------------------------------

        $("btnAbrirEntrada").addEventListener("click", () => abrirMovimentacao("entrada"));
        $("btnAbrirSaida").addEventListener("click", () => abrirMovimentacao("saida"));
        $("formEntradaEstoque").addEventListener("submit", (e) => registrar(e, "entrada"));
        $("formSaidaEstoque").addEventListener("submit", (e) => registrar(e, "saida"));
        $("produtoEntrada").addEventListener("change", () => mostrarSaldo($("produtoEntrada"), $("saldoEntrada")));
        $("produtoSaida").addEventListener("change", () => mostrarSaldo($("produtoSaida"), $("saldoSaida")));

        $("filtrosEstoque").addEventListener("submit", (e) => {
            e.preventDefault();
            carregarPosicao();
        });
        ["categoriaEstoque", "situacaoEstoque"].forEach((id) => $(id).addEventListener("change", carregarPosicao));

        let espera = null;
        $("pesquisaEstoque").addEventListener("input", () => {
            clearTimeout(espera);
            espera = setTimeout(carregarPosicao, 300);
        });

        $("filtrosHistorico").addEventListener("submit", (e) => {
            e.preventDefault();
            carregarHistorico();
        });
        $("btnLimparHistorico").addEventListener("click", () => {
            $("filtrosHistorico").reset();
            produtoDoHistorico = null;
            carregarHistorico();
        });

        // Botão de relógio: mostra o histórico só daquele produto.
        $("tabelaEstoque").addEventListener("click", (evento) => {
            const botao = evento.target.closest("button[data-id]");
            if (!botao) return;
            produtoDoHistorico = produtosMovimentaveis.find((p) => p.idProduto === Number(botao.dataset.id)) || null;
            carregarHistorico();
            $("secaoHistorico").scrollIntoView({ behavior: "smooth" });
        });

        carregarApoio();
        atualizarTudo();
    }

};
