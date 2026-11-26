# Modelo de ERS – Especificação de Requisitos de Software

Nov 26, 2026 · @Octávio

## Histórico de revisões

| Versão | Data | Autor | Descrição da alteração |
| --- | --- | --- | --- |
| 1.0 | 25/11/2026 | Octávio Freire | Versão inicial do documento |
| 1.1 | DD/MM/AAAA | \[Nome do autor\] | \[O que mudou e por quê\] |

## 1. Introdução

Este documento especifica **o que** o sistema CarWear deve fazer, sem definir **como** será implementado.&#32;

### 1.1 Propósito

Este documento tem como finalidade registrar as informações gerais de: definições, referências e requisitos. Escrita para a equipe de desenvolvimento, clientes, usuários, testadores e o professor orientador.

### 1.2 Escopo

- **Nome do produto:** CarWear

* **O sistema fará:**&#32;

Registrar e gerenciar: perfis, usuários, despesas, categorias de despesas, produtos, categorias de produtos, fornecedores, vendas, item de venda, clientes e alertas.

- **O sistema não fará:** \[o que fica explicitamente de fora, para evitar mal-entendidos\]

* **Objetivos e benefícios:** O sistema substitui as planilhas e anotações soltas da microempresa fictícia "CarWear" por uma aplicação única de cadastros, estoque, vendas, despesas e indicadores, com alertas e recomendações baseados em regras transparentes.

### 1.3 Definições, siglas e abreviações

| Termo | Definição |
| --- | --- |
| ERS | Especificação de Requisitos de Software |
| RF | Requisito Funcional |
| RNF | Requisito Não Funcional |
| RN | Regra de Negócio |
| UC | Caso de Uso (Use Case) |
| API | Interface de Programação de Aplicações |
| LGPD | Lei Geral de Proteção de Dados (Lei nº 13.709/2018) |
| \[Termo do domínio\] | \[Definição usada neste projeto\] |

### 1.4 Referências

- PI2026-2 ENG4-T2
- &#91;Normas ou padrões usados, como IEEE 830 / ISO/IEC/IEEE 29148\]
- &#91;Legislação aplicável, como a LGPD\]

### 1.5 Visão geral do documento

A seção 2 descreve o produto de forma geral. As seções 3 a 6 detalham os requisitos funcionais, não funcionais, regras de negócio e interfaces. A seção 7 reúne atores e casos de uso, e a seção 8 mostra a rastreabilidade entre requisitos.

## 2. Descrição geral

Esta seção dá o contexto do produto: onde ele se encaixa, quem o usa e o que limita o projeto. Ela não lista requisitos detalhados.

### 2.1 Perspectiva do produto

O sistema é novo, com a finalidade de centralizar e organizar as operações da empresa.

### 2.2 Funções do produto (resumo)

- Registrar usuários
- Registrar produtos
- Registrar vendas
- Registrar despesas
- Registrar categorias
- Gerenciar usuários
- Gerenciar produtos
- Gerenciar vendas
- Gerenciar despesas
- Gerenciar categorias
- emitir relatórios gerenciais

### 2.3 Perfis de usuário

| Perfil | Descrição | Conhecimento técnico |
| --- | --- | --- |
| Administrador | Acesso total, gerencia usuários, cadastros sensíveis e informações gerenciais | Alto |
| Operador | Cadastra e consulta dados, registra vendas, movimentações e clientes&#32; | Médio |

### 2.4 Ambiente operacional

&#91;Onde o sistema roda: web, desktop, mobile; navegadores e sistemas operacionais suportados; servidor ou nuvem.\]

### 2.5 Restrições

- &#91;Tecnologia obrigatória, ex. Java 21, MySQL\]
- &#91;Prazo e orçamento\]
- &#91;Normas ou leis, ex. LGPD\]

### 2.6 Premissas e dependências

- **Premissa:** \[algo que se assume verdadeiro, ex. os usuários terão acesso à internet\]
- **Dependência:** \[algo externo de que o projeto depende, ex. API de pagamento de terceiros\]

## 3. Requisitos funcionais

Requisitos funcionais (RF) descrevem o que o sistema deve fazer. Cada RF tem um ID único, é escrito com "O sistema deve..." e pode ser verificado por teste. Prioridade: **Essencial** (sem ele o sistema não serve), **Importante** (esperado, mas há contorno) ou **Desejável** (pode ficar para depois).

