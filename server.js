// =====================================================================
// CarWear - servidor (Node.js + Express, padrão MVC)
// Fluxo dos dados: Banco de dados (MySQL) → Árvore AVL → Sistema
// =====================================================================

require("dotenv").config({ quiet: true });

const path = require("path");
const express = require("express");
const rotasApi = require("./src/routes/api");
const { tratarErros } = require("./src/middlewares/tratarErros");
const arvoreProdutos = require("./src/services/arvoreProdutos");

const app = express();
const PORTA = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

// API em JSON
app.use("/api", rotasApi);

// Telas: index.html e pages/ (src/views) e css/js (src/public)
app.use("/public", express.static(path.join(__dirname, "src", "public")));
app.use(express.static(path.join(__dirname, "src", "views")));

app.use(tratarErros);

app.listen(PORTA, async () => {
    console.log(`CarWear rodando em http://localhost:${PORTA}`);

    // Monta a Árvore AVL a partir do banco. Se o banco estiver fora do ar,
    // as telas continuam abrindo e a carga é tentada de novo na próxima chamada da API.
    try {
        const info = await arvoreProdutos.carregarDoBanco();
        console.log(`Árvore AVL carregada: ${info.produtos} produtos, altura ${info.altura} ` +
            `(máxima teórica ${info.alturaMaximaTeorica}), em ${info.tempoCargaMs.toFixed(2)} ms.`);
        console.log(arvoreProdutos.arvore.desenhar(4));
    } catch (erro) {
        arvoreProdutos.estado.ultimoErro = erro.message;
        console.error(`Não foi possível carregar a Árvore AVL do banco: ${erro.message}`);
    }
});
