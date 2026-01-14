# Sistema de Traduções Organizado por Sidebar

## Visão Geral

Este projeto foi reorganizado para dividir as traduções de acordo com os sidebars, tornando o sistema mais modular e fácil de manter. Cada sidebar tem seu próprio arquivo de tradução, evitando arquivos muito grandes e facilitando a localização de traduções específicas.

## Estrutura dos Arquivos

### Arquivos de Tradução por Sidebar

#### 1. **Reference** (`public/locales/pt/reference.json` / `public/locales/en/reference.json`)
- **Grupos** - Cadastros de grupos
- **Códigos Fiscais** - Cadastros de códigos fiscais
- **Situações Fiscais** - Cadastros de situações fiscais
- **Formas de Pagamento** - Cadastros de formas de pagamento
- **Históricos** - Cadastros de históricos
- **Notas** - Cadastros de notas
- **Bancos** - Cadastros de bancos
- **Operações Bancárias** - Cadastros de operações bancárias
- **Plano de Contas** - Cadastros de contas contábeis
- **Atividades** - Cadastros de atividades
- **Moedas** - Cadastros de moedas

#### 2. **Commercial** (`public/locales/pt/commercial.json` / `public/locales/en/commercial.json`)
- **Reajustes** - Módulo de reajustes
- **Vendedores** - Cadastros de vendedores
- **Compras** - Módulo de compras
- **Pedidos** - Módulo de pedidos
- **Venda Escritório** - Módulo de vendas
- **Formas Cupom** - Cadastros de formas de cupom
- **Fechamento Diário** - Módulo de fechamento
- **Transferências** - Módulo de transferências

#### 3. **Financial** (`public/locales/pt/financial.json` / `public/locales/en/financial.json`)
- **Movimentos de Caixa** - Módulo de movimentações de caixa
- **Contas a Pagar** - Módulo de contas a pagar
- **Contas a Receber** - Módulo de contas a receber
- **Movimento Bancário** - Módulo de movimentações bancárias
- **Obrigações** - Módulo de obrigações
- **Frente de Caixa** - Módulo de frente de caixa
- **Fechamento Diário** - Módulo de fechamento financeiro
- **Transferências** - Módulo de transferências financeiras

#### 4. **Main** (`public/locales/pt/main.json` / `public/locales/en/main.json`)
- **Clientes** - Cadastros de clientes
- **Contas Correntes** - Módulo de contas correntes
- **Categorias de Produtos** - Cadastros de categorias
- **Produtos** - Módulo de produtos
- **Empresas** - Cadastros de empresas
- **Serviços** - Módulo de serviços
- **Matérias-Primas** - Módulo de matérias-primas
- **Composições** - Módulo de composições
- **Módulos** - Cadastros de módulos

#### 5. **Common** (`public/locales/pt/common.json` / `public/locales/en/common.json`)
- **Global** - Traduções globais compartilhadas
- **Forms** - Mensagens de formulários
- **Tables** - Mensagens de tabelas
- **Navigation** - Elementos de navegação
- **Dates** - Traduções de datas
- **Validation** - Mensagens de validação

#### 6. **Specific** (`public/locales/pt/specific.json` / `public/locales/en/specific.json`)
- **Order** - Enums de status e tipos de pedidos
- **Logs** - Mensagens de log do sistema
- **Welcome** - Mensagens de boas-vindas
- **Language** - Seleção de idioma

## Como Usar

### 1. Importar o Namespace

```typescript
import { TRANSLATION_NAMESPACES } from '../locales';
```

### 2. Usar o Hook useTranslation com o Namespace Correto

