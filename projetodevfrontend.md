# Especificação Técnica — Desafio Frontend: Kanban

> Documento — Processo Seletivo Frontend Developer

---

## 1. Introdução

Este documento descreve o desafio técnico para candidatos à vaga de **Frontend Developer**.

O backend (API REST em Python/FastAPI com autenticação JWT) já está implementado e disponível. O candidato **não precisa construir nem alterar o backend** — apenas consumi-lo para desenvolver o frontend.

O sistema é um **Kanban colaborativo multi-board**, com controle de permissões por usuário, histórico de interações imutável e regras de negócio que devem ser corretamente refletidas na interface.

### Entrega

O candidato deve entregar **obrigatoriamente os dois itens abaixo juntos**, sem exceção:

- 🎨 **Projeto no Figma**
- 💻 **Repositório Git**

> Entregas incompletas (apenas Figma ou apenas código) **não serão avaliadas**.

O candidato deve projetar as telas no Figma **antes de iniciar a implementação**. O design orienta o desenvolvimento e também é critério de avaliação.

Esperamos ver no Figma:
- Componentização visual clara (botões, inputs, cards, modais, etc.)
- Fluxo de navegação entre as telas
- Tratamento visual dos estados: loading, erro, vazio, sucesso
- Tratamento do modal de observação obrigatória ao mover um card
- Layout responsivo (desktop e mobile)

### Prazo

O candidato tem **2 semanas** a partir do recebimento deste documento para entregar ambos os itens.

### Stack do Backend

| Componente      | Tecnologia               |
|-----------------|--------------------------|
| Linguagem       | Python 3.12              |
| Framework       | FastAPI                  |
| Banco de Dados  | PostgreSQL               |
| Autenticação    | JWT (access + refresh)   |

### Usuários pré-cadastrados para testes

| username | email                | senha     | role   | is_active |
|----------|----------------------|-----------|--------|-----------|
| admin    | admin@kanban.dev     | Admin@123 | admin  | ✅ ativo  |
| alice    | alice@kanban.dev     | Teste@123 | member | ✅ ativo  |
| bob      | bob@kanban.dev       | Teste@123 | member | ✅ ativo  |
| carol    | carol@kanban.dev     | Teste@123 | member | ✅ ativo  |
| dave     | dave@kanban.dev      | Teste@123 | member | ❌ inativo |

> `dave` está inativo propositalmente. Tentativas de login com este usuário devem retornar `403 Forbidden`. O frontend deve tratar e exibir este erro de forma clara ao usuário.

**Board de exemplo pré-criado:** "Projeto Alpha"
- Membros: alice (editor), bob (editor), carol (viewer)
- Colunas: Backlog → Em Andamento → Em Revisão → Concluído
- Cards de exemplo distribuídos entre as colunas com histórico já populado

---

## 2. Requisitos Funcionais

Cada RF vale **1 ponto**. Total: **14 pontos**.

| ID    | Requisito | Pontos |
|-------|-----------|--------|
| RF-01 | O candidato deve autenticar com username e senha e receber um JWT | 1 |
| RF-02 | O sistema deve renovar o token automaticamente via refresh token antes de expirar | 1 |
| RF-03 | O usuário deve visualizar apenas os boards aos quais tem acesso | 1 |
| RF-04 | O board deve exibir as colunas com seus respectivos cards | 1 |
| RF-05 | O usuário deve conseguir mover um card entre colunas via drag-and-drop | 1 |
| RF-06 | Ao mover um card, um modal deve ser exibido exigindo uma observação obrigatória | 1 |
| RF-07 | Sem preencher a observação, a movimentação não deve ser concluída | 1 |
| RF-08 | O usuário deve conseguir visualizar o detalhe de um card com todos os seus dados | 1 |
| RF-09 | O detalhe do card deve exibir o histórico completo de interações em ordem cronológica inversa | 1 |
| RF-10 | O usuário deve conseguir adicionar comentários a um card | 1 |
| RF-11 | O board deve exibir um feed de atividade recente com todas as interações | 1 |
| RF-12 | Usuários com permissão `viewer` não devem conseguir mover ou editar cards | 1 |
| RF-13 | O sistema deve exibir indicador visual quando uma coluna atingir o WIP limit | 1 |
| RF-14 | Tentativa de mover card para coluna com WIP limit atingido deve exibir mensagem de erro clara | 1 |

