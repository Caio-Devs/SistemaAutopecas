# Requisitos – CarWear

Sistema de controle de estoque e gestão inteligente para uma loja de autopeças, desenvolvido no Projeto Integrador 2026-2 (Faculdade SENAI FATESG).

## 1. Problema

A microempresa fictícia **CarWear**, uma loja de autopeças, controla vendas, estoque e despesas em planilhas e anotações soltas. Isso causa:

- retrabalho, porque o mesmo dado é anotado em vários lugares;
- saldo de estoque errado, porque as vendas nem sempre são baixadas;
- peças que acabam sem ninguém perceber a tempo;
- pouca visão do faturamento e das despesas da loja.

O CarWear junta tudo em um único sistema web e gera alertas e recomendações a partir de regras claras.

## 2. Usuários

| Perfil | Quem é | O que faz no sistema |
|---|---|---|
| **Administrador** | Dono ou gerente da loja | Tudo o que o Operador faz, mais: cadastro de produtos, categorias e fornecedores, ajustes de estoque, funcionários, despesas, painel gerencial, alertas, relatórios e ferramentas de privacidade (LGPD). |
| **Operador** | Vendedor de balcão | Faz login, registra vendas, consulta produtos e estoque, registra entradas e saídas de estoque e cadastra e edita clientes. |

Os perfis ficam na tabela `perfis` e são verificados no servidor em todas as rotas.

## 3. Escopo

**Dentro do escopo**

- Login com perfis Administrador e Operador.
- Cadastro de produtos (peças físicas e serviços), categorias de produto, clientes, fornecedores e funcionários.
- Controle de estoque por movimentações de entrada e saída (compra, venda, perda e ajuste), com estoque mínimo.
- Registro de vendas com baixa automática no estoque, em uma única transação.
- Registro de despesas por categoria.
- Painel gerencial com faturamento, despesas, mais vendidos e itens abaixo do mínimo.
- Funcionalidades inteligentes por regras: alerta de reposição, curva ABC, previsão de demanda e alerta de despesas anormais.
- Consultas com filtros e relatórios gerenciais.
- Árvore AVL de produtos em memória (Estrutura de Dados II).

**Fora do escopo**

- Emissão de nota fiscal.
- Integração com meios de pagamento.
- Inteligência artificial generativa ou chatbot.
- Atendimento a várias lojas ou empresas no mesmo sistema.

## 4. Regras de negócio

| ID | Regra |
|---|---|
| RN01 | Todo produto tem identificador único, descrição, preço de venda não negativo e categoria. |
| RN02 | Toda venda tem pelo menos um item, e o total é a soma dos subtotais. |
| RN03 | Produto físico não pode ficar com estoque negativo depois de uma venda; a tentativa é bloqueada com mensagem clara. |
| RN04 | A confirmação da venda e a baixa do estoque acontecem na mesma transação do banco. |
| RN05 | Só usuários autenticados e autorizados alteram cadastros sensíveis e veem informações gerenciais. |
| RN06 | Registro usado em uma venda não é excluído; ele é inativado para não quebrar o histórico. |
| RN07 | Alertas e recomendações são recalculados quando os dados mudam. |
| RN08 | Senhas são guardadas com hash e salt; dados pessoais seguem a LGPD. |
| RN09 | Se `estoque_atual ≤ estoque_minimo`, o sistema gera uma recomendação de reposição. |
| RN10 | Toda recomendação mostra os dados de entrada, a regra aplicada e o resultado. |
| RN11 | Toda despesa tem categoria válida, valor maior que zero, data e descrição. |
| RN12 | Serviços não têm saldo de estoque; só produtos físicos têm quantidade e estoque mínimo. |

## 5. Requisitos funcionais

