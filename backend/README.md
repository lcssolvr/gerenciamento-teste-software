# TestManager Backend API

Backend em Node.js para o sistema de gerenciamento de testes TestManager, desenvolvido com Express.js e Firebase.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Firebase Admin SDK** - Autenticação e Firestore
- **JWT** - Tokens de autenticação
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - Segurança HTTP
- **Morgan** - Logging de requisições

## 📁 Estrutura do Projeto

```
src/
├── config/
│   ├── firebase.js          # Configuração do Firebase Admin SDK
│   └── database.js          # Configuração do Firestore e utilitários
├── controllers/
│   ├── authController.js    # Controlador de autenticação
│   ├── userController.js    # Controlador de usuários
│   ├── clientController.js  # Controlador de clientes
│   └── projectController.js # Controlador de projetos
├── middleware/
│   ├── auth.js             # Middleware de autenticação
│   ├── validation.js       # Middleware de validação
│   └── errorHandler.js     # Middleware de tratamento de erros
├── routes/
│   ├── auth.js            # Rotas de autenticação
│   ├── users.js           # Rotas de usuários
│   ├── clients.js         # Rotas de clientes
│   └── projects.js        # Rotas de projetos
└── server.js              # Arquivo principal do servidor
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

### 2. Firebase Setup

Configure as credenciais do Firebase Admin SDK no arquivo `.env`:

```env
FIREBASE_PROJECT_ID=seu-projeto-firebase
FIREBASE_PRIVATE_KEY_ID=sua-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com
# ... outras configurações
```

### 3. Instalação

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Executar em produção
npm start
```

## 📚 Endpoints da API

### Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| POST | `/login` | Login com email/senha | Público |
| POST | `/firebase` | Login com token Firebase (Google) | Público |
| GET | `/me` | Dados do usuário atual | Privado |
| POST | `/logout` | Logout do usuário | Privado |
| POST | `/create-user` | Criar usuário com senha | Admin |

### Usuários (`/api/users`)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/` | Listar usuários (paginado) | Privado |
| GET | `/search` | Buscar usuários | Privado |
| GET | `/:id` | Obter usuário por ID | Privado |
| POST | `/` | Criar novo usuário | Admin |
| PUT | `/:id` | Atualizar usuário | Admin/Próprio |
| DELETE | `/:id` | Deletar usuário | Admin |
| PUT | `/:id/password` | Alterar senha | Admin/Próprio |

### Clientes (`/api/clients`)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/` | Listar clientes (paginado) | Privado |
| GET | `/search` | Buscar clientes | Privado |
| GET | `/stats` | Estatísticas de clientes | Privado |
| GET | `/:id` | Obter cliente por ID | Privado |
| POST | `/` | Criar novo cliente | Privado |
| PUT | `/:id` | Atualizar cliente | Privado |
| DELETE | `/:id` | Deletar cliente | Admin/Gerente |

### Projetos (`/api/projects`)

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/` | Listar projetos (paginado) | Privado |
| GET | `/search` | Buscar projetos | Privado |
| GET | `/stats` | Estatísticas de projetos | Privado |
| GET | `/:id` | Obter projeto por ID | Privado |
| POST | `/` | Criar novo projeto | Privado |
| PUT | `/:id` | Atualizar projeto | Privado |
| DELETE | `/:id` | Deletar projeto | Admin/Gerente |

## 🔐 Autenticação

A API suporta dois tipos de autenticação:

### 1. JWT Customizado
Para usuários criados diretamente na API com senha:
```
Authorization: Bearer <jwt-token>
```

### 2. Firebase ID Token
Para usuários autenticados via Google/Firebase:
```
Authorization: Bearer <firebase-id-token>
```

## 📝 Exemplos de Uso

### Login com Email/Senha
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testmanager.com",
    "password": "123456"
  }'
```

### Criar Usuário
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "João Silva",
    "email": "joao@empresa.com",
    "role": "Usuário",
    "company": "Empresa ABC",
    "department": "TI"
  }'
```

### Criar Cliente
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@cliente.com",
    "company": "Cliente XYZ",
    "phone": "(11) 99999-9999"
  }'
```

### Criar Projeto
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Projeto de Testes",
    "description": "Descrição do projeto",
    "status": "Planejamento",
    "priority": "Alta",
    "responsibleId": "user-id",
    "clients": ["client-id-1", "client-id-2"]
  }'
```

## 🛡️ Segurança

- **CORS** configurado para origens específicas
- **Helmet** para headers de segurança
- **Validação** de entrada em todos os endpoints
- **Autenticação** obrigatória para rotas privadas
- **Autorização** baseada em roles (Admin, Gerente, Usuário)
- **Hash** seguro de senhas com bcrypt
- **Rate limiting** (recomendado para produção)

## 🔧 Validações

### Usuário
- Nome: 2-100 caracteres
- Email: formato válido
- Role: Administrador, Gerente ou Usuário
- Telefone: formato brasileiro (opcional)

### Cliente
- Nome: 2-100 caracteres
- Email: formato válido
- Empresa: máximo 100 caracteres (opcional)
- Telefone: formato brasileiro (opcional)

### Projeto
- Nome: 2-100 caracteres
- Status: Planejamento, Em Andamento, Pausado, Concluído, Cancelado
- Prioridade: Baixa, Média, Alta, Crítica
- Responsável: ID de usuário válido

## 🚀 Deploy

### Desenvolvimento Local
```bash
npm run dev
```

### Produção
```bash
npm start
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoramento

- **Health Check**: `GET /health`
- **Logs**: Morgan para logging de requisições
- **Errors**: Middleware centralizado de tratamento de erros

## 🔄 Integração com Frontend

O backend está preparado para integração com o frontend Vue.js:

1. **CORS** configurado para `http://localhost:5173`
2. **Estrutura de resposta** padronizada:
```json
{
  "success": true,
  "message": "Mensagem de sucesso",
  "data": { ... }
}
```
3. **Códigos HTTP** apropriados
4. **Validação** de entrada consistente

## 🐛 Troubleshooting

### Firebase não configurado
Se você ver a mensagem "Firebase não configurado", verifique:
1. Arquivo `.env` existe e está configurado
2. Credenciais do Firebase estão corretas
3. Projeto Firebase está ativo

### Erro de CORS
Se houver erro de CORS:
1. Verifique a variável `CORS_ORIGINS` no `.env`
2. Adicione a origem do frontend na lista

### Erro de autenticação
Para problemas de autenticação:
1. Verifique se o token está sendo enviado no header
2. Confirme se o token não expirou
3. Verifique se o usuário existe e está ativo

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido para o TestManager** - Sistema de Gerenciamento de Testes