```typescript
// Para componentes do ReferenciaisSidebar
const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);

// Para componentes do CommercialSidebar
const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMERCIAL);

// Para componentes do FinancialSidebar
const { t } = useTranslation(TRANSLATION_NAMESPACES.FINANCIAL);

// Para componentes do MainSidebar
const { t } = useTranslation(TRANSLATION_NAMESPACES.MAIN);

// Para traduções comuns
const { t } = useTranslation(TRANSLATION_NAMESPACES.COMMON);

// Para traduções específicas
const { t } = useTranslation(TRANSLATION_NAMESPACES.SPECIFIC);
```

### 3. Exemplos de Uso

```typescript
// Referenciais
t('groups.title') // "Grupos" (pt) / "Groups" (en)
t('fiscalCodes.new') // "Novo Código Fiscal" (pt) / "New Fiscal Code" (en)

// Comercial
t('orders.title') // "Pedidos" (pt) / "Orders" (en)
t('sellers.editSeller') // "Editar Vendedor" (pt) / "Edit Seller" (en)

// Financeiro
t('cashMovements.title') // "Movimentos de Caixa" (pt) / "Cash Movements" (en)
t('accountsPayable.new') // "Nova Conta a Pagar" (pt) / "New Account Payable" (en)

// Principal
t('customers.title') // "Clientes" (pt) / "Customers" (en)
t('products.editProduct') // "Editar Produto" (pt) / "Edit Product" (en)

// Comum
t('common.loading') // "Carregando..." (pt) / "Loading..." (en)
t('forms.saveSuccess') // "Salvo com sucesso!" (pt) / "Saved successfully!" (en)

// Específico
t('order.enums.status.PENDING') // "Pendente" (pt) / "Pending" (en)
t('logs.customersReceived') // "Clientes recebidos com sucesso" (pt) / "Customers received successfully" (en)
```

## Vantagens da Nova Organização

1. **Modularidade**: Cada sidebar tem suas próprias traduções
2. **Manutenibilidade**: Arquivos menores e mais fáceis de manter
3. **Organização**: Traduções agrupadas logicamente por funcionalidade
4. **Performance**: Carregamento sob demanda das traduções necessárias
5. **Escalabilidade**: Fácil adicionar novos módulos e traduções
6. **Colaboração**: Diferentes desenvolvedores podem trabalhar em módulos diferentes

## Migração

### Para Componentes Existentes

1. Identificar qual sidebar o componente pertence
2. Importar o namespace correto
3. Atualizar o hook useTranslation
4. Atualizar as chaves de tradução conforme necessário

### Exemplo de Migração

**Antes:**
```typescript
const { t } = useTranslation();
t('groups.title')
```

**Depois:**
```typescript
import { TRANSLATION_NAMESPACES } from '../locales';
const { t } = useTranslation(TRANSLATION_NAMESPACES.REFERENCE);
t('groups.title')
```

## Configuração do i18n

O arquivo `src/i18n.ts` foi atualizado para incluir todos os novos namespaces:

```typescript
ns: [
  "translation", 
  "chartAccount", 
  "taxSituation", 
  "common", 
  "reference", 
  "commercial", 
  "financial", 
  "main",
  "specific"
]
```

## Estrutura de Pastas

```
public/locales/
├── pt/
│   ├── reference.json      # ReferenciaisSidebar
│   ├── commercial.json     # CommercialSidebar
│   ├── financial.json      # FinancialSidebar
│   ├── main.json          # MainSidebar
│   ├── common.json        # Traduções comuns
│   └── specific.json      # Traduções específicas
└── en/
    ├── reference.json      # ReferenciaisSidebar (EN)
    ├── commercial.json     # CommercialSidebar (EN)
    ├── financial.json      # FinancialSidebar (EN)
    ├── main.json          # MainSidebar (EN)
    ├── common.json        # Common translations (EN)
    └── specific.json      # Specific translations (EN)
```

## Próximos Passos

1. Migrar todos os componentes existentes para usar os novos namespaces
2. Remover traduções duplicadas dos arquivos legados
3. Adicionar novas traduções conforme necessário
4. Implementar testes para validar as traduções
5. Documentar padrões específicos de cada módulo