"Essencial" é o mínimo exigido pelo PI. "Desejável" é extra.

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | Autenticar usuário por login e senha | Essencial |
| RF02 | Aplicar os perfis Administrador e Operador | Essencial |
| RF03 | Administrador cria, edita e inativa usuários | Desejável |
| RF04 | Encerrar a sessão (logout) | Desejável |
| RF05 | Cadastrar, editar, consultar e inativar produtos e serviços | Essencial |
| RF06 | Cadastrar categorias de produto e de despesa | Essencial |
| RF07 | Cadastrar clientes | Essencial |
| RF08 | Cadastrar fornecedores | Essencial |
| RF09 | Inativar, em vez de excluir, registros usados em vendas | Essencial |
| RF10 | Mostrar o aviso de privacidade (LGPD) e registrar o aceite no 1º acesso | Essencial |
| RF11 | Registrar entrada de estoque | Essencial |
| RF12 | Registrar saída manual de estoque (perda, ajuste) | Essencial |
| RF13 | Consultar a quantidade atual de cada produto | Essencial |
| RF14 | Definir estoque mínimo por produto físico | Essencial |
| RF15 | Consultar o histórico de movimentações | Desejável |
| RF16 | Registrar venda com itens, quantidades, preços, total e data | Essencial |
| RF17 | Vincular cliente à venda (opcional) | Desejável |
| RF18 | Bloquear venda de produto sem estoque suficiente | Essencial |
| RF19 | Dar baixa automática no estoque ao confirmar a venda | Essencial |
| RF20 | Consultar o histórico de vendas com itens e total | Essencial |
| RF22 | Registrar despesa com categoria, valor, data e descrição | Essencial |
| RF23 | Editar e consultar despesas | Essencial |
| RF24 | Alertar despesas acima da média histórica ou de um limite configurado | Desejável |
| RF25 | Mostrar faturamento por período | Essencial |
| RF26 | Mostrar despesas por período | Essencial |
| RF27 | Listar produtos mais vendidos | Essencial |
| RF28 | Listar itens abaixo do estoque mínimo | Essencial |
| RF29 | Mostrar o saldo do período (faturamento − despesas) | Desejável |
| RF30 | Gerar alerta de reposição | Essencial |
| RF31 | Classificar os produtos na curva ABC | Essencial |
| RF32 | Prever a demanda pela média móvel das vendas | Desejável |
| RF33 | Anonimizar os dados de um cliente a pedido, mantendo as vendas | Essencial |
| RF34 | Mostrar a justificativa de cada alerta e recomendação | Essencial |
| RF35 | Recalcular os alertas quando os dados mudarem | Essencial |
| RF37 | Consultas com filtros por período, categoria, produto e cliente | Essencial |
| RF38 | Relatório de vendas por período e por produto | Essencial |
| RF39 | Relatório de estoque crítico com curva ABC | Essencial |
| RF40 | Exportar relatórios em CSV ou PDF | Desejável |
| RF41 | Carregar os produtos do banco em uma árvore AVL antes de usá-los | Essencial |

## 6. Requisitos não funcionais (principais)

| ID | Requisito |
|---|---|
| RNF01 | Senhas guardadas com hash e salt (Argon2id ou bcrypt), nunca em texto puro. |
| RNF02 | Permissões verificadas no servidor, e não só escondidas na tela. |
| RNF03 | Consultas SQL parametrizadas, contra injeção de SQL. |
| RNF05 | Mensagens de erro não mostram detalhes internos (SQL, nomes de tabela). |
| RNF06 | Coletar só os dados pessoais necessários. |
| RNF07 | Dados pessoais de clientes acessíveis só a perfis autorizados. |
| RNF09 | Telas principais respondem em até 2 segundos com 1.000 produtos e 10.000 vendas. |
| RNF10 | O painel gerencial responde em até 3 segundos com o mesmo volume. |
| RNF11 | Registrar uma venda em até 5 interações principais. |
| RNF12 | Mensagens de validação claras, dizendo o que corrigir. |
| RNF14 | Venda e baixa do estoque seguem as propriedades ACID. |
| RNF15 | Backup com RPO de 24 horas e RTO de 4 horas, com recuperação testada. |
| RNF16 | Integridade garantida pelo banco: PK, FK, NOT NULL e CHECK. |
| RNF18 | Código organizado em camadas e versionado no Git. |
| RNF19 | Documentação no repositório, com `README.md`. |
| RNF21 | Roda com um único banco relacional e uma aplicação simples. |
| RNF23 | Carga inicial dos dados por CSV ou script SQL. |

## 7. Histórias de usuário

As histórias descrevem o que cada usuário quer fazer no sistema e por quê. Cada história tem **critérios de aceitação** (como saber que ela está pronta) e as **regras de negócio e requisitos** ligados a ela.

