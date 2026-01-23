-- ============================================
-- VERIFICAÇÃO DE DADOS DO FORNECEDOR
-- ============================================

-- 1. Verificar se há produtos com supplier_id preenchido
SELECT 
    p.product_id,
    p.name,
    p.supplier_id,
    c.trade_name,
    c.corporate_name,
    c.supplier_flag
FROM tab_products p
LEFT JOIN tab_companies c ON p.supplier_id = c.company_id
WHERE p.deleted_at IS NULL
LIMIT 20;

-- 2. Verificar quantas empresas têm supplier_flag = true
SELECT COUNT(*) as total_suppliers
FROM tab_companies
WHERE supplier_flag = true;

-- 3. Listar todas as empresas com supplier_flag = true
SELECT 
    company_id,
    trade_name,
    corporate_name,
    supplier_flag
FROM tab_companies
WHERE supplier_flag = true
ORDER BY trade_name ASC;

-- 4. Verificar o produto específico com supplier_id = 34425731-3b7f-4489-933a-ec9d3ed9d4c1
SELECT 
    p.product_id,
    p.name,
    p.supplier_id,
    c.company_id,
    c.trade_name,
    c.corporate_name,
    c.supplier_flag
FROM tab_products p
LEFT JOIN tab_companies c ON p.supplier_id = c.company_id
WHERE p.supplier_id = '34425731-3b7f-4489-933a-ec9d3ed9d4c1'
   OR c.company_id = '34425731-3b7f-4489-933a-ec9d3ed9d4c1';

-- 5. Verificar se há produtos sem supplier_id
SELECT COUNT(*) as produtos_sem_fornecedor
FROM tab_products
WHERE supplier_id IS NULL
  AND deleted_at IS NULL;

-- 6. Verificar se há produtos com supplier_id mas a empresa não existe
SELECT 
    p.product_id,
    p.name,
    p.supplier_id
FROM tab_products p
LEFT JOIN tab_companies c ON p.supplier_id = c.company_id
WHERE p.supplier_id IS NOT NULL
  AND c.company_id IS NULL
  AND p.deleted_at IS NULL;

-- 7. Contar total de produtos
SELECT COUNT(*) as total_produtos
FROM tab_products
WHERE deleted_at IS NULL;

-- 8. Contar total de empresas
SELECT COUNT(*) as total_empresas
FROM tab_companies;
