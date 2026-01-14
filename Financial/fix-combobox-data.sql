-- Script para corrigir os dados dos comboboxes
-- Problema: company_id incorreto nos dados de teste

-- Verificar dados existentes
SELECT 'Categorias existentes:' as info;
SELECT category_id, category_code, category_name, tenant_id, company_id, is_active 
FROM tab_financial_categories 
WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec';

SELECT 'Centros de custo existentes:' as info;
SELECT cost_center_id, code, name, tenant_id, company_id, is_active 
FROM tab_cost_centers 
WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec';

-- Deletar dados com company_id incorreto
DELETE FROM tab_financial_categories 
WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
AND company_id != 'eee32700-45e9-45e8-9c44-416d871cc1f6';

DELETE FROM tab_cost_centers 
WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
AND company_id != 'eee32700-45e9-45e8-9c44-416d871cc1f6';

-- Inserir categorias com company_id correto
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
)
ON CONFLICT DO NOTHING;

-- Inserir centros de custo com company_id correto
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
)
ON CONFLICT DO NOTHING;

-- Verificar dados inseridos
SELECT 'Categorias após inserção:' as info;
SELECT category_id, category_code, category_name, tenant_id, company_id, is_active 
FROM tab_financial_categories 
WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec'
AND company_id = 'eee32700-45e9-45e8-9c44-416d871cc1f6';

SELECT 'Centros de custo após inserção:' as info;
SELECT cost_center_id, code, name, tenant_id, company_id, is_active 
FROM tab_cost_centers 
WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec'
AND company_id = 'eee32700-45e9-45e8-9c44-416d871cc1f6';