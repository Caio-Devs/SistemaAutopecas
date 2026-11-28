# Testes – CarWear

Testes do fluxo principal (registrar venda), com cenários de sucesso e de rejeição por regra de negócio. Cada teste indica as histórias de usuário e os critérios de aceitação verificados, e o resultado obtido.

As histórias estão em [requisitos.md](requisitos.md).

## Dados usados nos testes

| Código (`id_produto`) | Descrição | Tipo | Preço | Estoque inicial | Estoque mínimo |
|---|---|---|---|---|---|
| 1 | Filtro de óleo | FISICO | R$ 35,00 | 10 | 5 |

Usuários: `admin` (perfil Administrador) e `operador` (perfil Operador).

---

## CT01 – Registrar venda com estoque suficiente (sucesso)

- **Histórias:** HU16 – Data da venda e baixa automática no estoque; HU15 – Subtotais e total
- **Critérios de aceitação verificados:** "Ao confirmar, o estoque de cada produto físico diminui na quantidade vendida, e cada baixa fica registrada como movimentação SAIDA / VENDA" (HU16) e "Total = soma dos subtotais" (HU15).
- **Regras:** RN02, RN04

**Passos**
1. Entrar como `operador`.
2. Abrir a tela de venda e informar o código 1, quantidade 3.
3. Confirmar a venda.

**Resultado esperado**
- Uma linha nova em `vendas` com `valor_total` = R$ 105,00 (3 × R$ 35,00) e uma linha em `item_venda` com `preco_unitario` = R$ 35,00.
- O `estoque_atual` do produto 1 passa de 10 para 7.
- Uma linha nova em `movimentacao_estoque` com tipo SAIDA, motivo VENDA e quantidade 3.
- Nenhum alerta de reposição, porque 7 > 5.

**Resultado obtido:** _(preencher após executar)_
**Situação:** ☐ Passou ☐ Falhou
**Evidência:** _(print da tela)_

---

## CT02 – Venda com quantidade maior que o estoque (rejeição)

- **Histórias:** HU14 – Quantidade de cada produto; HU16 – Data da venda e baixa automática no estoque
- **Critérios de aceitação verificados:** "Em produto físico, quantidade maior que o estoque é bloqueada com a mensagem 'Estoque insuficiente'" (HU14) e "se algo falhar, nada é gravado e o estoque não muda" (HU16).
- **Regras:** RN03, RN04

**Passos**
1. Entrar como `operador`.
2. Abrir a tela de venda e informar o código 1, quantidade 15 (o estoque é 10).
3. Tentar confirmar a venda.

**Resultado esperado**
- O sistema mostra "Estoque insuficiente".
- Nenhuma linha nova em `vendas`, `item_venda` ou `movimentacao_estoque`.
- O `estoque_atual` do produto 1 continua 10.

**Resultado obtido:** _(preencher após executar)_
**Situação:** ☐ Passou ☐ Falhou
**Evidência:** _(print da tela)_

---

## CT03 – Venda que gera alerta de reposição (sucesso)

- **História:** HU33 – Alerta inteligente de reposição
- **Critérios de aceitação verificados:** "O alerta é gerado quando estoque_atual ≤ estoque_minimo, com status ATIVO" e "o alerta mostra os dados de entrada, a regra e o resultado".
- **Regras:** RN07, RN09, RN10

**Passos**
1. Com o produto 1 em 10 unidades, entrar como `operador` e vender 6 unidades.
2. Entrar como `admin` e abrir o painel.

**Resultado esperado**
- O `estoque_atual` do produto 1 passa para 4.
- Uma linha nova em `alertas` com tipo REPOSICAO e status ATIVO.
- O painel mostra o alerta com:
  - dados de entrada: "estoque_atual = 4, estoque_minimo = 5";
  - regra: "estoque_atual ≤ estoque_minimo";
  - resultado: "repor Filtro de óleo".

**Resultado obtido:** _(preencher após executar)_
**Situação:** ☐ Passou ☐ Falhou
**Evidência:** _(print da tela)_

---

## CT04 – Operador tenta abrir o painel gerencial (rejeição)

- **Histórias:** HU30 – Restringir o acesso; HU01 – Faturamento por período
- **Critérios de aceitação verificados:** "Se o Operador tentar abrir uma função do Administrador pelo endereço direto, o servidor recusa com a mensagem 'Acesso não permitido para este perfil'" (HU30) e "o Operador não tem acesso ao painel" (HU01).
- **Regras:** RN05

**Passos**
1. Entrar como `operador`.
2. Tentar abrir o endereço do painel diretamente no navegador.

**Resultado esperado**
- O sistema recusa o acesso com a mensagem "Acesso não permitido para este perfil".
- Nenhum dado do painel é mostrado.

**Resultado obtido:** _(preencher após executar)_
**Situação:** ☐ Passou ☐ Falhou
**Evidência:** _(print da tela)_

---

## Resumo

| Teste | Tipo | Histórias | Situação |
|---|---|---|---|
| CT01 | Sucesso | HU15, HU16 | _(preencher)_ |
| CT02 | Rejeição por regra de negócio | HU14, HU16 | _(preencher)_ |
| CT03 | Sucesso | HU33 | _(preencher)_ |
| CT04 | Rejeição por regra de negócio | HU01, HU30 | _(preencher)_ |
