CarWear – Sistema de Controle de Estoque e Gestão Inteligente de Autopeças

Projeto Integrador 2026-2 · Bacharelado em Engenharia de Software (4º período) · Faculdade SENAI FATESG

Objetivo

O CarWear substitui as planilhas e anotações soltas de uma loja de autopeças por um único sistema web. Ele controla produtos, estoque, vendas e despesas, e gera alertas a partir de regras claras, como o aviso de estoque mínimo.

Como os dados chegam ao sistema
Banco de dados (MySQL / TiDB)  →  Árvore AVL (em memória)  →  API  →  Telas
Quando o servidor liga, todos os produtos são lidos do banco e colocados em uma árvore AVL, usando o código do produto como chave.
As telas de Produtos e Estoque leem os dados da árvore, não direto do banco.
Toda alteração (cadastro, edição, entrada, saída) é gravada primeiro no banco, dentro de uma transação. Depois o produto é lido de novo e atualizado na árvore, para que os dois fiquem sempre iguais.
Situação atual
Parte	Situação
Produtos: cadastro, edição, pesquisa e inativação	Funcionando
Estoque: entradas, saídas e histórico de movimentações	Funcionando
Bloqueio de estoque negativo	Funcionando
Alerta de estoque mínimo	Funcionando
Árvore AVL integrada ao banco	Funcionando
Login com perfis Administrador e Operador	Em desenvolvimento (por enquanto o sistema usa o usuário padrão admin)
Dashboard, vendas, despesas, clientes, relatórios e demais telas	Layout pronto, ainda com dados de exemplo
Tecnologias
Parte	Tecnologia
Servidor	Node.js 20+ com Express (API JSON), padrão MVC com camada de serviços
Telas	HTML, CSS e JavaScript com Bootstrap 5, Bootstrap Icons e Chart.js
Banco de dados	MySQL 8 (local) ou TiDB Cloud (online, compatível com MySQL), acessado pela biblioteca mysql2
Estrutura de dados	Árvore AVL em JavaScript (src/estruturas/)
Testes	Executor de testes nativo do Node.js (node:test)
Hospedagem	Render (Web Service Node.js) + TiDB Cloud
Requisitos para executar
Git
Node.js 20 ou superior (já vem com o npm)
Um banco MySQL 8 local ou uma instância do TiDB Cloud
Navegador atualizado
Como executar no computador
Clonar o repositório e entrar na branch feat-layout.
Copiar o arquivo .env.example para .env e preencher os dados do banco.
Instalar as dependências:
bash
npm install
Criar o banco autopecas com as tabelas e os dados iniciais:
bash
npm run banco

Para apagar e criar tudo de novo: npm run banco -- --recriar. 5. Iniciar o servidor:

bash
npm start
Abrir http://localhost:3000.

O passo a passo completo está em docs/design-de-software/implantacao.md.

Como publicar online (Render + TiDB Cloud)
No TiDB Cloud, criar uma instância Starter e copiar host, porta (4000), usuário (prefixo.root) e senha em Connect.
No computador, colocar esses dados no .env com DB_SSL=true e rodar npm run banco.
No Render, criar um Web Service ligado a este repositório, com Build npm install e Start npm start.
Na aba Environment do Render, cadastrar:
Variável	Valor
DB_HOST	host do TiDB
DB_PORT	4000
DB_USER	usuário do TiDB (prefixo.root)
DB_PASSWORD	senha do TiDB
DB_NAME	autopecas
DB_SSL	true
NODE_ENV	production
FORNECEDOR_PADRAO_ID	1
USUARIO_PADRAO_ID	1
Abrir https://<seu-servico>.onrender.com/api/estrutura/avl. Se aparecer "carregada": true, o sistema está ligado ao banco.

O arquivo .env tem senhas e não vai para o GitHub (está no .gitignore). No Render, as senhas ficam só na aba Environment.

No plano gratuito, o Render desliga o serviço depois de um tempo sem uso. O primeiro acesso depois disso pode levar cerca de 1 minuto.

