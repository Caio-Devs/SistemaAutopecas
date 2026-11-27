# Teoria da Computação — Gestor Ágil

## Objetivo

Aplicar os conceitos de Teoria da Computação ao sistema de gestão de autopeças Gestor Ágil, utilizando lógica matemática, formalização de regras de negócio, teoria dos números e criptografia RSA.

## Estrutura dos arquivos

| Arquivo | Responsabilidade |
|---|---|
| regrasNegocio.js | Validação das regras de negócio |
| logicaMatematica.js | Conectivos lógicos e tabelas-verdade |
| teoriaNumeros.js | Operações matemáticas e aritmética modular |
| rsa.js | Criptografia e descriptografia RSA |
| testes.js | Testes automatizados |
| main.js | Menu de demonstração acadêmica |

## Regras implementadas

- RN01 — Validação do cadastro de produtos.
- RN02 — Validação de vendas.
- RN03 — Controle de estoque não negativo.
- RN04 — Simulação de atomicidade das vendas.
- RN05 — Autenticação e autorização simuladas.
- RN12 — Serviços sem movimentação de estoque.

## Tecnologias utilizadas

- JavaScript.
- Node.js.
- CommonJS.
- BigInt.
- Node Assert.

## Como executar o programa

Na pasta raiz do projeto, execute:

`node src/teoria-computacao/main.js`

## Como executar os testes

`node src/teoria-computacao/testes.js`

## Resultados dos testes

| Categoria | Aprovados | Reprovados |
|---|---:|---:|
| Regras de negócio | 33 | 0 |
| Lógica matemática | 9 | 0 |
| Teoria dos números | 14 | 0 |
| Criptografia RSA | 12 | 0 |
| Total | 68 | 0 |

Aproveitamento: 100%.

## Demonstração RSA

- p = 5
- q = 11
- n = 55
- φ(n) = 40
- Chave pública: (55, 3)
- Chave privada: (55, 27)
- Mensagem original: 7
- Mensagem criptografada: 13
- Mensagem recuperada: 7

## Considerações sobre a integração

O módulo funciona independentemente do banco de dados, utilizando dados simulados.

As transações reais, a persistência dos dados e a autenticação deverão ser integradas posteriormente ao backend e ao banco de dados.

O RSA possui finalidade exclusivamente acadêmica, não sendo adequado para segurança em produção.

A integração demonstrativa com o front-end encontra-se em uma branch separada e ainda não foi integralmente validada pelo navegador.