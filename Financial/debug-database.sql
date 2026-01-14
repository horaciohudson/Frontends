-- Script para verificar dados nas tabelas

-- 1. Verificar dados na tabela de categorias financeiras
SELECT 
    category_id,
    category_code,
    category_name,
    tenant_id,
    company_id,
    is_active
FROM tab_financial_categories
ORDER BY category_code;

-- 2. Verificar dados na tabela de centros de custo
SELECT 
    cost_center_id,
    code,
    name,
    tenant_id,
    company_id,
    is_active
FROM tab_cost_centers
ORDER BY code;

-- 3. Verificar qual é o tenant_id e company_id corretos
SELECT 
    tenant_id,
    tenant_code,
    tenant_name
FROM tab_tenants;

SELECT 
    company_id,
    tenant_id,
    corporate_name,
    trade_name
FROM tab_companies;

-- 4. Verificar se há dados com tenant/company específico
SELECT COUNT(*) as total_categories
FROM tab_financial_categories 
WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
  AND company_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec';

SELECT COUNT(*) as total_cost_centers
FROM tab_cost_centers 
WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
  AND company_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec';

-- 5. Verificar dados sem filtro de tenant/company
SELECT COUNT(*) as total_categories_all FROM tab_financial_categories;
SELECT COUNT(*) as total_cost_centers_all FROM tab_cost_centers;