Comandos
Comando	O que faz
npm start	Inicia o servidor
npm run dev	Inicia o servidor e reinicia sozinho quando um arquivo muda
npm run banco	Cria o banco, as tabelas e os dados iniciais usando o .env
npm test	Roda os testes da árvore AVL (e os da API, se API_URL estiver definido)
npm run medir	Mede o desempenho da árvore AVL com 1.000 produtos
API

Todas as rotas começam com /api e respondem em JSON.

Método	Rota	O que faz
GET	/saude	Mostra se o servidor está no ar
GET	/produtos	Lista produtos (filtros: busca, tipo, categoria, status)
GET	/produtos/resumo	Totais para os cartões da tela de Produtos
GET	/produtos/:id	Busca um produto pelo código
POST	/produtos	Cadastra um produto ou serviço
PUT	/produtos/:id	Edita um produto
PATCH	/produtos/:id/inativar	Inativa um produto
GET	/estoque	Posição de estoque dos produtos físicos ativos
GET	/estoque/resumo	Totais para os cartões da tela de Estoque
GET	/estoque/movimentacoes	Histórico (filtros: inicio, fim, tipo, produto)
POST	/estoque/entradas	Registra uma entrada (compra ou ajuste)
POST	/estoque/saidas	Registra uma saída (perda ou ajuste), sem deixar o estoque negativo
GET	/categorias	Lista as categorias
GET	/fornecedores	Lista os fornecedores
GET	/estrutura/avl	Mostra a árvore: quantidade, altura, se está balanceada e o desenho
POST	/estrutura/avl/recarregar	Monta a árvore de novo a partir do banco
Documentação
Seção	Conteúdo
ERS	Especificação de requisitos de software
Requisitos	Problema, usuários, escopo, regras de negócio, requisitos e histórias de usuário
Design	Arquitetura, decisões de design, diagramas UML, fluxo principal e LGPD
Testes	Testes de sucesso e de rejeição do fluxo principal
Implantação	Diagrama de implantação e como instalar e rodar
Diagramas UML	Imagens (.png) e fontes (.puml) dos diagramas
PDF dos diagramas	Os diagramas UML em PDF
Banco de dados	Modelo entidade-relacionamento
Estrutura de Dados II	Relatório técnico da árvore AVL
Teoria da Computação	Relatório de lógica e criptografia
Diagramas UML
Casos de uso

Diagrama de casos de uso

Atividades – Registrar venda

Diagrama de atividades

Sequência – Registrar venda

Diagrama de sequência

Classes

Diagrama de classes

Implantação

Diagrama de implantação

Estrutura do projeto
SistemaAutopecas/
├── server.js              inicia o servidor e monta a árvore AVL a partir do banco
├── package.json           dependências e comandos
├── .env.example           modelo das configurações (copiar para .env)
├── src/
│   ├── config/            conexão com o banco e transações
│   ├── estruturas/        ArvoreAVL.js e NoAVL.js
│   ├── services/          regras de negócio (produtos, estoque) e a árvore carregada
│   ├── models/            comandos SQL de cada tabela
│   ├── controllers/       recebem o pedido e devolvem a resposta
│   ├── routes/            rotas da API (api.js)
│   ├── middlewares/       usuário atual, banco disponível e tratamento de erros
│   ├── utils/             código de exibição (P001, S001) e erros de negócio
│   ├── views/             index.html e pages/ (telas de cada módulo)
│   └── public/            css/ e js/ (api.js, layout.js e paginas/)
├── database/
│   ├── schema/            01.schema.sql (tabelas)
│   ├── seed/              01.seed.sql (dados iniciais)
│   └── instalar.js        usado pelo npm run banco
├── tests/                 testes da árvore AVL e da API, e medição de desempenho
└── docs/
    ├── design-de-software/    requisitos, design, testes, implantação, uml/ e pdf/
    ├── banco-de-dados/        modelo entidade-relacionamento
    ├── estrutura-de-dados/    relatório da árvore AVL
    └── teoria-da-computacao/  relatório de lógica e criptografia
Integrantes
Caio Gabriel Honorato
Gustavo Alves Queiroz
João Pedro Moreira Costa
Matheus Borges
Octávio Freire
