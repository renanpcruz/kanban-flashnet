# 📌 Kanban Flashnet

Sistema web de gerenciamento de tarefas baseado em Kanban, com foco em
organização de equipes, controle de fluxo e rastreabilidade de ações.

------------------------------------------------------------------------

## 🚀 Sobre o projeto

O **Kanban Flashnet** é uma aplicação web que permite:

-   criação e gerenciamento de boards
-   organização de tarefas em colunas (Kanban)
-   movimentação de cards via drag and drop
-   controle de permissões (admin, editor, viewer)
-   histórico de atividades por board e por card
-   comentários obrigatórios em movimentações (rastreabilidade)

------------------------------------------------------------------------

## 🧠 Funcionalidades

### 🔐 Autenticação

-   login com JWT
-   refresh token automático
-   proteção de rotas

### 📋 Boards

-   criação de boards (admin)
-   listagem de boards
-   visualização de permissões

### 📊 Colunas

-   criação de colunas

### 🧾 Cards

-   criação, edição e arquivamento
-   drag and drop entre colunas

### 🔄 Movimentação

-   validação com observação obrigatória
-   bloqueio por WIP

### 🕒 Histórico

-   rastreamento completo de ações

------------------------------------------------------------------------

## 🖥️ Tecnologias

-   Next.js
-   React
-   TypeScript
-   CSS Modules
-   DnD Kit

------------------------------------------------------------------------

## ⚙️ Como rodar

``` bash
npm install
npm run dev
```

Acesse: http://localhost:3000

------------------------------------------------------------------------

## 👨‍💻 Autor

Renan Pereira da Cruz

------------------------------------------------------------------------

## 🎨 Design no Figma

Este projeto foi inicialmente prototipado no Figma.

👉 [Acessar protótipo completo](https://www.figma.com/design/ABWw35pLDW56iIdqLrfc49/Kanban-FlashNet?node-id=44-29&t=z6siDugAocDKAB4V-1)

Inclui:
- Tela de login
- Dashboard
- Board Kanban
- Modais e interações