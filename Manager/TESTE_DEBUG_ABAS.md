# Teste de Debug - Abas de Cliente

## Problema
Endpoints funcionam no Postman, mas dados não aparecem nas abas do frontend.

## Logging Detalhado Implementado

### 1. Logging Completo de Requisições
Agora cada aba mostra:
- URL completa da requisição
- Status da resposta
- Dados brutos da resposta
- Tipo de dados recebidos
- Estrutura dos dados processados

### 2. Botões de Debug Temporários
Adicionados botões "🔄 Force Reload" nas abas Jurídico e Financeiro para testar manualmente.

### 3. Logging de Renderização
Adicionado logging no momento da renderização da tabela para verificar se os dados chegam até lá.

## Como Testar Agora

### Passo 1: Abrir Console do Navegador
1. Pressionar F12
2. Ir para aba Console
3. Limpar console (Ctrl+L)

### Passo 2: Selecionar Cliente e Navegar
1. Selecionar um cliente existente
2. Ir para aba Jurídico
3. Verificar logs no console

### Passo 3: Usar Botão de Debug
1. Clicar no botão "🔄 Force Reload Legal Data"
2. Verificar logs detalhados no console

### Passo 4: Verificar Logs Esperados

#### Se Dados Existem:
```
🔄 FormCustomerLegal useEffect triggered
📋 Customer object: { customerId: "123", name: "João" }
🆔 Customer ID: 123
✅ Valid customer ID found, loading data...
🏢 Loading legal data for customer: 123
🔗 Full URL: /api/customer-legals/customer/123
📋 RAW Legal data response: { status: 200, data: [...] }
📋 Response status: 200
📋 Response data: [{ id: "456", cnpj: "12345", ... }]
📋 Response data type: object
📋 Is array? true
🎯 Final legalData to process: [{ id: "456", ... }]
🎯 Final legalData type: object
🎯 Final legalData is array? true
🎯 Final legalData length: 1
✅ Legal data found: 1 records
✅ First record: { id: "456", cnpj: "12345", ... }
📝 Setting legal form data: { id: "456", ... }
📊 Setting legal table data: [{ id: "456", ... }]
🔍 Checking legal state after update...
🔍 Current legalData state length: 1
🎨 Rendering legal table. legalData: [{ id: "456", ... }]
🎨 legalData.length: 1
🎨 Rendering legal row 0: { id: "456", ... }
```

#### Se Dados Não Existem:
```
🔄 FormCustomerLegal useEffect triggered
📋 Customer object: { customerId: "123", name: "João" }
🆔 Customer ID: 123
✅ Valid customer ID found, loading data...
🏢 Loading legal data for customer: 123
🔗 Full URL: /api/customer-legals/customer/123
📋 RAW Legal data response: { status: 200, data: [] }
📋 Response status: 200
📋 Response data: []
📋 Response data type: object
📋 Is array? true
🎯 Final legalData to process: []
🎯 Final legalData type: object
🎯 Final legalData is array? true
🎯 Final legalData length: 0
❌ No legal data found or invalid format
❌ Resetting form and clearing table
🎨 Rendering legal table. legalData: []
🎨 legalData.length: 0
```

#### Se Há Erro:
```
🔄 FormCustomerLegal useEffect triggered
📋 Customer object: { customerId: "123", name: "João" }
🆔 Customer ID: 123
✅ Valid customer ID found, loading data...
🏢 Loading legal data for customer: 123
🔗 Full URL: /api/customer-legals/customer/123
❌ Error loading legal data: [Error object]
📋 Error status: 404
📋 Error data: { message: "Not found" }
📋 Error message: Request failed with status code 404
```

## Possíveis Problemas a Identificar

### 1. Customer ID Inválido
Se aparecer:
```
❌ No valid customer ID found
```
**Solução**: Verificar se cliente está sendo selecionado corretamente.

### 2. Endpoint Não Encontrado (404)
Se aparecer:
```
📋 Error status: 404
```
**Solução**: Verificar se endpoint existe no backend.

### 3. Dados em Formato Diferente
Se aparecer:
```
📦 Object keys: ["content", "totalElements", "totalPages"]
```
**Solução**: Backend está retornando dados paginados.

### 4. Dados Chegam Mas Não Renderizam
Se aparecer logs de carregamento mas não de renderização:
```
✅ Legal data found: 1 records
📊 Setting legal table data: [...]
// MAS NÃO APARECE:
🎨 Rendering legal table. legalData: [...]
```
**Solução**: Problema de estado React ou re-renderização.

### 5. Dados Vazios do Backend
Se aparecer:
```
📋 Response data: []
🎯 Final legalData length: 0
```
**Solução**: Não há dados salvos para este cliente no banco.

## Próximos Passos Baseados nos Logs

1. **Se logs não aparecem**: Problema com seleção de cliente
2. **Se erro 404**: Problema com endpoint backend
3. **Se dados vazios**: Problema com dados no banco
4. **Se dados chegam mas não renderizam**: Problema de estado React
5. **Se dados em formato diferente**: Problema de estrutura de resposta

## Comandos de Teste Manual no Console

```javascript
// Testar endpoint diretamente
fetch('/api/customer-legals/customer/SEU_CUSTOMER_ID_AQUI')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Verificar estado atual do componente
console.log("Current customer:", selectedCustomer);
console.log("Current legal data:", legalData);
```

## Remover Debug Após Teste

Após identificar o problema, remover:
1. Botões de debug temporários
2. Logs excessivos de renderização
3. Manter apenas logs essenciais