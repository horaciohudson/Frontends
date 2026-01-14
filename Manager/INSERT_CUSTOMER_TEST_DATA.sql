-- Script para inserir dados de teste para o cliente 3406f81f-5828-43ae-a62b-928a044e915b
-- Execute este script no banco de dados para testar as abas

-- 1. DADOS JURÍDICOS
INSERT INTO tab_customer_legals (
    customer_legal_id,
    customer_id,
    cnpj,
    registration,
    icms_ipi,
    revenue,
    activity_id,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '3406f81f-5828-43ae-a62b-928a044e915b',
    '12.345.678/0001-90',
    '123456789',
    1500.00,
    50000.00,
    1,
    NOW(),
    NOW()
);

-- 2. DADOS DE ENDEREÇO
INSERT INTO tab_customer_addresses (
    customer_address_id,
    customer_id,
    address_type,
    street,
    district,
    city,
    state,
    zip_code,
    created_at,
    updated_at
) VALUES 
(
    nextval('tab_customer_addresses_customer_address_id_seq'),
    '3406f81f-5828-43ae-a62b-928a044e915b',
    'COMMERCIAL',
    'Rua das Flores, 123',
    'Centro',
    'São Paulo',
    'SP',
    '01234-567',
    NOW(),
    NOW()
),
(
    nextval('tab_customer_addresses_customer_address_id_seq'),
    '3406f81f-5828-43ae-a62b-928a044e915b',
    'RESIDENTIAL',
    'Av. Paulista, 456',
    'Bela Vista',
    'São Paulo',
    'SP',
    '01310-100',
    NOW(),
    NOW()
);

-- 3. DADOS PROFISSIONAIS
INSERT INTO tab_customer_professionals (
    customer_professional_id,
    customer_id,
    company,
    position,
    company_phone,
    admission_date,
    company_postal_code,
    company_city,
    company_state,
    previous_company,
    service_time,
    observations,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '3406f81f-5828-43ae-a62b-928a044e915b',
    'Empresa ABC Ltda',
    'Desenvolvedor Senior',
    '(11) 3333-4444',
    '2020-01-15',
    '04567-890',
    'São Paulo',
    'SP',
    'Empresa XYZ S.A.',
    '5 anos',
    'Experiência em desenvolvimento web',
    NOW(),
    NOW()
);

-- 4. DADOS FINANCEIROS
INSERT INTO tab_customer_financials (
    customer_financial_id,
    customer_id,
    credit_limit,
    debt_balance,
    payment_method_id,
    created_at,
    updated_at
) VALUES (
    nextval('tab_customer_financials_customer_financial_id_seq'),
    '3406f81f-5828-43ae-a62b-928a044e915b',
    10000.00,
    2500.50,
    1,
    NOW(),
    NOW()
);

-- Verificar se os dados foram inseridos
SELECT 'LEGAL' as tipo, count(*) as quantidade FROM tab_customer_legals WHERE customer_id = '3406f81f-5828-43ae-a62b-928a044e915b'
UNION ALL
SELECT 'ADDRESS' as tipo, count(*) as quantidade FROM tab_customer_addresses WHERE customer_id = '3406f81f-5828-43ae-a62b-928a044e915b'
UNION ALL
SELECT 'PROFESSIONAL' as tipo, count(*) as quantidade FROM tab_customer_professionals WHERE customer_id = '3406f81f-5828-43ae-a62b-928a044e915b'
UNION ALL
SELECT 'FINANCIAL' as tipo, count(*) as quantidade FROM tab_customer_financials WHERE customer_id = '3406f81f-5828-43ae-a62b-928a044e915b';