-- Script para inserir dados de teste nas tabelas
-- IMPORTANTE: O company_id correto é eee32700-45e9-45e8-9c44-416d871cc1f6 (visto nos logs do backend)

-- Primeiro, deletar dados antigos se existirem
DELETE FROM tab_financial_categories WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec';
DELETE FROM tab_cost_centers WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec';

-- Inserir categorias financeiras de teste (category_id é bigint, não uuid)
INSERT INTO tab_financial_categories (
    tenant_id,
    company_id,
    category_code,
    category_name,
    category_kind,
    description,
    is_active,
    level,
    created_at,
    updated_at
) VALUES 
(
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'eee32700-45e9-45e8-9c44-416d871cc1f6',
    'DESP001',
    'Despesas Administrativas',
    'EXPENSE',
    'Despesas gerais administrativas',
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'eee32700-45e9-45e8-9c44-416d871cc1f6',
    'DESP002',
    'Despesas Operacionais',
    'EXPENSE',
    'Despesas relacionadas à operação',
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'eee32700-45e9-45e8-9c44-416d871cc1f6',
    'DESP003',
    'Impostos e Taxas',
    'TAX',
    'Impostos e taxas governamentais',
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'eee32700-45e9-45e8-9c44-416d871cc1f6',
    'REC001',
    'Receitas de Vendas',
    'REVENUE',
    'Receitas provenientes de vendas',
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'eee32700-45e9-45e8-9c44-416d871cc1f6',
    'REC002',
    'Receitas Financeiras',
    'REVENUE',
    'Receitas de aplicações financeiras',
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Inserir centros de custo de teste (cost_center_id é bigint, não uuid)
INSERT INTO tab_cost_centers (
    tenant_id,
    company_id,
    code,
    name,
    is_active,
    created_at,
    updated_at
) VALUES 
(
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'eee32700-45e9-45e8-9c44-416d871cc1f6',
    'CC001',
    'Administração',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'eee32700-45e9-45e8-9c44-416d871cc1f6',
    'CC002',
    'Vendas',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'eee32700-45e9-45e8-9c44-416d871cc1f6',
    'CC003',
    'Produção',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'eee32700-45e9-45e8-9c44-416d871cc1f6',
    'CC004',
    'Marketing',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'eee32700-45e9-45e8-9c44-416d871cc1f6',
    'CC005',
    'Financeiro',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);