---

## 3. Requisitos Não Funcionais

Cada RNF vale **1 ponto**. Total: **9 pontos**.

| ID     | Requisito | Pontos |
|--------|-----------|--------|
| RNF-01 | O frontend deve ser desenvolvido em **React** (com framework Next.js) | 1 |
| RNF-02 | Uso de **TypeScript** é fortemente recomendado | 1 |
| RNF-03 | O código deve estar em repositório **Git** com histórico de commits organizado | 1 |
| RNF-04 | O projeto deve ter um `README.md` com instruções claras de como rodar localmente | 1 |
| RNF-05 | A interface deve ser responsiva para desktop e mobile | 1 |
| RNF-06 | Feedbacks visuais de loading, erro e sucesso devem estar presentes em todas as ações | 1 |
| RNF-07 | O token JWT deve ser armazenado de forma segura e enviado em todas as requisições autenticadas | 1 |
| RNF-08 | O link do Figma deve ser entregue junto ao repositório | 1 |
| RNF-09 | Não é permitido alterar ou reimplementar o backend | 1 |

---

## 4. Regras de Negócio

### 4.1 Autenticação e Autorização

| Regra | Detalhe |
|-------|---------|
| RN-01 | Access token expira em **1 hora** |
| RN-02 | Refresh token expira em **7 dias** |
| RN-03 | Usuário inativo não consegue autenticar (`403`) |
| RN-04 | Usuário `admin` acessa e opera em todos os boards |
| RN-05 | Membro com permissão `viewer` pode visualizar cards e **comentar**, mas não editar nem mover |
| RN-06 | Membro com permissão `editor` pode criar, editar, mover e arquivar cards |
| RN-07 | Apenas `admin` pode criar boards, gerenciar colunas, membros e alterar roles |

### 4.2 Movimentação de Cards

| Regra | Detalhe |
|-------|---------|
| RN-08 | **Observação é obrigatória** ao mover um card entre colunas |
| RN-09 | A observação deve ter no mínimo **10 caracteres** |
| RN-10 | Card arquivado não pode ser movido |
| RN-11 | Se a coluna destino possui `wip_limit` definido, a movimentação é bloqueada quando o limite está atingido |

### 4.3 Colunas

| Regra | Detalhe |
|-------|---------|
| RN-12 | Posições das colunas são únicas por board |
| RN-13 | Coluna só pode ser deletada se não houver cards ativos nela |
| RN-14 | `wip_limit = null` significa sem limite de cards |

### 4.4 Histórico

| Regra | Detalhe |
|-------|---------|
| RN-15 | Registros de histórico são **imutáveis** — nunca são editados ou deletados |
| RN-16 | Criação de card gera automaticamente `action: 'created'` no histórico |
| RN-17 | Cada campo editado gera uma entrada separada no histórico com os valores anterior e novo |
| RN-18 | Arquivamento de card gera `action: 'archived'` no histórico |

---

## 5. Banco de Dados

### 5.1 Tabela `users`

```
users
─────────────────────────────────────
id            UUID         PK
username      VARCHAR(50)  UNIQUE NOT NULL
email         VARCHAR(120) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
role          ENUM('admin','member') DEFAULT 'member'
is_active     BOOLEAN DEFAULT true
created_at    TIMESTAMP DEFAULT now()
updated_at    TIMESTAMP DEFAULT now()
```

### 5.2 Tabela `boards`

