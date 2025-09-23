# TestManager API - Documentação Completa

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Estrutura de Resposta](#estrutura-de-resposta)
4. [Códigos de Status](#códigos-de-status)
5. [Endpoints](#endpoints)
6. [Modelos de Dados](#modelos-de-dados)
7. [Exemplos Práticos](#exemplos-práticos)

## 🎯 Visão Geral

A API TestManager é uma REST API desenvolvida em Node.js que fornece funcionalidades completas para gerenciamento de usuários, clientes e projetos de teste.

**Base URL**: `http://localhost:3000`

## 🔐 Autenticação

### Tipos de Autenticação

#### 1. JWT Customizado
Para usuários criados diretamente na API:
```
Authorization: Bearer <jwt-token>
```

#### 2. Firebase ID Token
Para usuários autenticados via Google:
```
Authorization: Bearer <firebase-id-token>
```

### Roles de Usuário
- **Administrador**: Acesso total ao sistema
- **Gerente**: Pode gerenciar clientes e projetos
- **Usuário**: Acesso limitado aos próprios dados

## 📊 Estrutura de Resposta

### Sucesso
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": {
    // dados da resposta
  }
}
```

### Erro
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": [
    {
      "field": "campo",
      "message": "mensagem de erro",
      "value": "valor inválido"
    }
  ]
}
```

## 🚦 Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | OK - Sucesso |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro interno |

## 🛣️ Endpoints

### Sistema

#### Health Check
```http
GET /health
```

**Resposta:**
```json
{
  "success": true,
  "message": "TestManager API está funcionando",
  "timestamp": "2025-09-11T22:55:06.795Z",
  "environment": "development",
  "version": "1.0.0"
}
```

---

### Autenticação (`/api/auth`)

#### Login com Email/Senha
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "admin@testmanager.com",
  "password": "123456"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "name": "Administrador",
      "email": "admin@testmanager.com",
      "role": "Administrador",
      "company": "TestManager",
      "department": "TI",
      "isActive": true
    }
  }
}
```

#### Login com Firebase (Google)
```http
POST /api/auth/firebase
```

**Body:**
```json
{
  "idToken": "firebase-id-token"
}
```

#### Dados do Usuário Atual
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Criar Usuário com Senha (Admin)
```http
POST /api/auth/create-user
Authorization: Bearer <admin-token>
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "password": "senha123",
  "role": "Usuário",
  "company": "Empresa ABC",
  "department": "TI",
  "phone": "(11) 99999-9999"
}
```

---

### Usuários (`/api/users`)

#### Listar Usuários
```http
GET /api/users?page=1&limit=10&q=termo-busca
Authorization: Bearer <token>
```

**Parâmetros de Query:**
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10, máx: 100)
- `q` (opcional): Termo de busca

**Resposta:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-id",
        "name": "João Silva",
        "email": "joao@empresa.com",
        "role": "Usuário",
        "company": "Empresa ABC",
        "department": "TI",
        "phone": "(11) 99999-9999",
        "isActive": true,
        "createdAt": "2025-09-11T20:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### Buscar Usuários
```http
GET /api/users/search?q=termo-busca
Authorization: Bearer <token>
```

#### Obter Usuário por ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Criar Usuário (Admin)
```http
POST /api/users
Authorization: Bearer <admin-token>
```

**Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@empresa.com",
  "role": "Gerente",
  "company": "Empresa ABC",
  "department": "Qualidade",
  "phone": "(11) 88888-8888",
  "password": "senha123" // opcional
}
```

#### Atualizar Usuário
```http
PUT /api/users/:id
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Maria Santos Silva",
  "role": "Administrador",
  "phone": "(11) 77777-7777",
  "isActive": false
}
```

#### Deletar Usuário (Admin)
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

#### Alterar Senha
```http
PUT /api/users/:id/password
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "senha-atual", // opcional para admin
  "newPassword": "nova-senha"
}
```

---

### Clientes (`/api/clients`)

#### Listar Clientes
```http
GET /api/clients?page=1&limit=10&q=termo-busca
Authorization: Bearer <token>
```

#### Buscar Clientes
```http
GET /api/clients/search?q=termo-busca
Authorization: Bearer <token>
```

#### Estatísticas de Clientes
```http
GET /api/clients/stats
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "active": 12,
    "inactive": 3
  }
}
```

#### Obter Cliente por ID
```http
GET /api/clients/:id
Authorization: Bearer <token>
```

#### Criar Cliente
```http
POST /api/clients
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Pedro Costa",
  "email": "pedro@cliente.com",
  "company": "Cliente XYZ",
  "phone": "(11) 99999-9999",
  "address": "Rua das Flores, 123",
  "notes": "Cliente importante"
}
```

