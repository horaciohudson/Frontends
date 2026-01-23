# Refatoração: Suporte Completo a Fornecedor em Produtos

## Mudanças Realizadas

### 1. Backend - Modelo (Product.java)

**Adicionado:**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "supplier_id")
private Company supplier;
```

**Resultado:** Produto agora tem relacionamento com Company (fornecedor)

### 2. Backend - DTO de Requisição (ProductRequestDTO.java)

**Adicionado:**
```java
private java.util.UUID supplierId;
private String supplierName;
```

**Resultado:** Frontend pode enviar fornecedor ao criar/atualizar produto

### 3. Backend - DTO de Resposta (ProductResponseDTO.java)

**Adicionado:**
```java
// Fornecedor
private java.util.UUID supplierId;
private String supplierName;
```

**Atualizado método `fromEntity()`:**
```java
// Supplier
if (product.getSupplier() != null) {
    builder.supplierId(product.getSupplier().getId())
           .supplierName(product.getSupplier().getTradeName() != null && !product.getSupplier().getTradeName().isBlank()
                   ? product.getSupplier().getTradeName()
                   : product.getSupplier().getCorporateName());
}
```

**Atualizado método `fromEntityBasic()`:**
```java
.supplierId(product.getSupplier() != null ? product.getSupplier().getId() : null)
.supplierName(product.getSupplier() != null 
        ? (product.getSupplier().getTradeName() != null && !product.getSupplier().getTradeName().isBlank()
                ? product.getSupplier().getTradeName()
                : product.getSupplier().getCorporateName())
        : null)
```

**Resultado:** API retorna fornecedor ao listar/buscar produtos

### 4. Backend - Serviço (ProductService.java)

**Adicionado repositório:**
```java
private final CompanyRepository companyRepository;
```

**Método `create()`:**
```java
// Carregar fornecedor se informado
Company supplier = null;
if (request.getSupplierId() != null) {
    supplier = companyRepository.findById(request.getSupplierId())
            .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado com id: " + request.getSupplierId()));
}

// No builder:
.supplier(supplier)
```

**Método `update()`:**
```java
// Atualizar fornecedor
if (request.getSupplierId() != null) {
    if (product.getSupplier() == null || !request.getSupplierId().equals(product.getSupplier().getId())) {
        Company supplier = companyRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado com id: " + request.getSupplierId()));
        product.setSupplier(supplier);
    }
} else {
    product.setSupplier(null);
}
```

**Resultado:** Backend salva e atualiza fornecedor corretamente

## Fluxo Completo

```
Frontend: Seleciona fornecedor e salva produto
  ↓
Envia: { supplierId: "uuid", supplierName: "Fornecedor A", ... }
  ↓
Backend ProductService.create():
  - Carrega Company pelo supplierId
  - Salva Product com relacionamento supplier
  ↓
Backend ProductResponseDTO.fromEntity():
  - Mapeia supplier.id → supplierId
  - Mapeia supplier.name → supplierName
  ↓
Frontend recebe: { supplierId: "uuid", supplierName: "Fornecedor A", ... }
  ↓
Exibe na grade: Fornecedor A ✅
```

## Próximos Passos

1. **Criar migration no banco de dados:**
   ```sql
   ALTER TABLE tab_products ADD COLUMN supplier_id UUID;
   ALTER TABLE tab_products ADD CONSTRAINT fk_products_supplier 
       FOREIGN KEY (supplier_id) REFERENCES companies(id);
   ```

2. **Reiniciar o backend** para aplicar as mudanças

3. **Testar:**
   - Criar novo produto com fornecedor
   - Editar produto existente e adicionar fornecedor
   - Verificar se fornecedor aparece na grade

## Arquivos Modificados

- `Backends/Cloud/src/main/java/com/sigeve/cloud/model/Product.java`
- `Backends/Cloud/src/main/java/com/sigeve/cloud/dto/ProductRequestDTO.java`
- `Backends/Cloud/src/main/java/com/sigeve/cloud/dto/ProductResponseDTO.java`
- `Backends/Cloud/src/main/java/com/sigeve/cloud/service/ProductService.java`

## Notas

- O fornecedor é opcional (pode ser null)
- Apenas empresas com `supplier_flag = true` aparecem no dropdown
- O nome do fornecedor é exibido na grade de produtos
- Compatível com o frontend existente