```
boards
─────────────────────────────────────
id            UUID         PK
name          VARCHAR(100) NOT NULL
description   TEXT
owner_id      UUID         FK → users.id
is_archived   BOOLEAN DEFAULT false
created_at    TIMESTAMP DEFAULT now()
updated_at    TIMESTAMP DEFAULT now()
```

### 5.3 Tabela `board_members`

```
board_members
─────────────────────────────────────
id            UUID  PK
board_id      UUID  FK → boards.id
user_id       UUID  FK → users.id
permission    ENUM('viewer','editor') DEFAULT 'editor'
joined_at     TIMESTAMP DEFAULT now()

UNIQUE(board_id, user_id)
```

> Admin sempre tem acesso a todos os boards, independente desta tabela.

### 5.4 Tabela `columns`

```
columns
─────────────────────────────────────
id            UUID        PK
board_id      UUID        FK → boards.id
name          VARCHAR(80) NOT NULL
position      INTEGER NOT NULL        ← ordem da coluna no board
color         VARCHAR(7)              ← hex color ex: #3B82F6
wip_limit     INTEGER NULL            ← limite de cards simultâneos (null = sem limite)
created_at    TIMESTAMP DEFAULT now()
updated_at    TIMESTAMP DEFAULT now()

UNIQUE(board_id, position)
```

### 5.5 Tabela `cards`

```
cards
─────────────────────────────────────
id            UUID         PK
column_id     UUID         FK → columns.id
board_id      UUID         FK → boards.id   ← denormalizado para queries
title         VARCHAR(200) NOT NULL
description   TEXT
priority      ENUM('low','medium','high','critical') DEFAULT 'medium'
assignee_id   UUID         FK → users.id NULL
position      INTEGER NOT NULL              ← ordem dentro da coluna
due_date      DATE NULL
tags          TEXT[]                        ← array de strings
is_archived   BOOLEAN DEFAULT false
created_by    UUID         FK → users.id
created_at    TIMESTAMP DEFAULT now()
updated_at    TIMESTAMP DEFAULT now()
```

### 5.6 Tabela `card_history` (append-only)

```
card_history
─────────────────────────────────────
id            UUID  PK
card_id       UUID  FK → cards.id
user_id       UUID  FK → users.id
action        ENUM(
                'created',
                'moved',
                'edited',
                'commented',
                'assigned',
                'unassigned',
                'archived',
                'priority_changed',
                'due_date_changed'
              ) NOT NULL
observation   TEXT NULL    ← OBRIGATÓRIO quando action = 'moved'
from_column   UUID NULL    FK → columns.id
to_column     UUID NULL    FK → columns.id
metadata      JSONB NULL   ← campos alterados: { "field": "priority", "from": "medium", "to": "high" }
created_at    TIMESTAMP DEFAULT now()
```

> Esta tabela **nunca sofre DELETE ou UPDATE**. É o registro de auditoria do sistema.

---

## 6. Endpoints da API

Base URL: `http://seunome.flashnetbrasil.com.br/api/v1`

`🔒` = requer Authorization header com Bearer token

---

### 6.1 Autenticação

#### `POST /auth/login`

**Request:**
```json
{ "username": "alice", "password": "Teste@123" }
```

