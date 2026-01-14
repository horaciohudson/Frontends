# Debug - Problemas com Carregamento de Dados nas Abas de Cliente

## Problema Reportado
As abas Jurídico, Endereço, Profissional e Financeiro não estão trazendo dados nas grades/tabelas.

## Análise Realizada

### 1. Estrutura dos Componentes ✅
- Todos os componentes estão estruturados corretamente
- Funções de carregamento implementadas
- Estados gerenciados adequadamente
- Tabelas configuradas para mostrar dados

### 2. Logging Adicionado 🔍
Adicionado logging detalhado em todos os componentes:
- `🏠 Loading address data for customer: {customerId}`
- `🏢 Loading legal data for customer: {customerId}`
- `👔 Loading professional data for customer: {customerId}`
- `💰 Loading financial data for customer: {customerId}`

### 3. Endpoints Testados
Os componentes fazem chamadas para:
- `/api/customer-addresses/customer/{customerId}`
- `/api/customer-legals/customer/{customerId}`
- `/api/customer-professionals/customer/{customerId}`
- `/api/customer-financials/customer/{customerId}`

### 4. Possíveis Causas

#### A. Customer ID Inválido
- Verificar se o `customerId` está sendo passado corretamente
- Verificar se o formato UUID está correto

#### B. Dados Não Existem no Banco
- Pode ser que não existam dados salvos para o cliente selecionado
- Verificar se os dados foram realmente salvos nas tabelas corretas

#### C. Problemas de Endpoint
- Endpoints podem não estar retornando dados
- Problemas de CORS ou autenticação
- Estrutura de resposta diferente do esperado

#### D. Problemas de Estado
- Customer pode não estar sendo passado corretamente entre componentes
- Estado pode estar sendo resetado

## Próximos Passos para Debug

### 1. Verificar Console do Navegador
Abrir as abas e verificar se aparecem os logs:
```
🏠 Loading address data for customer: [UUID]
📋 Address data response: [dados ou erro]
```

### 2. Verificar Network Tab
- Ver se as requisições estão sendo feitas
- Verificar se retornam 200 OK ou erro
- Verificar estrutura da resposta

### 3. Verificar Banco de Dados
Executar queries para verificar se existem dados:
```sql
SELECT * FROM tab_customer_addresses WHERE customer_id = '[UUID]';
SELECT * FROM tab_customer_legals WHERE customer_id = '[UUID]';
SELECT * FROM tab_customer_professionals WHERE customer_id = '[UUID]';
SELECT * FROM tab_customer_financials WHERE customer_id = '[UUID]';
```

### 4. Testar com Cliente Específico
- Selecionar um cliente que sabemos que tem dados
- Verificar se o problema persiste

## Melhorias Implementadas

### 1. Logging Detalhado
- Emojis para facilitar identificação
- Logs de entrada e saída de dados
- Logs de erro específicos

### 2. Callback de Refresh
- Adicionado `onSave` callback em todas as abas
- Permite refresh automático quando dados são salvos

### 3. Traduções Completas
- Adicionadas todas as traduções faltantes
- Mensagens de erro específicas

### 4. Exibição de Customer ID
- Mostra o UUID do cliente selecionado para debug
- Facilita verificação se o ID está correto

## Como Testar

1. Abrir o cadastro de clientes
2. Selecionar um cliente existente
3. Ir para cada aba (Jurídico, Endereço, Profissional, Financeiro)
4. Verificar console do navegador para logs
5. Verificar se dados aparecem nas tabelas
6. Se não aparecer, verificar Network tab para ver requisições

## Comandos de Debug no Console

```javascript
// Verificar cliente selecionado
console.log("Selected customer:", selectedCustomer);

// Testar endpoint manualmente
fetch('/api/customer-addresses/customer/[UUID]')
  .then(r => r.json())
  .then(console.log);
```