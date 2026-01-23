# Diagnóstico: Dropdown de Fornecedores Vazio

## Problema

O dropdown de fornecedores no cadastro de produtos está vazio, mesmo que haja empresas cadastradas.

## Causa Raiz

O endpoint `/api/companies/suppliers` retorna apenas empresas com `supplier_flag = true`. Se não houver nenhuma empresa com esse flag ativado, o dropdown ficará vazio.

## Solução

### Opção 1: Ativar o Flag de Fornecedor em Empresas Existentes

**No banco de dados:**
```sql
-- Ativar supplier_flag para uma empresa específica
UPDATE companies 
SET supplier_flag = true 
WHERE id = 'UUID_DA_EMPRESA';

-- Ativar supplier_flag para todas as empresas
UPDATE companies 
SET supplier_flag = true;

-- Verificar quais empresas têm supplier_flag = true
SELECT id, trade_name, corporate_name, supplier_flag 
FROM companies 
WHERE supplier_flag = true;
```

### Opção 2: Criar uma Nova Empresa com Flag de Fornecedor

**No banco de dados:**
```sql
INSERT INTO companies (
    id, 
    cnpj, 
    trade_name, 
    corporate_name, 
    supplier_flag, 
    customer_flag, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    '12.345.678/0001-90',
    'Fornecedor Teste',
    'Fornecedor Teste LTDA',
    true,
    false,
    NOW(),
    NOW()
);
```

### Opção 3: Verificar o Endpoint Diretamente

**Via Postman ou curl:**
```bash
curl -X GET http://localhost:8080/api/companies/suppliers \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
[
  {
    "id": "uuid-da-empresa",
    "name": "Nome do Fornecedor"
  }
]
```

## Verificação no Frontend

1. **Abrir DevTools (F12)**
2. **Ir para Network tab**
3. **Recarregar a página de produtos**
4. **Procurar por requisição `/api/companies/suppliers`**
5. **Verificar:**
   - Status: 200 (sucesso)
   - Response: Array vazio `[]` ou com dados

## Fluxo de Carregamento

```
Frontend: GET /api/companies/suppliers
  ↓
Proxy Vite: /api → http://localhost:8080
  ↓
Backend: GET http://localhost:8080/api/companies/suppliers
  ↓
CompanyController.suppliers()
  ↓
CompanyRepository.findBySupplierFlagTrueOrderByTradeNameAsc()
  ↓
Retorna lista de empresas com supplier_flag = true
  ↓
Frontend: Popula dropdown com fornecedores
```

## Código Relevante

**Backend (CompanyController.java):**
```java
@GetMapping("/suppliers")
public List<CompanyMinDTO> suppliers() {
    return repository.findBySupplierFlagTrueOrderByTradeNameAsc()
            .stream()
            .map(c -> new CompanyMinDTO(
                    c.getId(),
                    (c.getTradeName() != null && !c.getTradeName().isBlank())
                            ? c.getTradeName()
                            : c.getCorporateName()
            ))
            .toList();
}
```

**Frontend (Product.tsx):**
```typescript
const loadSuppliers = async () => {
    try {
        console.log("🔍 Loading suppliers from /companies/suppliers endpoint...");
        const res = await api.get("/companies/suppliers");
        console.log("📦 Suppliers API response:", res.data);
        const suppliersList = takeList<any>(res.data).map(mapSupplier);
        console.log("🏢 Suppliers loaded:", suppliersList);
        setSuppliers(suppliersList);
    } catch (error) {
        console.error("❌ Error loading suppliers from /companies/suppliers:", error);
        setSuppliers([]);
    }
};
```

## Próximos Passos

1. **Verificar se há empresas com `supplier_flag = true`:**
   ```sql
   SELECT COUNT(*) FROM companies WHERE supplier_flag = true;
   ```

2. **Se não houver, ativar o flag:**
   ```sql
   UPDATE companies SET supplier_flag = true LIMIT 1;
   ```

3. **Recarregar o frontend e verificar se o dropdown agora mostra fornecedores**

4. **Se ainda não funcionar, verificar os logs do backend para erros**

## Documentação Relacionada

- `Backends/Cloud/src/main/java/com/sigeve/cloud/controller/CompanyController.java`
- `Backends/Cloud/src/main/java/com/sigeve/cloud/repository/CompanyRepository.java`
- `Backends/Cloud/src/main/java/com/sigeve/cloud/model/Company.java`
- `Frontends/Manager/src/pages/products/Product.tsx`