**Response 200:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "username": "alice",
    "email": "alice@kanban.dev",
    "role": "member"
  }
}
```

**Erros:** `401` credenciais inválidas | `403` usuário inativo

---

#### `POST /auth/refresh`

**Request:**
```json
{ "refresh_token": "eyJ..." }
```

**Response 200:**
```json
{ "access_token": "eyJ...", "expires_in": 3600 }
```

---

#### `POST /auth/logout` `🔒`

**Response 204:** No content

---

#### `GET /auth/me` `🔒`

**Response 200:**
```json
{
  "id": "uuid",
  "username": "alice",
  "email": "alice@kanban.dev",
  "role": "member",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 6.2 Boards

#### `GET /boards` `🔒`
Lista boards do usuário. Admin vê todos; member vê apenas os que é membro.

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Projeto Alpha",
      "description": "...",
      "owner": { "id": "uuid", "username": "admin" },
      "my_permission": "editor",
      "members_count": 3,
      "cards_count": 12,
      "is_archived": false,
      "created_at": "..."
    }
  ],
  "total": 1
}
```

---

#### `POST /boards` `🔒 Admin`

**Request:**
```json
{ "name": "Projeto Beta", "description": "Descrição opcional" }
```

**Response 201:** Board criado

---

#### `GET /boards/{board_id}` `🔒 Membro`
Retorna o board com colunas e cards aninhados.

**Response 200:**
```json
{
  "id": "uuid",
  "name": "Projeto Alpha",
  "my_permission": "editor",
  "columns": [
    {
      "id": "uuid",
      "name": "Backlog",
      "position": 0,
      "color": "#6B7280",
      "wip_limit": null,
      "cards": [
        {
          "id": "uuid",
          "title": "Criar tela de login",
          "priority": "high",
          "assignee": { "id": "uuid", "username": "alice" },
          "position": 0,
          "due_date": "2024-02-15",
          "tags": ["frontend", "auth"]
        }
      ]
    }
  ]
}
```

---

#### `PATCH /boards/{board_id}` `🔒 Admin`

**Request (todos opcionais):**
```json
{ "name": "Novo Nome", "description": "...", "is_archived": false }
```

**Response 200:** Board atualizado

---

#### `DELETE /boards/{board_id}` `🔒 Admin`
Arquiva o board (soft delete). **Response 204**

---

### 6.3 Membros do Board

#### `GET /boards/{board_id}/members` `🔒 Membro`

**Response 200:**
```json
{
  "items": [
    {
      "user": { "id": "uuid", "username": "alice", "email": "..." },
      "permission": "editor",
      "joined_at": "..."
    }
  ]
}
```

---

#### `POST /boards/{board_id}/members` `🔒 Admin`

**Request:**
```json
{ "user_id": "uuid", "permission": "editor" }
```

**Response 201** | **Erros:** `404` usuário não encontrado | `409` já é membro

---

#### `PATCH /boards/{board_id}/members/{user_id}` `🔒 Admin`

**Request:**
```json
{ "permission": "viewer" }
```

**Response 200**

---

#### `DELETE /boards/{board_id}/members/{user_id}` `🔒 Admin`

**Response 204**

---

### 6.4 Colunas

#### `POST /boards/{board_id}/columns` `🔒 Admin`

**Request:**
```json
{ "name": "QA", "position": 2, "color": "#F59E0B", "wip_limit": 5 }
```

**Response 201** — colunas posteriores são deslocadas automaticamente se a posição já existir

---

#### `PATCH /boards/{board_id}/columns/{column_id}` `🔒 Admin`

**Request (todos opcionais):**
```json
{ "name": "Em Revisão", "color": "#8B5CF6", "wip_limit": 3 }
```

**Response 200**

---

#### `PATCH /boards/{board_id}/columns/reorder` `🔒 Admin`

**Request:**
```json
{
  "column_positions": [
    { "column_id": "uuid-a", "position": 0 },
    { "column_id": "uuid-b", "position": 1 },
    { "column_id": "uuid-c", "position": 2 }
  ]
}
```

**Response 200**

---

#### `DELETE /boards/{board_id}/columns/{column_id}` `🔒 Admin`

**Regra:** Só permite deletar coluna sem cards ativos. **Erro `409`** se houver cards.

**Response 204**

---

### 6.5 Cards

#### `POST /boards/{board_id}/columns/{column_id}/cards` `🔒 Editor`

**Request:**
```json
{
  "title": "Implementar tela de dashboard",
  "description": "...",
  "priority": "high",
  "assignee_id": "uuid",
  "due_date": "2024-03-01",
  "tags": ["dashboard", "frontend"]
}
```

**Response 201** — gera automaticamente `action: 'created'` no histórico

**Erros:** `409` WIP limit atingido

---

#### `GET /cards/{card_id}` `🔒 Membro`

**Response 200:**
```json
{
  "id": "uuid",
  "title": "...",
  "description": "...",
  "column": { "id": "uuid", "name": "Em Andamento" },
  "board": { "id": "uuid", "name": "Projeto Alpha" },
  "priority": "high",
  "assignee": { "id": "uuid", "username": "alice" },
  "position": 1,
  "due_date": "2024-03-01",
  "tags": ["dashboard"],
  "created_by": { "id": "uuid", "username": "admin" },
  "created_at": "...",
  "updated_at": "..."
}
```

---

#### `PATCH /cards/{card_id}` `🔒 Editor`
Atualiza campos do card (exceto coluna).

**Request (todos opcionais):**
```json
{
  "title": "Novo título",
  "description": "...",
  "priority": "critical",
  "assignee_id": "uuid",
  "due_date": "2024-03-15",
  "tags": ["nova-tag"]
}
```

**Response 200** — cada campo alterado gera entrada no histórico com valores anterior/novo

---

#### `POST /cards/{card_id}/move` `🔒 Editor`

> **Regra central:** `observation` é obrigatória. Sem ela, a API retorna `400`.

**Request:**
```json
{
  "target_column_id": "uuid",
  "position": 0,
  "observation": "Iniciando desenvolvimento após alinhamento com o cliente."
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "title": "...",
  "column": { "id": "uuid", "name": "Em Andamento" },
  "position": 0,
  "history_entry": {
    "id": "uuid",
    "action": "moved",
    "from_column": "Backlog",
    "to_column": "Em Andamento",
    "observation": "Iniciando desenvolvimento após alinhamento com o cliente.",
    "performed_by": { "id": "uuid", "username": "alice" },
    "created_at": "..."
  }
}
```

**Erros:**
- `400` `observation` ausente ou vazia
- `400` `observation` com menos de 10 caracteres
- `404` coluna destino não encontrada
- `409` WIP limit da coluna destino atingido
- `422` card está arquivado

---

#### `POST /cards/{card_id}/comments` `🔒 Membro`
Viewers e editors podem comentar.

**Request:**
```json
{ "observation": "Cliente solicitou ajustar a cor do botão para azul." }
```

**Response 201:**
```json
{
  "id": "uuid",
  "action": "commented",
  "observation": "...",
  "performed_by": { "id": "uuid", "username": "carol" },
  "created_at": "..."
}
```

---

#### `DELETE /cards/{card_id}` `🔒 Editor`
Arquiva o card (soft delete). Gera `action: 'archived'` no histórico.

**Response 200:**
```json
{ "message": "Card arquivado com sucesso." }
```

---

### 6.6 Histórico

#### `GET /cards/{card_id}/history` `🔒 Membro`
Histórico completo de um card específico.

**Query params:** `?page=1&per_page=20`

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid",
      "action": "moved",
      "observation": "Iniciando desenvolvimento...",
      "from_column": { "id": "uuid", "name": "Backlog" },
      "to_column": { "id": "uuid", "name": "Em Andamento" },
      "metadata": null,
      "performed_by": { "id": "uuid", "username": "alice" },
      "created_at": "2024-01-15T10:32:00Z"
    },
    {
      "id": "uuid",
      "action": "created",
      "observation": null,
      "from_column": null,
      "to_column": { "id": "uuid", "name": "Backlog" },
      "metadata": null,
      "performed_by": { "id": "uuid", "username": "admin" },
      "created_at": "2024-01-10T09:00:00Z"
    }
  ],
  "total": 2,
  "page": 1,
  "per_page": 20
}
```

