-- Script para corrigir a constraint de foreign key do supplier_id
-- Remove a constraint antiga que aponta para tab_supplier e cria uma nova para tab_companies

-- 1. Remover a constraint antiga
ALTER TABLE tab_products DROP CONSTRAINT IF EXISTS fkglrscp53hs0y9iktthl9aslpa;

-- 2. Criar nova constraint apontando para tab_companies
ALTER TABLE tab_products 
ADD CONSTRAINT fk_products_supplier_company 
FOREIGN KEY (supplier_id) REFERENCES tab_companies(company_id);

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_product_supplier ON tab_products (supplier_id);

-- Verificar se a constraint foi criada corretamente
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='tab_products' 
  AND kcu.column_name='supplier_id';