### 7.1 Painel (dashboard)

#### HU01 – Faturamento por período
Como administrador, quero visualizar o faturamento por período para acompanhar os resultados da empresa.
- **Critérios de aceitação:**
  - O usuário escolhe a data inicial e a data final.
  - O valor mostrado é igual à soma do `valor_total` das vendas do período.
  - Período sem vendas mostra R$ 0,00.
  - O Operador não tem acesso ao painel.
- **Regras e requisitos:** RN05 · RF25

#### HU02 – Despesas no painel
Como administrador, quero visualizar as despesas registradas para acompanhar os gastos.
- **Critérios de aceitação:**
  - O total mostrado é igual à soma das despesas do período escolhido.
  - As despesas aparecem separadas por categoria de despesa.
- **Regras e requisitos:** RN05 · RF26

#### HU03 – Produtos mais vendidos
Como administrador, quero identificar os produtos mais vendidos para acompanhar o desempenho das vendas.
- **Critérios de aceitação:**
  - A lista é ordenada pela quantidade vendida no período, da maior para a menor.
  - Cada produto mostra a quantidade vendida e o valor total vendido.
- **Regras e requisitos:** RN05 · RF27

#### HU04 – Produtos abaixo do estoque mínimo
Como administrador, quero visualizar produtos abaixo do estoque mínimo para identificar a necessidade de reposição.
- **Critérios de aceitação:**
  - Aparecem os produtos físicos ativos com `estoque_atual ≤ estoque_minimo`.
  - Serviços não aparecem, porque não têm estoque.
  - A lista se atualiza depois de cada venda ou movimentação.
- **Regras e requisitos:** RN07, RN09, RN12 · RF28

### 7.2 Cadastro de produtos

#### HU05 – Cadastrar produtos
Como administrador, quero cadastrar produtos com descrição, tipo e categoria para manter as informações organizadas.
- **Critérios de aceitação:**
  - Descrição, tipo (peça física ou serviço) e categoria são obrigatórios.
  - Cada produto recebe um identificador único (`id_produto`), que é o código usado na venda e na árvore AVL.
  - Produto já usado em alguma venda não pode ser excluído, só inativado.
  - O produto novo entra na árvore AVL logo depois de ser salvo no banco.
- **Regras e requisitos:** RN01, RN06 · RF05, RF06, RF09, RF41

#### HU06 – Preço de venda
Como administrador, quero informar o preço de venda para controlar os valores dos produtos.
- **Critérios de aceitação:**
  - Preço negativo é recusado.
  - Mudar o preço não altera vendas antigas: cada item de venda guarda o preço da época (`preco_unitario`).
- **Regras e requisitos:** RN01 · RF05, RF20

#### HU07 – Quantidade em estoque e estoque mínimo
Como administrador, quero registrar a quantidade em estoque e o estoque mínimo para acompanhar a disponibilidade.
- **Critérios de aceitação:**
  - Quantidade e estoque mínimo não aceitam valores negativos.
  - Depois do cadastro, a quantidade só muda por venda ou movimentação de estoque.
  - Serviços ficam sem quantidade e sem estoque mínimo (campos vazios).
- **Regras e requisitos:** RN03, RN12 · RF14

### 7.3 Controle de estoque

#### HU08 – Entrada de mercadorias
Como operador, quero registrar a entrada de mercadorias para atualizar o estoque.
- **Critérios de aceitação:**
  - A quantidade precisa ser maior que zero.
  - O estoque aumenta exatamente na quantidade informada.
  - A entrada é gravada como movimentação do tipo ENTRADA e motivo COMPRA, com data, produto, quantidade, usuário e fornecedor.
  - Se o produto estava em alerta e voltou a ficar acima do mínimo, o alerta passa para RESOLVIDO.
- **Regras e requisitos:** RN07 · RF11, RF35

#### HU09 – Saída de mercadorias
Como operador, quero registrar a saída de mercadorias para manter a quantidade atualizada.
- **Critérios de aceitação:**
  - A quantidade precisa ser maior que zero e menor ou igual ao estoque atual.
  - A saída é gravada como movimentação do tipo SAIDA e motivo PERDA.
  - Saída que deixaria o estoque negativo é recusada com mensagem clara.