### 3.1 Lista resumida

| ID | Requisito | Descrição | Prioridade | Caso de uso |
| --- | --- | --- | --- | --- |
| RF001 | Autenticar usuário | O sistema deve permitir que o usuário acesse o sistema com e-mail e senha. | Essencial | UC01 |
| RF002 | Cadastrar cliente | O sistema deve permitir cadastrar, editar, consultar e inativar clientes. | Essencial | UC02 |
| RF003 | Emitir relatório | O sistema deve gerar relatório de \[X\] filtrável por período. | Importante | UC03 |
| RF004 | \[Nome\] | O sistema deve \[ação verificável\]. | \[Prioridade\] | \[UC\] |

*Os requisitos acima são exemplos: substitua pelos do seu projeto.*

### 3.2 Ficha detalhada (modelo)

Copie esta tabela para cada requisito que precisar de detalhamento.

| Campo | Preenchimento |
| --- | --- |
| ID | RF002 |
| Nome | Cadastrar cliente |
| Descrição | O sistema deve permitir o cadastro de novos clientes. |
| Ator | Operador |
| Prioridade | Essencial |
| Pré-condições | Usuário autenticado com perfil Operador ou Administrador. |
| Entradas | Nome, CPF/CNPJ, telefone, e-mail, endereço. |
| Fluxo principal | 1. O ator informa os dados. 2. O sistema valida os campos. 3. O sistema grava o cliente. 4. O sistema exibe mensagem de sucesso. |
| Fluxos alternativos e exceções | CPF já cadastrado: o sistema informa o erro e não grava. Campo obrigatório vazio: o sistema destaca o campo. |
| Saídas | Cliente cadastrado e mensagem de confirmação. |
| Pós-condições | O cliente aparece na listagem e pode ser usado em vendas. |
| Regras de negócio | RN001, RN002 |
| Critério de aceitação | Dado um CPF válido e inédito, quando o operador salvar, então o cliente é gravado e listado. |

## 4. Requisitos não funcionais

Requisitos não funcionais (RNF) descrevem **como** o sistema deve se comportar: qualidade, limites e padrões. Todo RNF precisa ser mensurável; "rápido" não serve, "responde em até 2 segundos" serve.

| ID | Categoria | Requisito | Como verificar |
| --- | --- | --- | --- |
| RNF001 | Desempenho | O sistema deve responder a 95% das consultas em até 2 s com 100 usuários simultâneos. | Teste de carga |
| RNF002 | Segurança | As senhas devem ser armazenadas com hash (ex.: bcrypt), nunca em texto puro. | Inspeção do banco e revisão de código |
| RNF003 | Segurança | O acesso a cada função deve respeitar o perfil do usuário. | Testes de autorização |
| RNF004 | Usabilidade | Um usuário novo deve concluir o cadastro de um cliente em até 3 minutos sem treinamento. | Teste de usabilidade |
| RNF005 | Disponibilidade | O sistema deve estar disponível 99% do tempo no horário comercial. | Monitoramento |
| RNF006 | Compatibilidade | O sistema deve funcionar nas duas últimas versões do Chrome, Firefox e Edge. | Teste em navegadores |
| RNF007 | Privacidade (LGPD) | Dados pessoais só podem ser coletados para finalidade declarada, e o titular deve poder solicitar exclusão. | Revisão jurídica e teste funcional |
| RNF008 | Manutenibilidade | O código deve seguir \[padrão de codificação\] e ter cobertura de testes unitários de pelo menos \[X\]%. | Análise estática e relatório de cobertura |
| RNF009 | Backup | O banco de dados deve ter backup diário com retenção de \[N\] dias. | Verificação do agendamento e teste de restauração |

*Exemplos para substituir: mantenha apenas as categorias que fazem sentido no seu projeto.*

## 5. Regras de negócio

Regras de negócio (RN) vêm da organização ou da lei e valem independentemente do software. Os requisitos funcionais citam as RNs que precisam respeitar.

| ID | Regra | Origem |
| --- | --- | --- |
| RN001 | Não pode haver dois clientes com o mesmo CPF/CNPJ. | Política da empresa |
| RN002 | Cliente inativo não pode ser selecionado em novas vendas. | Cliente / gerente |
| RN003 | \[Ex.: desconto máximo de 10% sem autorização do gerente.\] | \[Quem definiu\] |

