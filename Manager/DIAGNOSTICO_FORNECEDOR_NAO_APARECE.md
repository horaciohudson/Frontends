# Diagnóstico: Fornecedor Não Aparece na Grade de Produtos

## Problema

O fornecedor aparece no formulário quando você edita um produto, mas não aparece na grade (tabela) de produtos.

## Causa Raiz

**O backend não está retornando o campo `supplierName` no endpoint de listagem de produtos.**

### Análise:

1. **Frontend envia:** `supplierId` e `supplierName` ao salvar
2. **Backend recebe:** Mas o `ProductRequestDTO` não tem esses campos
3. **Backend salva:** Provavelmente em um campo JSON ou não salva
4. **Backend retorna:** `ProductResponseDTO` sem `supplierId` e `supplierName`
5. **Frontend exibe:** Nada na grade (campo vazio)

### Arquivos Afetados:

**Backend:**
- `ProductRequestDTO.java` - Não tem campos `supplierId` e `supplierName`
- `ProductResponseDTO.java` - Não tem campos `supplierId` e `supplierName`
- `Product.java` - Não tem relacionamento com fornecedor

**Frontend:**
- `Product.tsx` - Tenta exibir `p.supplierName` na tabela
- `mapProductFromApi()` - Mapeia `p.supplierName` (que vem vazio)

## Soluções Possíveis

### Opção 1: Adicionar Campos ao Backend (RECOMENDADO)

**1. Adicionar campo ao modelo Product:**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "supplier_id")
private Company supplier;
```

**2. Adicionar campos ao ProductRequestDTO:**
```java
private UUID supplierId;
private String supplierName;
```

**3. Adicionar campos ao ProductResponseDTO:**
```java
private UUID supplierId;
private String supplierName;
```

**4. Atualizar o método `fromEntity()` em ProductResponseDTO:**
```java
if (product.getSupplier() != null) {
    builder.supplierId(product.getSupplier().getId())
           .supplierName(product.getSupplier().getTradeName() != null 
               ? product.getSupplier().getTradeName() 
               : product.getSupplier().getCorporateName());
}
```

**5. Criar migration para adicionar coluna:**
```sql
ALTER TABLE tab_products ADD COLUMN supplier_id UUID;
ALTER TABLE tab_products ADD CONSTRAINT fk_products_supplier 
    FOREIGN KEY (supplier_id) REFERENCES companies(id);
```

### Opção 2: Armazenar em Campo JSON

Se não quiser adicionar um relacionamento, pode armazenar em um campo JSON:

**Frontend envia:**
```json
{
  "name": "Produto A",
  "supplierId": "uuid-123",
  "supplierName": "Fornecedor A"
}
```

**Backend armazena em `specifications`:**
```json
{
  "supplier": {
    "id": "uuid-123",
    "name": "Fornecedor A"
  }
}
```

**Backend retorna:**
```java
if (product.getSpecifications() != null && product.getSpecifications().containsKey("supplier")) {
    Map<String, Object> supplier = (Map<String, Object>) product.getSpecifications().get("supplier");
    builder.supplierId((String) supplier.get("id"))
           .supplierName((String) supplier.get("name"));
}
```

## Próximos Passos

1. **Verificar qual é a intenção:** O fornecedor deve ser um relacionamento ou apenas um campo?
2. **Implementar a solução escolhida** no backend
3. **Testar** se o fornecedor agora aparece na grade

## Documentação Relacionada

- `Backends/Cloud/src/main/java/com/sigeve/cloud/model/Product.java`
- `Backends/Cloud/src/main/java/com/sigeve/cloud/dto/ProductRequestDTO.java`
- `Backends/Cloud/src/main/java/com/sigeve/cloud/dto/ProductResponseDTO.java`
- `Frontends/Manager/src/pages/products/Product.tsx`
- `CORRECAO_DROPDOWN_FORNECEDORES.md`