- **Regras e requisitos:** RN03, RN07 · RF12

#### HU10 – Ajuste de estoque
Como administrador, quero realizar ajustes na quantidade de produtos para corrigir possíveis divergências.
- **Critérios de aceitação:**
  - Só o Administrador consegue fazer ajustes.
  - O usuário informa a quantidade correta, e o sistema grava a diferença como movimentação de motivo AJUSTE (ENTRADA se aumentou, SAIDA se diminuiu).
  - A quantidade ajustada não pode ser negativa.
- **Regras e requisitos:** RN03, RN05 · RF12

#### HU11 – Histórico de movimentações
Como administrador, quero consultar o histórico de movimentações para acompanhar as alterações no estoque.
- **Critérios de aceitação:**
  - Cada movimentação mostra data e hora, tipo, motivo, quantidade e usuário.
  - É possível filtrar por produto e por período.
- **Regras e requisitos:** RF15, RF37

### 7.4 Vendas

#### HU12 – Registrar venda
Como operador, quero registrar uma venda para realizar o atendimento ao cliente.
- **Critérios de aceitação:**
  - Ao digitar o código do produto, o sistema mostra a descrição, o preço e o estoque (busca pela árvore AVL).
  - Ligar um cliente à venda é opcional; sem cliente, é venda de balcão.
  - A venda fica registrada com o usuário que a fez.
- **Regras e requisitos:** RF16, RF17, RF41

#### HU13 – Vários produtos na mesma venda
Como operador, quero adicionar vários produtos à mesma venda para registrar todos os itens comprados.
- **Critérios de aceitação:**
  - É possível incluir e remover itens antes de confirmar.
  - Venda sem nenhum item não pode ser confirmada.
  - Produto inativo não pode ser adicionado.
- **Regras e requisitos:** RN02, RN06 · RF16

#### HU14 – Quantidade de cada produto
Como operador, quero informar as quantidades de cada produto para calcular corretamente o valor da compra.
- **Critérios de aceitação:**
  - Quantidade zero ou negativa é recusada.
  - Em produto físico, quantidade maior que o estoque é bloqueada com a mensagem "Estoque insuficiente".
- **Regras e requisitos:** RN03, RN12 · RF18

#### HU15 – Subtotais e total
Como operador, quero visualizar os subtotais e o valor total para informar o preço final ao cliente.
- **Critérios de aceitação:**
  - Subtotal = quantidade × preço unitário.
  - Total = soma dos subtotais.
  - Os valores são atualizados na hora, ao incluir ou remover um item.
- **Regras e requisitos:** RN02 · RF16

#### HU16 – Data da venda e baixa automática no estoque
Como operador, quero que o sistema registre a data da venda e atualize automaticamente o estoque para manter os registros corretos.
- **Critérios de aceitação:**
  - A data e a hora são gravadas automaticamente.
  - Ao confirmar, o estoque de cada produto físico diminui na quantidade vendida, e cada baixa fica registrada como movimentação SAIDA / VENDA.
  - A venda, os itens e a baixa acontecem na mesma transação: se algo falhar, nada é gravado e o estoque não muda.
  - Depois da venda, a árvore AVL e os alertas são atualizados.
- **Regras e requisitos:** RN04, RN07 · RF19, RF35

#### HU17 – Histórico de vendas
Como administrador, quero consultar o histórico de vendas para acompanhar as operações realizadas.
- **Critérios de aceitação:**
  - Cada venda mostra data, total, operador e cliente (ou "Balcão", se não houver).
  - Ao abrir uma venda, aparecem os itens com o preço da época.
  - É possível filtrar por período.
- **Regras e requisitos:** RF20, RF37

### 7.5 Clientes

#### HU18 – Cadastrar clientes
Como operador, quero cadastrar clientes com nome e telefone para manter seus dados registrados.
- **Critérios de aceitação:**
  - O nome é obrigatório; o telefone é opcional.
  - O sistema não pede dados além dos necessários (como CPF, e-mail ou endereço).
- **Regras e requisitos:** RN08 · RF07, RNF06

