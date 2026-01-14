# Correção dos Problemas nas Abas Profissional e Financeiro do Cadastro de Clientes

## Problemas Identificados

### 1. Aba Profissional - Refresh no Botão "Novos Dados Profissionais"
**Problema**: O botão causava refresh da página ao invés de ativar o modo de edição.
**Causa**: Campo "Empresa" estava faltando no formulário, mas presente no modelo e API.

### 2. Aba Financeiro - Erro de Constraint de Unicidade
**Problema**: Erro ao tentar criar novos dados financeiros:
```
could not execute statement [ERRO: duplicar valor da chave viola a restrição de unicidade "ukbpou79r21p5fk3mbg1a55f6wf" 
Detalhe: Chave (customer_id)=(3406f81f-5828-43ae-a62b-928a044e915b) já existe.]
```
**Causa**: Sistema tentava criar novo registro quando deveria editar o existente (relacionamento 1:1).

## Correções Implementadas

### FormCustomerProfessional.tsx

1. **Adicionado campo "Empresa" no formulário**:
   - Campo estava no modelo mas faltava na interface
   - Adicionado na primeira linha do formulário com foco automático
   - Atualizada tabela para mostrar a empresa

2. **Reorganização do layout**:
   - Primeira linha: Empresa, Telefone da Empresa, Data de Admissão
   - Mantida estrutura responsiva com classes CSS apropriadas

### FormCustomerFinancial.tsx

1. **Correção da lógica de salvamento**:
   - Implementada verificação se já existe dados financeiros
   - Se existe dados, sempre edita ao invés de criar novo
   - Adicionado logging detalhado para debug

2. **Correção do botão "Novos Dados Financeiros"**:
   - Se já existe dados, muda para modo de edição
   - Se não existe, cria novo registro
   - Texto do botão muda dinamicamente

3. **Melhorias na função `handleSave`**:
   - Verifica se é edição ou criação
   - Se existe dados mas não está editando, força edição do existente
   - Logging detalhado com emojis para facilitar debug

4. **Melhorias na função `handleNew`**:
   - Verifica se já existe dados financeiros
   - Se existe, entra em modo de edição do existente
   - Se não existe, cria novo formulário

### Traduções Adicionadas

Adicionadas traduções em `public/locales/pt/reference.json`:

```json
"customerProfessional": {
  "title": "Dados Profissionais",
  "company": "Empresa",
  "companyPhone": "Telefone da Empresa",
  // ... outras traduções
},
"customerFinancial": {
  "title": "Dados Financeiros",
  "creditLimit": "Limite de Crédito",
  "editFinancialData": "Editar Dados Financeiros",
  // ... outras traduções
}
```

## Comportamento Esperado Após as Correções

### Aba Profissional
- ✅ Campo "Empresa" visível e funcional
- ✅ Botão "Novos Dados Profissionais" não causa mais refresh
- ✅ Formulário completo com todos os campos do modelo
- ✅ Tabela mostra empresa como primeira coluna

### Aba Financeiro
- ✅ Não mais erro de constraint de unicidade
- ✅ Se cliente já tem dados financeiros, botão vira "Editar Dados Financeiros"
- ✅ Sistema sempre edita registro existente ao invés de criar duplicado
- ✅ Logging detalhado para facilitar debug futuro

## Arquivos Modificados

1. `SigeveFrontEnd/src/pages/customers/FormCustomerProfessional.tsx`
2. `SigeveFrontEnd/src/pages/customers/FormCustomerFinancial.tsx`
3. `SigeveFrontEnd/public/locales/pt/reference.json`

## Teste Recomendado

1. Abrir cadastro de cliente existente
2. Ir na aba Profissional e clicar "Novos Dados Profissionais"
3. Verificar que não há refresh e o campo Empresa está presente
4. Ir na aba Financeiro e clicar "Novos Dados Financeiros"
5. Verificar que não há erro de constraint e dados são salvos corretamente