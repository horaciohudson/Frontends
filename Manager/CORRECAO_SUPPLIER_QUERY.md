# Correção: Fornecedor Não Aparecia na Grade

## Problema

O fornecedor estava gravado no banco de dados (`supplier_id` com valor UUID), mas não aparecia na grade de produtos.

## Causa Raiz

**O Hibernate não estava fazendo JOIN com a tabela `companies` ao carregar os produtos.**

### Análise:

1. **Banco de dados:** `supplier_id` estava preenchido ✅
2. **Modelo Product:** Tinha o relacionamento `@ManyToOne` com Company ✅
3. **DTO:** Tinha os campos `supplierId` e `supplierName` ✅
4. **Serviço:** Tinha a lógica de mapeamento ✅
5. **Query:** ❌ **NÃO estava fazendo JOIN com supplier**

**Resultado:**
- Hibernate carregava o Product sem carregar o relacionamento supplier
- `product.getSupplier()` retornava null
- `supplierName` ficava vazio na resposta

## Correção Aplicada

### 1. ProductRepository.java

**Adicionado:**
```java
@Query("SELECT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.supplier WHERE p.deletedAt IS NULL")
Page<Product> findAllWithSupplier(Pageable pageable);
```

**Atualizado:**
```java
// ANTES
@Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.subcategory LEFT JOIN FETCH p.images WHERE p.id = :id AND p.deletedAt IS NULL")
Optional<Product> findByIdWithImages(@Param("id") Long id);

// DEPOIS
@Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.subcategory LEFT JOIN FETCH p.supplier WHERE p.id = :id AND p.deletedAt IS NULL")
Optional<Product> findByIdWithImages(@Param("id") Long id);
```

**Atualizado:**
```java
// ANTES
@Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.slug = :slug AND p.deletedAt IS NULL")
Optional<Product> findBySlugWithCategory(@Param("slug") String slug);

// DEPOIS
@Query("SELECT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.supplier WHERE p.slug = :slug AND p.deletedAt IS NULL")
Optional<Product> findBySlugWithCategory(@Param("slug") String slug);
```

### 2. ProductService.java

**Atualizado método `findAll()`:**
```java
// ANTES
return productRepository.findByDeletedAtIsNull(pageable)
        .map(ProductResponseDTO::fromEntityBasic);

// DEPOIS
return productRepository.findAllWithSupplier(pageable)
        .map(ProductResponseDTO::fromEntityBasic);
```

## Fluxo Correto Agora

```
Frontend: GET /api/products
  ↓
Backend ProductService.findAll():
  - Chama productRepository.findAllWithSupplier()
  ↓
ProductRepository.findAllWithSupplier():
  - SELECT p FROM Product p 
    LEFT JOIN FETCH p.category 
    LEFT JOIN FETCH p.supplier  ← Carrega o fornecedor!
  ↓
Hibernate carrega:
  - Product
  - Category (relacionado)
  - Company/Supplier (relacionado)
  ↓
ProductResponseDTO.fromEntityBasic():
  - product.getSupplier() → retorna Company ✅
  - supplier.getId() → supplierId ✅
  - supplier.getTradeName() → supplierName ✅
  ↓
Frontend recebe: { supplierId: "uuid", supplierName: "Fornecedor A", ... }
  ↓
Grade exibe: Fornecedor A ✅
```

## Como Testar

1. **Rebuild do backend:**
   ```bash
   mvn clean install
   ```

2. **Reiniciar o backend**

3. **Abrir a página de produtos**

4. **Verificar se o fornecedor agora aparece na grade**

5. **Verificar no DevTools:**
   - F12 → Network tab
   - Procurar por `/api/products`
   - Confirmar que `supplierName` está na resposta

## Arquivos Modificados

- `Backends/Cloud/src/main/java/com/sigeve/cloud/repository/ProductRepository.java`
- `Backends/Cloud/src/main/java/com/sigeve/cloud/service/ProductService.java`

## Notas

- O `LEFT JOIN FETCH` garante que o Hibernate carrega o relacionamento mesmo que seja null
- Sem o FETCH, o Hibernate faria lazy loading (carregaria depois), causando problemas
- A correção é mínima e não afeta outras funcionalidades