#### HU19 – Consultar e editar clientes
Como operador, quero consultar e editar os dados dos clientes para manter as informações atualizadas.
- **Critérios de aceitação:**
  - A busca por nome mostra os clientes que contêm o texto.
  - As alterações ficam salvas.
  - Cliente com compras não pode ser excluído, só inativado.
  - Cliente inativo não pode ser escolhido em novas vendas.
- **Regras e requisitos:** RN06 · RF07, RF09

#### HU20 – Histórico de compras do cliente
Como administrador, quero consultar o histórico de compras dos clientes para acompanhar seus pedidos anteriores.
- **Critérios de aceitação:**
  - Aparecem todas as vendas ligadas ao cliente, com data e total.
  - Aparece também o total gasto pelo cliente.
- **Regras e requisitos:** RN05 · RF20

#### HU21 – Anonimizar dados do cliente (LGPD)
Como administrador, quero anonimizar os dados de um cliente quando ele pedir para respeitar a LGPD.
- **Critérios de aceitação:**
  - O nome é trocado por um texto genérico (ex.: "Cliente anonimizado"), o telefone é apagado e o cliente fica inativo.
  - As vendas do cliente continuam no histórico, sem identificar a pessoa.
- **Regras e requisitos:** RN06, RN08 · RF33

### 7.6 Fornecedores

#### HU22 – Cadastrar fornecedores
Como administrador, quero cadastrar fornecedores com nome e telefone para manter seus dados organizados.
- **Critérios de aceitação:**
  - O nome é obrigatório; o telefone é opcional.
  - Fornecedor com histórico de entradas não pode ser excluído, só inativado.
- **Regras e requisitos:** RN06 · RF08, RF09

#### HU23 – Produtos de cada fornecedor
Como administrador, quero consultar os produtos fornecidos por cada fornecedor para facilitar as compras.
- **Critérios de aceitação:**
  - Ao abrir um fornecedor, aparecem os produtos que já entraram no estoque por compra dele (movimentações ENTRADA / COMPRA).
- **Regras e requisitos:** RF08, RF15

#### HU24 – Histórico de compras e entradas do fornecedor
Como administrador, quero consultar o histórico de compras e entradas de mercadorias para acompanhar o relacionamento com os fornecedores.
- **Critérios de aceitação:**
  - Aparecem as entradas de estoque ligadas ao fornecedor, com data, produto e quantidade.
  - É possível filtrar por período.
- **Regras e requisitos:** RF11, RF15

### 7.7 Financeiro / Despesas

#### HU25 – Registrar despesas
Como administrador, quero registrar despesas com categoria, valor, data e descrição para controlar os gastos da empresa.
- **Critérios de aceitação:**
  - A categoria é escolhida entre as categorias de despesa cadastradas.
  - Categoria, valor, data e descrição são obrigatórios.
  - Valor zero ou negativo é recusado.
  - O Operador não tem acesso às despesas.
- **Regras e requisitos:** RN05, RN11 · RF06, RF22

#### HU26 – Consultar despesas por período
Como administrador, quero consultar as despesas por período para acompanhar a movimentação financeira.
- **Critérios de aceitação:**
  - É possível filtrar por período e por categoria.
  - O total mostrado é igual à soma das despesas filtradas.
  - É possível editar uma despesa já registrada.
- **Regras e requisitos:** RF23, RF37

### 7.8 Funcionários e permissões

#### HU27 – Acessar o sistema
Como funcionário, quero acessar o sistema utilizando login e senha para utilizar suas funcionalidades.
- **Critérios de aceitação:**
  - Login e senha corretos abrem o sistema com as funções do perfil do usuário.
  - Dados errados mostram "Login ou senha inválidos", sem dizer qual dos dois está errado.
  - Usuário inativo não consegue entrar.
  - No primeiro acesso, aparece o aviso de privacidade, e o aceite fica registrado com data e hora.
- **Regras e requisitos:** RN08 · RF01, RF10

#### HU28 – Cadastrar e gerenciar funcionários
Como administrador, quero cadastrar e gerenciar funcionários para controlar o acesso ao sistema.
- **Critérios de aceitação:**
  - O login é único.
  - A senha é guardada com hash, nunca em texto puro.
  - O funcionário que sai da empresa é inativado, não excluído.
