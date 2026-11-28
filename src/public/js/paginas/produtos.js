// ==================================================
// CARWEAR - TELA DE PRODUTOS E SERVIÇOS
// Os dados vêm da API, que responde a partir da Árvore AVL.
// ==================================================

window.CarWear.paginas.produtos = {

    iniciar(raiz) {
        const C = window.CarWear;
        const $ = (id) => raiz.querySelector(`#${id}`);

        const mensagens = $("mensagensProdutos");
        let produtosDaTela = [];
        let itemEmEdicao = null;    // null = cadastro; objeto = edição
        let itemParaInativar = null;

        // ------------------------------------------
        // Carregamento
        // ------------------------------------------

        async function carregarCategorias() {
            try {
                const categorias = await C.api.get("/api/categorias");
                C.preencherSelect($("filtroCategoria"), categorias, "idCategoria", "nome");
                C.preencherSelect($("categoriaProduto"), categorias, "idCategoria", "nome");
                C.preencherSelect($("categoriaServico"), categorias, "idCategoria", "nome");
            } catch (erro) {
                C.mensagem(mensagens, erro.message, "danger");
            }
        }

        async function carregarResumo() {
            try {
                const resumo = await C.api.get("/api/produtos/resumo");
                $("resumoProdutos").textContent = C.numero(resumo.produtos);
                $("resumoAtivos").textContent = C.numero(resumo.ativos);
                $("resumoCriticosProdutos").textContent = C.numero(resumo.criticos);
                $("resumoServicos").textContent = C.numero(resumo.servicos);
            } catch (erro) {
                // a mensagem de erro já aparece na carga da tabela
            }
        }

        async function carregarLista() {
            const filtros = {
                busca: $("pesquisaProduto").value.trim(),
                tipo: $("filtroTipo").value,
                categoria: $("filtroCategoria").value,
                status: $("filtroStatus").value
            };
            try {
                produtosDaTela = await C.api.get("/api/produtos" + C.parametros(filtros));
                desenharTabela();
            } catch (erro) {
                $("tabelaProdutos").innerHTML =
                    `<tr><td colspan="8" class="text-center text-danger py-4">${C.esc(erro.message)}</td></tr>`;
                $("totalProdutos").textContent = "";
            }
        }

        function atualizarTudo() {
            carregarResumo();
            carregarLista();
        }

        // ------------------------------------------
        // Tabela
        // ------------------------------------------

        function desenharTabela() {
            const corpo = $("tabelaProdutos");
            if (produtosDaTela.length === 0) {
                corpo.innerHTML = `<tr><td colspan="8" class="text-center text-secondary py-4">Nenhum item encontrado.</td></tr>`;
                $("totalProdutos").textContent = "";
                return;
            }

            corpo.innerHTML = produtosDaTela.map((p) => {
                const ehProduto = p.tipo === "FISICO";
                const tipo = ehProduto
                    ? `<span class="badge bg-primary-subtle text-primary">Produto</span>`
                    : `<span class="badge bg-success-subtle text-success">Serviço</span>`;
                const estoque = ehProduto
                    ? (p.situacao === "Normal" ? C.numero(p.estoqueAtual)
                        : `<span class="text-danger fw-semibold">${C.numero(p.estoqueAtual)}</span>`)
                    : `<span class="text-secondary">—</span>`;
                const status = p.ativo
                    ? `<span class="badge text-bg-success">Ativo</span>`
                    : `<span class="badge text-bg-secondary">Inativo</span>`;
                const nome = C.esc(p.descricao);

                return `<tr>
                    <td>${C.esc(p.codigo)}</td>
                    <td class="fw-semibold">${nome}</td>
                    <td>${tipo}</td>
                    <td>${C.esc(p.categoria)}</td>
                    <td class="text-nowrap">${C.moeda(p.preco)}</td>
                    <td>${estoque}</td>
                    <td>${status}</td>
                    <td class="text-center text-nowrap">
                        <button class="btn btn-sm btn-outline-primary" data-acao="ver" data-id="${p.idProduto}"
                                title="Visualizar" aria-label="Visualizar ${nome}">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" data-acao="editar" data-id="${p.idProduto}"
                                title="Editar" aria-label="Editar ${nome}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" data-acao="inativar" data-id="${p.idProduto}"
                                title="Inativar" aria-label="Inativar ${nome}" ${p.ativo ? "" : "disabled"}>
                            <i class="bi bi-slash-circle"></i>
                        </button>
                    </td>
                </tr>`;
            }).join("");

            $("totalProdutos").textContent = `${produtosDaTela.length} item(ns) exibido(s).`;
        }

        // ------------------------------------------
        // Modal de produto / serviço
        // ------------------------------------------

        function abrirProduto(item, somenteLeitura) {
            itemEmEdicao = item;
            const form = $("formProduto");
            form.reset();
            C.mostrarErroNoFormulario($("erroProduto"), "");

            const titulo = somenteLeitura ? "Detalhes do produto" : item ? "Editar produto" : "Cadastrar produto";
            $("tituloModalProduto").querySelector("span").textContent = titulo;

            $("codigoProduto").value = item ? item.codigo : "Gerado ao salvar";
            $("nomeProduto").value = item ? item.descricao : "";
            $("categoriaProduto").value = item ? item.idCategoria : "";
            $("precoVenda").value = item ? item.preco : "";
            $("estoqueInicial").value = item ? item.estoqueAtual : 0;
            $("estoqueMinimo").value = item ? item.estoqueMinimo : 0;
            $("statusProduto").value = item ? String(item.ativo) : "true";

            // Na edição, o estoque só muda pelas entradas e saídas.
            $("rotuloEstoqueInicial").textContent = item ? "Estoque atual" : "Estoque inicial";
            $("estoqueInicial").disabled = Boolean(item);
            $("ajudaEstoqueInicial").classList.toggle("d-none", !item);

            form.querySelectorAll("input:not([readonly]), select").forEach((campo) => {
                if (campo.id !== "estoqueInicial") campo.disabled = somenteLeitura;
            });
            $("btnSalvarProduto").classList.toggle("d-none", somenteLeitura);

            C.modal("modalProduto").show();
        }

        function abrirServico(item, somenteLeitura) {
            itemEmEdicao = item;
            const form = $("formServico");
            form.reset();
            C.mostrarErroNoFormulario($("erroServico"), "");

            const titulo = somenteLeitura ? "Detalhes do serviço" : item ? "Editar serviço" : "Cadastrar serviço";
            $("tituloModalServico").querySelector("span").textContent = titulo;

            $("codigoServico").value = item ? item.codigo : "Gerado ao salvar";
            $("nomeServico").value = item ? item.descricao : "";
            $("categoriaServico").value = item ? item.idCategoria : "";
            $("precoServico").value = item ? item.preco : "";
            $("statusServico").value = item ? String(item.ativo) : "true";

            form.querySelectorAll("input:not([readonly]), select").forEach((campo) => {
                campo.disabled = somenteLeitura;
            });
            $("btnSalvarServico").classList.toggle("d-none", somenteLeitura);

            C.modal("modalServico").show();
        }

        async function salvar(evento, tipo) {
            evento.preventDefault();
            const ehProduto = tipo === "FISICO";
            const erro = $(ehProduto ? "erroProduto" : "erroServico");
            const botao = $(ehProduto ? "btnSalvarProduto" : "btnSalvarServico");

            const dados = ehProduto
                ? {
                    descricao: $("nomeProduto").value,
                    idCategoria: $("categoriaProduto").value,
                    preco: $("precoVenda").value,
                    estoqueInicial: $("estoqueInicial").value,
                    estoqueMinimo: $("estoqueMinimo").value,
                    ativo: $("statusProduto").value === "true"
                }
                : {
                    descricao: $("nomeServico").value,
                    idCategoria: $("categoriaServico").value,
                    preco: $("precoServico").value,
                    ativo: $("statusServico").value === "true"
                };

            botao.disabled = true;
            C.mostrarErroNoFormulario(erro, "");
            try {
                const resposta = itemEmEdicao
                    ? await C.api.put(`/api/produtos/${itemEmEdicao.idProduto}`, dados)
                    : await C.api.post("/api/produtos", { ...dados, tipo });

                C.modal(ehProduto ? "modalProduto" : "modalServico").hide();
                const acao = itemEmEdicao ? "atualizado" : "cadastrado";
                C.mensagem(
                    mensagens,
                    `${resposta.produto.codigo} - ${resposta.produto.descricao} ${acao} com sucesso.` +
                        C.textoAlerta(resposta.alerta, resposta.produto),
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
        // Inativação
        // ------------------------------------------

        function pedirInativacao(item) {
            itemParaInativar = item;
            $("nomeInativar").textContent = `${item.codigo} - ${item.descricao}`;
            C.mostrarErroNoFormulario($("erroInativar"), "");
            C.modal("modalInativar").show();
        }

        async function confirmarInativacao() {
            const botao = $("btnConfirmarInativar");
            botao.disabled = true;
            try {
                const resposta = await C.api.patch(`/api/produtos/${itemParaInativar.idProduto}/inativar`);
                C.modal("modalInativar").hide();
                C.mensagem(mensagens, `${resposta.produto.codigo} - ${resposta.produto.descricao} foi inativado.`, "success");
                atualizarTudo();
            } catch (e) {
                C.mostrarErroNoFormulario($("erroInativar"), e.message);
            } finally {
                botao.disabled = false;
            }
        }

        // ------------------------------------------
        // Eventos
        // ------------------------------------------

        $("btnNovoProduto").addEventListener("click", () => abrirProduto(null, false));
        $("btnNovoServico").addEventListener("click", () => abrirServico(null, false));
        $("formProduto").addEventListener("submit", (e) => salvar(e, "FISICO"));
        $("formServico").addEventListener("submit", (e) => salvar(e, "SERVICO"));
        $("btnConfirmarInativar").addEventListener("click", confirmarInativacao);

        $("filtrosProdutos").addEventListener("submit", (e) => {
            e.preventDefault();
            carregarLista();
        });
        ["filtroTipo", "filtroCategoria", "filtroStatus"].forEach((id) =>
            $(id).addEventListener("change", carregarLista));

        let espera = null;
        $("pesquisaProduto").addEventListener("input", () => {
            clearTimeout(espera);
            espera = setTimeout(carregarLista, 300);
        });

        $("tabelaProdutos").addEventListener("click", (evento) => {
            const botao = evento.target.closest("button[data-acao]");
            if (!botao) return;
            const item = produtosDaTela.find((p) => p.idProduto === Number(botao.dataset.id));
            if (!item) return;

            const abrir = item.tipo === "FISICO" ? abrirProduto : abrirServico;
            if (botao.dataset.acao === "ver") abrir(item, true);
            if (botao.dataset.acao === "editar") abrir(item, false);
            if (botao.dataset.acao === "inativar") pedirInativacao(item);
        });

        carregarCategorias();
        atualizarTudo();
    }

};
