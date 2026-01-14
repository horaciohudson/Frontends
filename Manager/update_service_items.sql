-- Script para atualizar a tabela service_items e adicionar o campo unitType
-- Execute este script após apagar as tabelas e antes de compilar o sistema

-- 1. Adicionar o campo unitType na tabela service_items
ALTER TABLE service_items ADD COLUMN unit_type VARCHAR(20) NOT NULL DEFAULT 'UNIT';

-- 2. Criar índice para melhor performance
CREATE INDEX idx_service_items_unit_type ON service_items(unit_type);

-- 3. Adicionar constraint para validar os valores do enum
ALTER TABLE service_items ADD CONSTRAINT chk_unit_type 
CHECK (unit_type IN ('UNIT', 'KILO', 'LITER', 'METER', 'HOUR', 'KWH'));

-- 4. Comentário explicativo
COMMENT ON COLUMN service_items.unit_type IS 'Tipo de unidade de medida (UNIT, KILO, LITER, METER, HOUR, KWH)';

-- 5. Verificar se a alteração foi aplicada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'service_items' AND column_name = 'unit_type';
