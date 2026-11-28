// ==================================================
// CARWEAR - FUNÇÕES COMUNS DAS TELAS
// Chamadas à API (fetch), formatação e mensagens.
// ==================================================

window.CarWear = window.CarWear || { paginas: {} };

(function () {

    // ----------------------------------------------
    // Chamadas à API
    // ----------------------------------------------

    async function requisitar(metodo, url, corpo) {
        const opcoes = { method: metodo, headers: {} };
        if (corpo !== undefined) {
            opcoes.headers["Content-Type"] = "application/json";
            opcoes.body = JSON.stringify(corpo);
        }

        let resposta;
        try {
            resposta = await fetch(url, opcoes);
        } catch (erro) {
            throw new Error("Não foi possível falar com o servidor. Confira se ele está rodando.");
        }

        const dados = await resposta.json().catch(() => ({}));
        if (!resposta.ok) {
            throw new Error(dados.erro || `Erro ${resposta.status} no servidor.`);
        }
        return dados;
    }

    const api = {
        get: (url) => requisitar("GET", url),
        post: (url, corpo) => requisitar("POST", url, corpo),
        put: (url, corpo) => requisitar("PUT", url, corpo),
        patch: (url, corpo) => requisitar("PATCH", url, corpo ?? {})
    };

    /** Monta a query string sem os campos vazios. */
    function parametros(objeto) {
        const busca = new URLSearchParams();
        Object.entries(objeto).forEach(([chave, valor]) => {
            if (valor !== "" && valor !== null && valor !== undefined) busca.append(chave, valor);
        });
        const texto = busca.toString();
        return texto ? `?${texto}` : "";
    }

    // ----------------------------------------------
    // Formatação
    // ----------------------------------------------

    /** Protege o texto antes de colocar no HTML (evita que um nome com <script> rode na tela). */
    function esc(texto) {
        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    const moeda = (valor) => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const numero = (valor) => Number(valor || 0).toLocaleString("pt-BR");

    function dataHora(valor) {
        const data = new Date(valor);
        return Number.isNaN(data.getTime())
            ? ""
            : data.toLocaleDateString("pt-BR") + " " + data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }

    /** Data de hoje no formato do campo date (AAAA-MM-DD), no fuso do computador. */
    function hoje() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    function badgeSituacao(situacao) {
        const cores = { "Normal": "text-bg-success", "Crítico": "text-bg-danger", "Sem estoque": "text-bg-dark" };
        return situacao
            ? `<span class="badge ${cores[situacao] || "text-bg-secondary"}">${esc(situacao)}</span>`
            : `<span class="text-secondary">—</span>`;
    }

    // ----------------------------------------------
    // Mensagens na tela
    // ----------------------------------------------

    function mensagem(container, texto, tipo = "success") {
        if (!container) return;
        const icones = { success: "check-circle", danger: "x-circle", warning: "exclamation-triangle", info: "info-circle" };
        const div = document.createElement("div");
        div.className = `alert alert-${tipo} alert-dismissible fade show`;
        div.setAttribute("role", "alert");
        div.innerHTML = `<i class="bi bi-${icones[tipo] || "info-circle"} me-2"></i>${esc(texto)}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>`;
        container.prepend(div);
        setTimeout(() => div.remove(), 7000);
    }

    /** Mensagem extra quando a movimentação gerou ou resolveu um alerta de reposição. */
    function textoAlerta(alerta, produto) {
        if (alerta === "gerado") {
            return ` Atenção: ${produto.descricao} ficou com ${produto.estoqueAtual} unidade(s), ` +
                `no limite ou abaixo do mínimo (${produto.estoqueMinimo}). Alerta de reposição gerado.`;
        }
        if (alerta === "resolvido") return " O alerta de reposição deste produto foi resolvido.";
        return "";
    }

    function mostrarErroNoFormulario(elemento, texto) {
        if (!elemento) return;
        elemento.textContent = texto;
        elemento.classList.toggle("d-none", !texto);
    }

    /** Preenche um <select> mantendo a primeira opção (ex.: "Selecione"). */
    function preencherSelect(select, itens, valor, texto) {
        if (!select) return;
        const primeira = select.options[0] ? select.options[0].outerHTML : "";
        select.innerHTML = primeira + itens
            .map((item) => `<option value="${esc(item[valor])}">${esc(item[texto])}</option>`)
            .join("");
    }

    function modal(id) {
        return bootstrap.Modal.getOrCreateInstance(document.getElementById(id));
    }

    Object.assign(window.CarWear, {
        api, parametros, esc, moeda, numero, dataHora, hoje, badgeSituacao,
        mensagem, textoAlerta, mostrarErroNoFormulario, preencherSelect, modal
    });

})();
