-- Script para remover a constraint duplicada
-- Mantém apenas a constraint com nome mais descritivo

-- Remover a constraint com nome gerado automaticamente pelo Hibernate
ALTER TABLE tab_products DROP CONSTRAINT IF EXISTS fkmd43nwuy81lapxkyclbp008h8;

-- Verificar se apenas uma constraint permanece
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