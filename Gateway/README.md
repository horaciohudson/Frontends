# Sigeve Gateway Frontend

Frontend do Gateway Sigeve - Sistema de gerenciamento centralizado dos módulos Sigeve.

## Tecnologias

- React 19
- TypeScript
- Vite
- React Router DOM
- Axios
- CSS Puro

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5174`

## Build

```bash
npm run build
```

## Funcionalidades

- **Dashboard**: Visão geral de todos os módulos
- **System Launcher**: Gerenciar módulos (iniciar/parar/reiniciar)
- **Health Check**: Monitoramento em tempo real
- **Data Sync**: Importação e exportação de dados

## Login

Usuário padrão: `admin`
Senha padrão: `admin`

## Backend

O frontend se comunica com o backend Gateway na porta 9000.
Certifique-se de que o backend está rodando antes de iniciar o frontend.