- **Regras e requisitos:** RN06, RN08 · RF03

#### HU29 – Perfis de acesso
Como administrador, quero definir os perfis de administrador e operador para organizar as permissões de cada funcionário.
- **Critérios de aceitação:**
  - Cada funcionário tem um único perfil: Administrador ou Operador.
  - A mudança de perfil vale a partir do próximo login.
- **Regras e requisitos:** RN05 · RF02

#### HU30 – Restringir o acesso
Como administrador, quero restringir o acesso a determinadas funcionalidades para proteger as informações do sistema.
- **Critérios de aceitação:**
  - O Operador não vê os menus de funções do Administrador.
  - Se o Operador tentar abrir uma função do Administrador pelo endereço direto, o servidor recusa com a mensagem "Acesso não permitido para este perfil".
- **Regras e requisitos:** RN05 · RF02, RNF02

### 7.9 Relatórios

#### HU31 – Relatório de produtos em estoque
Como administrador, quero gerar relatórios de produtos em estoque para acompanhar a disponibilidade de mercadorias.
- **Critérios de aceitação:**
  - O relatório mostra código, descrição, categoria, quantidade, estoque mínimo e situação ("OK" ou "Repor").
  - Os produtos vêm ordenados por código (percurso em ordem da árvore AVL).
- **Regras e requisitos:** RN09 · RF39, RF41

#### HU32 – Filtros nos relatórios
Como administrador, quero aplicar filtros por data, categoria e produto para encontrar informações específicas.
- **Critérios de aceitação:**
  - Filtros combinados mostram só os registros que atendem a todos eles.
  - Os totais do relatório batem com os do painel no mesmo período.
  - Se nada for encontrado, o sistema mostra "Nenhum registro encontrado".
- **Regras e requisitos:** RF37, RF38

### 7.10 Funcionalidades inteligentes

#### HU33 – Alerta inteligente de reposição
Como administrador, quero receber alertas inteligentes de reposição quando um produto atingir ou ficar abaixo do estoque mínimo para evitar a falta de mercadorias.
- **Critérios de aceitação:**
  - O alerta é gerado quando `estoque_atual ≤ estoque_minimo`, com status ATIVO.
  - O alerta mostra os dados de entrada, a regra e o resultado. Exemplo: "estoque_atual = 4, estoque_minimo = 5 · regra: estoque_atual ≤ estoque_minimo · resultado: repor Filtro de óleo".
  - O alerta é recalculado depois de cada venda ou movimentação e passa para RESOLVIDO quando o estoque volta a ficar acima do mínimo.
- **Regras e requisitos:** RN07, RN09, RN10 · RF30, RF34, RF35

#### HU34 – Curva ABC
Como administrador, quero visualizar a classificação ABC dos produtos para identificar quais possuem maior importância financeira nas vendas.
- **Critérios de aceitação:**
  - Cada produto mostra o faturamento no período e o percentual acumulado.
  - A classificação segue a regra mostrada na tela: A até 80% do faturamento acumulado, B até 95% e C o restante.
  - O cálculo é feito por consulta no momento, sem ser guardado em tabela.
- **Regras e requisitos:** RN10 · RF31, RF34

#### HU35 – Previsão de demanda
Como administrador, quero consultar a previsão de demanda baseada na média das vendas anteriores para planejar a reposição de produtos.
- **Critérios de aceitação:**
  - A previsão é a média das quantidades vendidas por mês nos últimos 3 meses (média móvel).
  - A tela mostra os meses usados, a fórmula e o resultado.
  - Produto com menos de 3 meses de vendas mostra "Dados insuficientes para previsão".
- **Regras e requisitos:** RN10 · RF32, RF34

#### HU36 – Alerta de despesas anormais
Como administrador, quero receber alertas sobre despesas anormais que ultrapassem limites configurados ou a média histórica para identificar possíveis gastos elevados.
- **Critérios de aceitação:**
  - O alerta aparece no painel quando uma despesa passa do limite configurado para a categoria ou fica 50% acima da média dos últimos 3 meses dessa categoria.
  - O alerta mostra o valor da despesa, a média ou o limite usado e a regra aplicada.
- **Regras e requisitos:** RN10 · RF24, RF34
