
// ==================================================
// CARWEAR - GERENCIAMENTO DO LAYOUT
// ==================================================

document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("sidebar");
    const toggleSidebar = document.getElementById("toggleSidebar");
    const breadcrumbPage = document.getElementById("breadcrumbPage");
    const pageContent = document.getElementById("pageContent");

    const menuItems = document.querySelectorAll(".menu-item[data-page]");
    const mobileScreen = window.matchMedia("(max-width: 767px)");

    let salesChart = null;
    let productsChart = null;
    let currentRequest = null;

    // ==================================================
    // MENU MOBILE
    // ==================================================

    const overlay = document.createElement("div");

    overlay.className = "sidebar-overlay";
    overlay.hidden = true;

    document.body.appendChild(overlay);

    function updateMenuAccessibility() {

        const expanded = mobileScreen.matches
            ? sidebar.classList.contains("mobile-open")
            : !sidebar.classList.contains("collapsed");

        toggleSidebar.setAttribute("aria-expanded", String(expanded));
        toggleSidebar.setAttribute("aria-controls", "sidebar");

        sidebar.inert = mobileScreen.matches && !expanded;

    }

    function closeMobileMenu() {

        sidebar.classList.remove("mobile-open");
        overlay.hidden = true;

        updateMenuAccessibility();

    }

    // ==================================================
    // ABRIR E RECOLHER MENU LATERAL
    // ==================================================

    toggleSidebar.addEventListener("click", () => {

        if (mobileScreen.matches) {

            const isOpen = sidebar.classList.toggle("mobile-open");

            overlay.hidden = !isOpen;

        } else {

            sidebar.classList.toggle("collapsed");

        }

        updateMenuAccessibility();

    });

    overlay.addEventListener("click", () => {

        closeMobileMenu();
        toggleSidebar.focus();

    });

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape" &&
            sidebar.classList.contains("mobile-open")) {

            closeMobileMenu();
            toggleSidebar.focus();

        }

    });

    mobileScreen.addEventListener("change", () => {

        sidebar.classList.remove("collapsed");
        closeMobileMenu();

    });

    // ==================================================
    // DESTRUIR GRÁFICOS ANTERIORES
    // ==================================================

    function destroyCharts() {

        if (salesChart) {

            salesChart.destroy();
            salesChart = null;

        }

        if (productsChart) {

            productsChart.destroy();
            productsChart = null;

        }

    }

    // ==================================================
    // CARREGAMENTO DINÂMICO DAS PÁGINAS
    // ==================================================

    async function navigateTo(pageId) {

        const selectedButton = Array.from(menuItems).find(
            item => item.dataset.page === pageId
        );

        if (!selectedButton) {
            return;
        }

        // Cancelar carregamento anterior
        if (currentRequest) {
            currentRequest.abort();
        }

        const request = new AbortController();
        currentRequest = request;

        // Remover gráficos antigos
        destroyCharts();

        // Atualizar botão selecionado
        menuItems.forEach(item => {

            item.classList.remove("active");
            item.removeAttribute("aria-current");

        });

        selectedButton.classList.add("active");
        selectedButton.setAttribute("aria-current", "page");

        // Atualizar título da página
        const pageName = selectedButton
            .querySelector("span")
            .textContent.trim();

        breadcrumbPage.textContent = pageName;

        document.title = `${pageName} | CarWear`;

        // Fechar menu no celular
        if (mobileScreen.matches) {

            closeMobileMenu();
            toggleSidebar.focus();

        }

        // Exibir carregamento
        pageContent.setAttribute("aria-busy", "true");

        pageContent.innerHTML = `
            <div class="text-center py-5" role="status">
                <div class="spinner-border text-primary"></div>
                <p class="text-secondary mt-3">
                    Carregando página...
                </p>
            </div>
        `;

        try {

            const response = await fetch(
                `pages/${pageId}.html`,
                {
                    signal: request.signal,
                    cache: "no-cache"
                }
            );

            if (!response.ok) {

                throw new Error(
                    `Erro ao carregar página: ${response.status}`
                );

            }

            const html = await response.text();

            if (request.signal.aborted) {
                return;
            }

            // Inserir conteúdo do módulo
            pageContent.innerHTML = `
                <section id="${pageId}" class="page-section active">
                    ${html}
                </section>
            `;

            // Inicializar gráficos somente no Dashboard
            if (pageId === "dashboard") {

                initializeCharts();

            }

            // Iniciar o script da página (ex.: produtos.js, estoque.js),
            // que busca os dados na API e liga os botões da tela.
            const paginas = window.CarWear && window.CarWear.paginas;

            if (paginas && paginas[pageId]) {

                paginas[pageId].iniciar(
                    pageContent.querySelector(`#${pageId}`)
                );

            }

            window.scrollTo({
                top: 0,
                behavior: "instant"
            });

        } catch (error) {

            if (error.name === "AbortError") {
                return;
            }

            console.error(error);

            pageContent.innerHTML = `
                <div class="content-card text-center py-5">

                    <i class="bi bi-exclamation-triangle
                       text-danger fs-1"></i>

                    <h3 class="mt-3">
                        Não foi possível carregar a página
                    </h3>

                    <p>
                        Verifique se o arquivo existe e tente novamente.
                    </p>

                    <button class="btn btn-primary" id="retryPage">
                        Tentar novamente
                    </button>

                </div>
            `;

            document.getElementById("retryPage")
                .addEventListener("click", () => {

                    navigateTo(pageId);

                });

        } finally {

            if (currentRequest === request) {

                currentRequest = null;
                pageContent.setAttribute("aria-busy", "false");

            }

        }

    }

    // ==================================================
    // EVENTOS DOS BOTÕES LATERAIS
    // ==================================================

    menuItems.forEach(item => {

        const label = item.querySelector("span")
            .textContent.trim();

        item.setAttribute("aria-label", label);
        item.title = label;

        item.addEventListener("click", () => {

            navigateTo(item.dataset.page);

        });

    });

    // ==================================================
    // GRÁFICOS DO DASHBOARD
    // ==================================================

    function initializeCharts() {

        if (typeof Chart === "undefined") {

            console.warn("Chart.js não foi carregado.");
            return;

        }

        Chart.defaults.font.family =
            "Segoe UI, Arial, sans-serif";

        Chart.defaults.color = "#64748b";

        // ==============================================
        // GRÁFICO DE VENDAS
        // ==============================================

        const salesCanvas = document.getElementById("salesChart");

        if (salesCanvas) {

            salesChart = new Chart(salesCanvas, {

                type: "line",

                data: {

                    labels: [
                        "Seg", "Ter", "Qua", "Qui",
                        "Sex", "Sáb", "Dom"
                    ],

                    datasets: [{

                        label: "Faturamento",

                        // Dados demonstrativos
                        data: [
                            1100, 1650, 1300, 2100,
                            1800, 2800, 1700
                        ],

                        borderColor: "#2563eb",
                        backgroundColor: "rgba(37, 99, 235, 0.10)",

                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,

                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: "#2563eb",
                        pointBorderColor: "#ffffff",
                        pointBorderWidth: 2

                    }]

                },

                options: {

                    responsive: true,
                    maintainAspectRatio: false,

                    interaction: {
                        intersect: false,
                        mode: "index"
                    },

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label: (context) => {

                                    return context.parsed.y
                                        .toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL"
                                        });

                                }

                            }

                        }

                    },

                    scales: {

                        x: {

                            grid: {
                                display: false
                            }

                        },

                        y: {

                            beginAtZero: true,

                            grid: {
                                color: "#e2e8f0"
                            },

                            ticks: {

                                callback: (value) => {

                                    return value.toLocaleString(
                                        "pt-BR",
                                        {
                                            style: "currency",
                                            currency: "BRL",
                                            maximumFractionDigits: 0
                                        }
                                    );

                                }

                            }

                        }

                    }

                }

            });

        }

        // ==============================================
        // GRÁFICO DE PRODUTOS MAIS VENDIDOS
        // ==============================================

        const productsCanvas = document.getElementById("productsChart");

        if (productsCanvas) {

            productsChart = new Chart(productsCanvas, {

                type: "doughnut",

                data: {

                    labels: [
                        "Filtro de óleo",
                        "Pastilha de freio",
                        "Vela de ignição",
                        "Correia dentada",
                        "Outros"
                    ],

                    datasets: [{

                        // Dados demonstrativos
                        data: [35, 25, 18, 12, 10],

                        backgroundColor: [
                            "#2563eb",
                            "#16a34a",
                            "#f59e0b",
                            "#8b5cf6",
                            "#94a3b8"
                        ],

                        borderWidth: 3,
                        borderColor: "#ffffff",
                        hoverOffset: 6

                    }]

                },

                options: {

                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "68%",

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                usePointStyle: true,
                                padding: 14,
                                boxWidth: 8,

                                font: {
                                    size: 11
                                }

                            }

                        }

                    }

                }

            });

        }

    }

    // ==================================================
    // INICIALIZAÇÃO DO SISTEMA
    // ==================================================

    updateMenuAccessibility();

    navigateTo("dashboard");

    console.log("CarWear - Interface modular carregada.");

});