## 6. Interfaces externas

Aqui entra tudo o que o sistema usa para se comunicar com pessoas, equipamentos e outros sistemas.

| Tipo | Descrição | Detalhes |
| --- | --- | --- |
| Interface com o usuário | \[Telas, padrão visual, idioma, acessibilidade\] | \[Ex.: interface web responsiva em português do Brasil, wireframes no anexo A\] |
| Interface de hardware | \[Dispositivos usados, se houver\] | \[Ex.: leitor de código de barras, impressora fiscal\] |
| Interface de software | \[Sistemas e serviços com os quais integra\] | \[Ex.: banco MySQL 8, API de CEP, gateway de pagamento\] |
| Interface de comunicação | \[Protocolos e formatos\] | \[Ex.: HTTPS, REST com JSON, e-mail via SMTP\] |

## 7. Modelos e casos de uso

Casos de uso mostram como cada ator interage com o sistema. Insira aqui o **diagrama de casos de uso (UML)** do seu projeto e, se necessário, outros modelos (diagrama de classes, de atividades, MER).

### 7.1 Atores

| Ator | Descrição |
| --- | --- |
| Administrador | Gerencia usuários e configurações. |
| Operador | Executa as rotinas do dia a dia. |
| \[Sistema externo\] | \[Ex.: API de pagamento que recebe e confirma transações.\] |

### 7.2 Lista de casos de uso

| ID | Caso de uso | Ator principal | Requisitos relacionados |
| --- | --- | --- | --- |
| UC01 | Autenticar no sistema | Todos | RF001, RNF002, RNF003 |
| UC02 | Gerenciar clientes | Operador | RF002, RN001, RN002 |
| UC03 | Emitir relatório | Administrador | RF003 |
| UC04 | \[Nome\] | \[Ator\] | \[RF, RNF, RN\] |

## 8. Matriz de rastreabilidade e critérios de aceitação

A matriz liga cada requisito à sua origem, ao caso de uso que o realiza e ao teste que o valida. Assim você descobre rápido o impacto de uma mudança e se algum requisito ficou sem teste.

| Requisito | Origem | Caso de uso | Caso de teste | Situação |
| --- | --- | --- | --- | --- |
| RF001 | \[Reunião com o cliente, dd/mm\] | UC01 | CT001 | Não iniciado |
| RF002 | \[Entrevista com o operador\] | UC02 | CT002, CT003 | Não iniciado |
| RNF001 | \[Meta de desempenho acordada\] | – | CT010 | Não iniciado |

### Critérios de aceitação

Escreva cada critério em formato **Dado / Quando / Então**, para que ele vire teste:

- **Dado** um operador autenticado, **quando** ele salvar um cliente com CPF já cadastrado, **então** o sistema recusa o cadastro e exibe a mensagem "CPF já cadastrado".
- **Dado** \[contexto\], **quando** \[ação\], **então** \[resultado esperado e verificável\].

## Apêndice: dicas de preenchimento e erros comuns

Apague este apêndice antes de entregar o documento.

- **Um requisito, uma ideia.** "O sistema deve cadastrar e excluir clientes" são dois requisitos; separe.
- **Fale do quê, não do como.** "O sistema deve permitir login" é requisito; "usar JWT com Spring Security" é decisão de projeto, e entra só se o cliente a impuser (seção 2.5).
- **Evite palavras vagas:** rápido, fácil, amigável, moderno, flexível. Troque por números ou critérios que alguém consiga testar.
- **Padronize os verbos.** "Deve" = obrigatório, "deveria" = recomendado, "pode" = opcional.
- **Cada requisito precisa de ID único e estável.** Nunca reaproveite o ID de um requisito removido.
- **Não esqueça o que está fora do escopo** (seção 1.2); é isso que evita o "ah, mas eu achei que tinha".
- **Requisitos sem dono, sem origem ou sem teste são suspeitos.** A matriz da seção 8 existe para encontrá-los.
- **Valide com o cliente ou usuário** antes de congelar a versão 1.0, e registre mudanças posteriores no histórico de revisões.
- **Erro frequente:** confundir regra de negócio com requisito funcional. A regra é a lei do domínio ("CPF único"); o RF é a função do sistema que a respeita ("validar CPF no cadastro").