#### Atualizar Cliente
```http
PUT /api/clients/:id
Authorization: Bearer <token>
```

#### Deletar Cliente
```http
DELETE /api/clients/:id
Authorization: Bearer <token>
```

---

### Projetos (`/api/projects`)

#### Listar Projetos
```http
GET /api/projects?page=1&limit=10&status=Em Andamento&priority=Alta
Authorization: Bearer <token>
```

**Parâmetros de Query:**
- `page`, `limit`, `q`: Paginação e busca
- `status`: Filtrar por status
- `priority`: Filtrar por prioridade

#### Buscar Projetos
```http
GET /api/projects/search?q=termo-busca
Authorization: Bearer <token>
```

#### Estatísticas de Projetos
```http
GET /api/projects/stats
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "active": 30,
    "completed": 15,
    "byStatus": {
      "Planejamento": 10,
      "Em Andamento": 20,
      "Concluído": 15,
      "Pausado": 3,
      "Cancelado": 2
    },
    "byPriority": {
      "Baixa": 5,
      "Média": 20,
      "Alta": 20,
      "Crítica": 5
    }
  }
}
```

#### Obter Projeto por ID
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "project-id",
      "name": "Projeto de Testes",
      "description": "Descrição detalhada",
      "status": "Em Andamento",
      "priority": "Alta",
      "clients": ["client-id-1", "client-id-2"],
      "responsibleId": "user-id",
      "responsible": {
        "id": "user-id",
        "name": "João Silva",
        "email": "joao@empresa.com",
        "role": "Gerente"
      },
      "clientsData": [
        {
          "id": "client-id-1",
          "name": "Pedro Costa",
          "email": "pedro@cliente.com",
          "company": "Cliente XYZ"
        }
      ],
      "createdAt": "2025-09-11T20:00:00.000Z",
      "updatedAt": "2025-09-11T21:00:00.000Z"
    }
  }
}
```

#### Criar Projeto
```http
POST /api/projects
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Novo Projeto",
  "description": "Descrição do projeto",
  "status": "Planejamento",
  "priority": "Média",
  "responsibleId": "user-id",
  "clients": ["client-id-1", "client-id-2"]
}
```

#### Atualizar Projeto
```http
PUT /api/projects/:id
Authorization: Bearer <token>
```

#### Deletar Projeto
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

---

## 📋 Modelos de Dados

### Usuário
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Gerente' | 'Usuário';
  company?: string;
  department?: string;
  phone?: string;
  picture?: string;
  isActive: boolean;
  provider: 'email' | 'google' | 'admin_created';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
```

### Cliente
```typescript
interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### Projeto
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'Planejamento' | 'Em Andamento' | 'Pausado' | 'Concluído' | 'Cancelado';
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  clients: string[];
  responsibleId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 💡 Exemplos Práticos

### Fluxo Completo de Autenticação

1. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@testmanager.com","password":"123456"}'
```

2. **Usar token nas próximas requisições:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Criar um Projeto Completo

1. **Criar cliente:**
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "João Cliente",
    "email": "joao@cliente.com",
    "company": "Empresa Cliente"
  }'
```

2. **Criar projeto vinculando o cliente:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Projeto Teste",
    "description": "Projeto de exemplo",
    "status": "Planejamento",
    "priority": "Alta",
    "responsibleId": "user-id",
    "clients": ["client-id"]
  }'
```

### Busca e Filtros

```bash
# Buscar usuários por email
curl "http://localhost:3000/api/users/search?q=joao" \
  -H "Authorization: Bearer <token>"

# Listar projetos ativos com alta prioridade
curl "http://localhost:3000/api/projects?status=Em%20Andamento&priority=Alta" \
  -H "Authorization: Bearer <token>"

# Paginação
curl "http://localhost:3000/api/clients?page=2&limit=5" \
  -H "Authorization: Bearer <token>"
```

---

## 🔧 Tratamento de Erros

### Erro de Validação
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [
    {
      "field": "email",
      "message": "Email deve ter um formato válido",
      "value": "email-invalido"
    }
  ]
}
```

### Erro de Autenticação
```json
{
  "success": false,
  "message": "Token de acesso não fornecido"
}
```

### Erro de Autorização
```json
{
  "success": false,
  "message": "Acesso negado. Apenas administradores podem realizar esta ação."
}
```

### Recurso Não Encontrado
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

---

Esta documentação cobre todos os endpoints disponíveis na API TestManager. Para mais informações ou suporte, consulte o arquivo README.md do projeto.

