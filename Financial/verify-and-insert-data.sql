-- Script para verificar e inserir dados de teste

-- 1. VERIFICAR DADOS EXISTENTES
SELECT 'VERIFICANDO DADOS EXISTENTES' as status;

-- Verificar tenant e company
SELECT 
    'TENANTS' as tabela,
    COUNT(*) as total,
    STRING_AGG(tenant_id::text, ', ') as ids
FROM tab_tenants;

SELECT 
    'COMPANIES' as tabela,
    COUNT(*) as total,
    STRING_AGG(company_id::text, ', ') as ids
FROM tab_companies;

-- Verificar categorias existentes
SELECT 
    'CATEGORIAS EXISTENTES' as tabela,
    COUNT(*) as total,
    tenant_id,
    company_id
FROM tab_financial_categories 
GROUP BY tenant_id, company_id;

-- Verificar centros de custo existentes
SELECT 
    'CENTROS DE CUSTO EXISTENTES' as tabela,
    COUNT(*) as total,
    tenant_id,
    company_id
FROM tab_cost_centers 
GROUP BY tenant_id, company_id;

-- Verificar fornecedores existentes
SELECT 
    'FORNECEDORES EXISTENTES' as tabela,
    COUNT(*) as total_companies,
    COUNT(*) FILTER (WHERE supplier_flag = true) as total_suppliers,
    tenant_id,
    company_id
FROM tab_companies 
GROUP BY tenant_id, company_id;

-- 2. INSERIR DADOS DE TESTE SE NÃO EXISTIREM

-- Inserir categorias se não existirem
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
) 
SELECT 
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'DESP001',
    'Despesas Administrativas',
    'EXPENSE',
    'Despesas gerais administrativas',
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM tab_financial_categories 
    WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
    AND company_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec'
    AND category_code = 'DESP001'
);

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
) 
SELECT 
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'DESP002',
    'Despesas Operacionais',
    'EXPENSE',
    'Despesas relacionadas à operação',
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM tab_financial_categories 
    WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
    AND company_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec'
    AND category_code = 'DESP002'
);

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
) 
SELECT 
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'DESP003',
    'Impostos e Taxas',
    'TAX',
    'Impostos e taxas governamentais',
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM tab_financial_categories 
    WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
    AND company_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec'
    AND category_code = 'DESP003'
);

-- Inserir centros de custo se não existirem
INSERT INTO tab_cost_centers (
    tenant_id,
    company_id,
    code,
    name,
    is_active,
    created_at,
    updated_at
) 
SELECT 
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'CC001',
    'Administração',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM tab_cost_centers 
    WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
    AND company_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec'
    AND code = 'CC001'
);

INSERT INTO tab_cost_centers (
    tenant_id,
    company_id,
    code,
    name,
    is_active,
    created_at,
    updated_at
) 
SELECT 
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'CC002',
    'Vendas',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM tab_cost_centers 
    WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
    AND company_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec'
    AND code = 'CC002'
);

INSERT INTO tab_cost_centers (
    tenant_id,
    company_id,
    code,
    name,
    is_active,
    created_at,
    updated_at
) 
SELECT 
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
    'CC003',
    'Produção',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM tab_cost_centers 
    WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
    AND company_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec'
    AND code = 'CC003'
);

-- 3. VERIFICAR DADOS APÓS INSERÇÃO
SELECT 'DADOS APÓS INSERÇÃO' as status;

SELECT 
    'CATEGORIAS FINAIS' as tabela,
    category_id,
    category_code,
    category_name,
    tenant_id,
    company_id,
    is_active
FROM tab_financial_categories 
WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
  AND company_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec'
ORDER BY category_code;

SELECT 
    'CENTROS DE CUSTO FINAIS' as tabela,
    cost_center_id,
    code,
    name,
    tenant_id,
    company_id,
    is_active
FROM tab_cost_centers 
WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
  AND company_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec'
ORDER BY code;

SELECT 
    'FORNECEDORES FINAIS' as tabela,
    company_id,
    corporate_name,
    trade_name,
    cnpj,
    supplier_flag,
    is_active
FROM tab_companies 
WHERE tenant_id = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' 
  AND supplier_flag = true
  AND is_active = true
ORDER BY corporate_name;