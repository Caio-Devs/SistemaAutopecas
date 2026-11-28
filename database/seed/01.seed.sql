-- =====================================================================
-- CarWear - Dados iniciais para desenvolvimento e demonstração
-- Rodar DEPOIS de database/schema/01.schema.sql
--
-- Usuários de demonstração (senhas com hash bcrypt):
--   admin    / admin123     (Administrador)
--   operador / operador123  (Operador)
-- =====================================================================

SET NAMES utf8mb4;
USE `autopecas`;

-- Perfis de acesso
INSERT INTO perfis (id_perfil, tipo_perfil) VALUES
  (1, 'Administrador'),
  (2, 'Operador');

-- Usuários (o hash é da biblioteca bcrypt; nunca guardar a senha em texto)
INSERT INTO usuarios (id_usuario, nome_usuario, login_usuario, senha_hash, id_perfil, ativo) VALUES
  (1, 'Administrador do Sistema', 'admin',    '$2b$10$8Gix3gPqqUE0soqGypRyh.qTlo.n9EEVbWSCInmlf3cFs81RmZAo2', 1, 1),
  (2, 'Operador de Balcão',       'operador', '$2b$10$xJmSykw/TVUED7uL1WFO4ONpvU42g8ZppzJBUE6PCg/L9/pTuS5Ly', 2, 1);

-- Categorias de produto
INSERT INTO categorias_produto (id_categoria_produto, nome, ativo) VALUES
  (1, 'Motor',     1),
  (2, 'Freios',    1),
  (3, 'Filtros',   1),
  (4, 'Elétrica',  1),
  (5, 'Suspensão', 1),
  (6, 'Serviços',  1);

-- Fornecedores
-- O fornecedor 1 ("Não se aplica") é o FORNECEDOR PADRÃO: ele é usado nas
-- movimentações que não têm fornecedor (saídas por perda, ajustes e estoque
-- inicial), porque a coluna movimentacao_estoque.id_fornecedor é obrigatória.
INSERT INTO fornecedores (id_fornecedor, nome, telefone, ativo) VALUES
  (1, 'Não se aplica',        NULL,             1),
  (2, 'Autopeças Brasil',     '(62) 3200-1000', 1),
  (3, 'Distribuidora Motor',  '(62) 3200-2000', 1),
  (4, 'Central de Peças',     '(62) 3200-3000', 1);

-- Categorias de despesa
INSERT INTO categorias_despesa (id_categoria_despesa, nome) VALUES
  (1, 'Aluguel'),
  (2, 'Energia'),
  (3, 'Fornecedores'),
  (4, 'Salários'),
  (5, 'Outros');

-- Produtos físicos e serviços
-- O código mostrado na tela é gerado a partir do id: P001, P002... (serviços: S007...)
INSERT INTO produtos (id_produto, descricao, preco, tipo, estoque_atual, estoque_minimo, ativo, id_categoria_produto) VALUES
  (1, 'Filtro de óleo',          35.90, 'FISICO', 25, 10, 1, 3),
  (2, 'Pastilha de freio',       89.90, 'FISICO',  3, 10, 1, 2),
  (3, 'Correia dentada',        129.90, 'FISICO', 12,  5, 1, 1),
  (4, 'Vela de ignição',         24.90, 'FISICO', 40, 15, 1, 4),
  (5, 'Amortecedor dianteiro',  289.90, 'FISICO',  0,  4, 1, 5),
  (6, 'Filtro de ar',            42.50, 'FISICO',  8,  8, 1, 3),
  (7, 'Troca de óleo',           60.00, 'SERVICO', NULL, NULL, 1, 6),
  (8, 'Alinhamento e balanceamento', 120.00, 'SERVICO', NULL, NULL, 1, 6);

-- Movimentações que explicam o estoque inicial (fornecedor padrão = 1)
INSERT INTO movimentacao_estoque (id_usuario, id_produto, id_fornecedor, tipo, motivo, quantidade, data_hora) VALUES
  (1, 1, 2, 'ENTRADA', 'COMPRA', 25, NOW() - INTERVAL 10 DAY),
  (1, 2, 2, 'ENTRADA', 'COMPRA',  3, NOW() - INTERVAL 10 DAY),
  (1, 3, 3, 'ENTRADA', 'COMPRA', 12, NOW() - INTERVAL 9 DAY),
  (1, 4, 4, 'ENTRADA', 'COMPRA', 40, NOW() - INTERVAL 9 DAY),
  (1, 6, 2, 'ENTRADA', 'COMPRA',  8, NOW() - INTERVAL 8 DAY);

-- Alertas de reposição dos produtos que já começam no limite
INSERT INTO alertas (id_produto, tipo, dados_entrada, regra, resultado, status, data_geracao) VALUES
  (2, 'REPOSICAO', 'estoque_atual = 3, estoque_minimo = 10', 'estoque_atual <= estoque_minimo', 'Repor Pastilha de freio', 'ATIVO', NOW()),
  (5, 'REPOSICAO', 'estoque_atual = 0, estoque_minimo = 4',  'estoque_atual <= estoque_minimo', 'Repor Amortecedor dianteiro', 'ATIVO', NOW()),
  (6, 'REPOSICAO', 'estoque_atual = 8, estoque_minimo = 8',  'estoque_atual <= estoque_minimo', 'Repor Filtro de ar', 'ATIVO', NOW());