---

#### `GET /boards/{board_id}/activity` `🔒 Membro`
Feed de atividade recente de todos os cards do board.

**Query params:** `?limit=50&before=<timestamp_iso>`

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid",
      "card": { "id": "uuid", "title": "Criar tela de login" },
      "action": "moved",
      "observation": "...",
      "from_column": "Backlog",
      "to_column": "Em Andamento",
      "performed_by": { "id": "uuid", "username": "alice" },
      "created_at": "..."
    }
  ]
}
```

---

### 6.7 Usuários

#### `GET /users` `🔒 Admin`

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid",
      "username": "alice",
      "email": "alice@kanban.dev",
      "role": "member",
      "is_active": true,
      "created_at": "..."
    }
  ],
  "total": 5
}
```

---

#### `PATCH /users/{user_id}` `🔒 Admin`

**Request (todos opcionais):**
```json
{ "is_active": false, "role": "admin" }
```

**Response 200**

---

### 6.8 Padrão de Erros

```json
{
  "error": {
    "code": "OBSERVATION_REQUIRED",
    "message": "Uma observação é obrigatória para mover um card entre colunas.",
    "details": null
  }
}
```

| HTTP Status | Uso |
|-------------|-----|
| `400` | Dados inválidos ou regra de negócio violada |
| `401` | Token ausente ou expirado |
| `403` | Sem permissão para a ação |
| `404` | Recurso não encontrado |
| `409` | Conflito de estado (WIP limit, coluna não vazia, membro duplicado) |
| `422` | Ação inválida sobre o estado atual do recurso |
| `500` | Erro inesperado do servidor |

