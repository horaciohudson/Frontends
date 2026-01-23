# APINfe Frontend

Sistema de Emissão de Notas Fiscais Eletrônicas (NF-e)

## 🚀 Tecnologias

- **React 18** com TypeScript
- **Material-UI** para componentes visuais
- **React Query** para gerenciamento de estado e cache
- **React Router DOM** para navegação
- **Axios** para requisições HTTP
- **React Hook Form** + **Zod** para formulários e validação
- **Vite** como bundler

## 📁 Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── common/        # Inputs customizados, badges, etc
│   ├── layout/        # Layout principal, header, sidebar
│   └── nfe/           # Componentes específicos de NF-e
├── contexts/          # Contexts do React (Auth, etc)
├── hooks/             # Custom hooks
├── pages/             # Páginas da aplicação
│   ├── dashboard/     # Dashboard
│   ├── nfe/           # Emissão, listagem e detalhes
│   └── cadastros/     # Produtos e clientes
├── services/          # Serviços de API
├── types/             # Tipos TypeScript
└── utils/             # Utilitários e helpers
```

## 🎯 Funcionalidades

### ✅ Implementadas

- **Autenticação**: Login com JWT
- **Dashboard**: Estatísticas e resumos
- **Cadastros**:
  - Produtos fiscais (CRUD completo)
  - Clientes (CRUD completo)
- **Emissão de NF-e**:
  - Wizard de 4 etapas
  - Validações em tempo real
  - Preview de DANFE
  - Cálculo automático de totais
- **Listagem de NF-e**:
  - Filtros por data e status
  - Download de DANFE
- **Detalhes de NF-e**:
  - Informações completas
  - Timeline de eventos
  - Cancelamento
  - Carta de Correção Eletrônica (CCe)

## 🔧 Configuração

### Porta do Frontend
- **Porta**: 5180
- **Proxy para Backend**: http://localhost:8084

### Variáveis de Ambiente

O frontend está configurado para se comunicar com o backend através do proxy do Vite.
Todas as requisições para `/api` são redirecionadas para `http://localhost:8084`.

## 🚀 Como Executar

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5180`

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

## 📝 Componentes Principais

### Inputs Customizados
- **CpfCnpjInput**: Formatação e validação automática
- **CepInput**: Formatação e validação de CEP
- **CurrencyInput**: Formatação de valores monetários

### Páginas
- **LoginPage**: Autenticação de usuários
- **DashboardPage**: Visão geral do sistema
- **ProductsPage**: Gestão de produtos fiscais
- **CustomersPage**: Gestão de clientes
- **NFeEmissaoPage**: Emissão de notas fiscais
- **NFeListagemPage**: Lista de notas emitidas
- **NFeDetalhesPage**: Detalhes completos da NF-e

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. O token é armazenado no localStorage e
incluído automaticamente em todas as requisições através de um interceptor do Axios.

## 📊 Gerenciamento de Estado

React Query é utilizado para:
- Cache de dados
- Sincronização com o servidor
- Atualizações automáticas
- Loading e error states

## 🎨 Tema

O tema padrão do Material-UI é utilizado com customizações mínimas.
Cores principais:
- **Primary**: #1976d2 (azul)
- **Secondary**: #dc004e (vermelho)

## 📱 Responsividade

Todas as páginas são responsivas e funcionam em:
- Desktop
- Tablet
- Mobile

## 🔄 Próximas Funcionalidades

- [ ] Inutilização de numeração
- [ ] Manifestação do destinatário
- [ ] Importação de XML
- [ ] Integração com e-mail
- [ ] Gráficos avançados no dashboard
- [ ] Exportação para Excel
- [ ] Relatórios customizados

## 📄 Licença

Propriedade de SigeveSystems