---

## 7. Sugestão de Telas

O candidato deve projetar e implementar ao menos as seguintes telas:

| Tela | Descrição |
|------|-----------|
| **Login** | Campos de username e senha, tratamento de erros de autenticação |
| **Lista de Boards** | Cards com nome, permissão do usuário, contagem de membros e cards |
| **Board (Kanban)** | Colunas com cards, drag-and-drop, indicador visual de WIP limit |
| **Modal de Movimentação** | Acionado ao soltar o card em outra coluna; campo de observação obrigatório bloqueia a ação se vazio |
| **Detalhe do Card** | Modal ou sidebar com todos os campos, histórico em ordem cronológica inversa, botão de comentar |
| **Feed de Atividade** | Linha do tempo de ações recentes do board |

---

## 8. Critérios de Avaliação

> ⚠️ A entrega do **Figma e do repositório são obrigatórios e devem ser enviados juntos**. Entregas incompletas não serão avaliadas.

A pontuação total é composta por **RF + RNF + critérios de avaliação**:

| Bloco | Pontos |
|-------|--------|
| Requisitos Funcionais (14 RFs × 1pt) | 14 |
| Requisitos Não Funcionais (9 RNFs × 1pt) | 9 |
| Critérios de avaliação abaixo | 10 |
| **Total** | **33** |
| Bônus | +2 |

---

### Design (Figma)

Cada critério vale **1 ponto**. Total desta seção: **5 pontos**.

| # | Critério | Pontos |
|---|----------|--------|
| 1 | Cobertura de todos os fluxos principais (login, board, movimentação, detalhe, histórico) | 1 |
| 2 | Tratamento visual de estados: loading, erro, vazio, sucesso | 1 |
| 3 | Componentização e consistência visual | 1 |
| 4 | Responsividade (desktop e mobile) | 1 |
| 5 | Fidelidade ao design na implementação final | 1 |

### Implementação (Código)

Cada critério vale **1 ponto**. Total desta seção: **5 pontos**.

| # | Critério | Pontos |
|---|----------|--------|
| 6 | Modal de observação obrigatória ao mover card implementado corretamente | 1 |
| 7 | Exibição correta do histórico do card (por card) | 1 |
| 8 | Exibição correta do feed de atividade do board (geral) | 1 |
| 9 | Organização do código: componentes, estado, requisições | 1 |
| 10 | Tratamento de erros e feedbacks claros ao usuário | 1 |

### Bônus

| # | Critério | Pontos |
|---|----------|--------|
| B1 | Testes (unitários ou de integração) | +1 |
| B2 | Animações e micro-interações (ex: transição do drag-and-drop, skeleton loading) | +1 |

---
