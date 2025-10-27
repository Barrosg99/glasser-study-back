# User Service

Serviço de gerenciamento de usuários e goals para o Glasser Study Platform.

## 📋 Descrição

Este serviço é responsável por gerenciar usuários, autenticação e goals na plataforma Glasser Study. Ele utiliza GraphQL com Apollo Federation para se integrar com outros serviços do sistema.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **GraphQL** - Query language e runtime
- **Apollo Federation** - Federated GraphQL schema
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação via tokens
- **bcrypt** - Hash de senhas
- **AWS S3** - Armazenamento de imagens de perfil
- **Nodemailer** - Envio de emails para recuperação de senha

## 📦 Estrutura do Projeto

```
user-service/
├── src/
│   ├── app.module.ts          # Módulo principal da aplicação
│   ├── app.controller.ts      # Controller de health check
│   ├── main.ts                # Arquivo de entrada da aplicação
│   ├── user/                  # Módulo de usuários
│   │   ├── models/
│   │   │   └── user.model.ts  # Modelo de dados do usuário
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── logged-user.dto.ts
│   │   │   ├── admin-edit-user.dto.ts
│   │   │   └── user-summary.dto.ts
│   │   ├── user.service.ts    # Lógica de negócio
│   │   ├── user.resolver.ts   # Resolvers GraphQL
│   │   └── user.module.ts
│   └── goals/                 # Módulo de goals
│       ├── models/
│       │   └── goals.model.ts
│       ├── dto/
│       │   ├── save-goal.dto.ts
│       │   ├── toggle-task-response.dto.ts
│       │   └── goal-summary.dto.ts
│       ├── goals.service.ts
│       ├── goals.resolver.ts
│       └── goals.module.ts
├── docker-compose.yml         # Configuração Docker
├── Dockerfile                 # Imagem Docker
└── package.json
```

## 🛠️ Instalação

### Pré-requisitos

- Node.js (v18 ou superior)
- MongoDB
- AWS S3 (para upload de imagens)
- SMTP Server (para envio de emails)

### Configuração

1. Clone o repositório
```bash
cd user-service
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente (crie um arquivo `.env`):
```env
# Server
PORT=3000

# MongoDB
MONGO_URI=mongodb://admin:admin@localhost:27017/user_db?authSource=admin
MONGO_USERNAME=admin
MONGO_PASSWORD=admin
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=user_db

# JWT
JWT_SECRET=your-secret-key

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# Email
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 🚀 Executando o Serviço

### Desenvolvimento

```bash
npm run start:dev
```

O serviço estará disponível em `http://localhost:3000`

### Produção

```bash
npm run build
npm run start:prod
```

### Docker

```bash
docker-compose up -d
```

## 📡 GraphQL API

### Endpoint

O serviço expõe uma API GraphQL em:
- **URL**: `http://localhost:3000/`
- **Health Check**: `http://localhost:3000/health`
- **GraphQL Playground**: `http://localhost:3000/`

### Schema

#### User Schema

**Campos:**
- `id: ID` - Identificador único do usuário
- `name: String` - Nome do usuário
- `email: String` - Email do usuário
- `goal: UserGoal` - Objetivo do usuário (learn, teach, groupStudy)
- `isAdmin: Boolean` - Se é administrador
- `blocked: Boolean` - Se está bloqueado
- `profileImageUrl: String` - URL da imagem de perfil
- `createdAt: Date` - Data de criação
- `updatedAt: Date` - Data de atualização

#### Goals Schema

**Campos:**
- `id: ID` - Identificador único do goal
- `name: String` - Nome do goal
- `description: String` - Descrição do goal
- `tasks: [Task]` - Lista de tarefas
  - `name: String` - Nome da tarefa
  - `link: String` - Link relacionado
  - `completed: Boolean` - Se está completa
  - `completedAt: Date` - Data de conclusão
- `user: User` - Usuário dono do goal
- `createdAt: Date` - Data de criação
- `updatedAt: Date` - Data de atualização

## 📝 Queries e Mutations

### User Queries

```graphql
# Obter usuário atual
query Me {
  me {
    id
    name
    email
    goal
    profileImageUrl
  }
}

# Obter usuário por email
query User($email: String!) {
  user(email: $email) {
    id
    name
    email
  }
}

# Obter presigned URL para upload de imagem
query GetPresignedUrl($type: String!) {
  getPresignedUrl(type: $type) {
    uploadUrl
    publicUrl
  }
}

# Obter todos os usuários (admin apenas)
query AdminGetUsers {
  adminGetUsers {
    id
    name
    email
    isAdmin
    blocked
  }
}

# Contar usuários (admin apenas)
query AdminCountUsers {
  adminCountUsers
}

# Obter usuário por ID (admin apenas)
query AdminGetUser($id: ID!) {
  adminGetUser(id: $id) {
    id
    name
    email
    isAdmin
    blocked
  }
}

# Obter sumário de usuários (admin apenas)
query AdminGetUserSummary($userSummaryInput: UserSummaryInput!) {
  adminGetUserSummary(userSummaryInput: $userSummaryInput) {
    labels
    data
  }
}
```

### User Mutations

```graphql
# Criar usuário (signup)
mutation SignUp($createUserData: CreateUserDto!) {
  signUp(createUserData: $createUserData) {
    id
    name
    email
    goal
  }
}

# Atualizar usuário atual
mutation UpdateMe($userData: UpdateUserDto!) {
  updateMe(userData: $userData) {
    id
    name
    email
    profileImageUrl
  }
}

# Login
mutation Login($userLoginData: LoggedUserDto!) {
  login(userLoginData: $userLoginData) {
    token
  }
}

# Resetar senha
mutation ResetPassword($email: String!) {
  resetPassword(email: $email)
}

# Editar usuário (admin apenas)
mutation AdminEditUser($userData: AdminEditUserDto!, $userId: ID!) {
  adminEditUser(userData: $userData, userId: $userId) {
    id
    isAdmin
    blocked
  }
}
```

### Goals Queries

```graphql
# Obter goals do usuário atual
query MyGoals {
  myGoals {
    id
    name
    description
    tasks {
      name
      link
      completed
      completedAt
    }
  }
}

# Obter sumário de goals (admin apenas)
query AdminGetGoalSummary($goalSummaryInput: GoalSummaryInput!) {
  adminGetGoalSummary(goalSummaryInput: $goalSummaryInput) {
    labels
    data
  }
}

# Contar goals (admin apenas)
query AdminCountGoals {
  adminCountGoals
}

# Obter porcentagem de goals completados (admin apenas)
query AdminGetPercentageOfCompletedGoals {
  adminGetPercentageOfCompletedGoals
}
```

### Goals Mutations

```graphql
# Salvar/Atualizar goal
mutation SaveGoal($saveGoalDto: SaveGoalDto!, $id: ID) {
  saveGoal(saveGoalDto: $saveGoalDto, id: $id) {
    id
    name
    description
    tasks {
      name
      link
      completed
    }
  }
}

# Deletar goal
mutation DeleteGoal($id: ID!) {
  deleteGoal(id: $id)
}

# Alternar status de tarefa
mutation ToggleTask($goalId: ID!, $taskId: Int!) {
  toggleTask(goalId: $goalId, taskId: $taskId) {
    goalId
    taskId
    completed
  }
}
```

## 🔐 Autenticação e Autorização

O serviço utiliza headers HTTP para autenticação:

```http
user-id: <user-id>
is-admin: true/false
from: <origin>
```

### Contexto

- `userId` - ID do usuário atual (ObjectId)
- `isAdmin` - Se o usuário é administrador
- `from` - Origem da requisição (ex: "admin", "client")

### Autenticação JWT

Ao fazer login, o usuário recebe um token JWT que deve ser incluído nos headers subsequentes:

```http
Authorization: Bearer <token>
```

## 🔔 Funcionalidades

### Gerenciamento de Usuários

- **Cadastro**: Usuários podem se cadastrar com nome, email e senha
- **Autenticação**: Login com JWT e verificação de credenciais
- **Perfil**: Upload de imagem de perfil via AWS S3
- **Recuperação de Senha**: Reset de senha via email
- **Controle de Acesso**: Sistema de admin e bloqueio de usuários

### Gerenciamento de Goals

- **CRUD**: Criar, ler, atualizar e deletar goals
- **Tarefas**: Cada goal pode ter múltiplas tarefas
- **Status**: Rastreamento de conclusão de tarefas
- **Analytics**: Estatísticas para administradores

### Upload de Imagens

O serviço gera presigned URLs para upload direto no AWS S3:
- Formatos aceitos: JPEG, PNG, JPG
- Expiração: 5 minutos
- Armazenamento: Bucket configurado no AWS

### Recuperação de Senha

- Geração de senha aleatória segura
- Envio por email via Nodemailer
- Hash com bcrypt
- Rollback em caso de erro no envio

## 🏗️ Arquitetura

### User Management

- **Criação**: Validação de email único e hash de senha
- **Autenticação**: Login com JWT e verificação de bloqueio
- **Edição**: Atualização de perfil com validação
- **Admin**: Controle administrativo de usuários

### Goals Management

- **Criação**: Goals associados a usuários
- **Tarefas**: Sistema de tarefas com status
- **Completude**: Rastreamento de conclusão
- **Analytics**: Agregações para dashboard

### Federation

O serviço atua como um subgraph no Apollo Federation:
- Usuários podem ser referenciados por outros serviços
- `@key(fields: "id")` permite resolução de referências
- Integração com outros microserviços

## 🧪 Testes

```bash
# Executar testes unitários
npm run test

# Executar testes com coverage
npm run test:cov

# Executar testes em modo watch
npm run test:watch

# Executar testes e2e
npm run test:e2e
```

## 📊 Scripts NPM

- `npm run start` - Iniciar em modo produção
- `npm run start:dev` - Iniciar em modo desenvolvimento
- `npm run start:debug` - Iniciar em modo debug
- `npm run build` - Compilar o projeto
- `npm run format` - Formatar código com Prettier
- `npm run lint` - Executar ESLint

## 🐳 Docker

### Construir a imagem

```bash
docker build -t user-service .
```

### Executar com Docker Compose

```bash
docker-compose up -d
```

O serviço estará disponível em `http://localhost:3000` e o banco de dados MongoDB em `http://localhost:27017`.

## 🔧 Configuração de Banco de Dados

### MongoDB

O serviço usa MongoDB para persistência. Configure a string de conexão:

```env
MONGO_URI=mongodb://username:password@host:port/database
```

### Schema do Banco

**Collection: users**
```typescript
{
  name: string;
  email: string;
  password: string; // hashed with bcrypt
  goal: UserGoal;
  isAdmin: boolean;
  blocked: boolean;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Collection: goals**
```typescript
{
  name: string;
  description?: string;
  tasks: [{
    name: string;
    link?: string;
    completed: boolean;
    completedAt?: Date;
  }];
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Obrigatório | Padrão |
|----------|-----------|-------------|--------|
| `PORT` | Porta do servidor | Não | 3000 |
| `MONGO_URI` | URI de conexão MongoDB | Sim | - |
| `MONGO_USERNAME` | Usuário MongoDB | Sim | - |
| `MONGO_PASSWORD` | Senha MongoDB | Sim | - |
| `MONGO_HOST` | Host MongoDB | Sim | localhost |
| `MONGO_PORT` | Porta MongoDB | Sim | 27017 |
| `MONGO_DB` | Nome do banco | Sim | user_db |
| `JWT_SECRET` | Chave secreta JWT | Sim | - |
| `AWS_ACCESS_KEY_ID` | AWS Access Key | Sim | - |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | Sim | - |
| `AWS_REGION` | Região AWS | Sim | us-east-1 |
| `AWS_S3_BUCKET_NAME` | Nome do bucket S3 | Sim | - |
| `EMAIL_USERNAME` | Email para SMTP | Sim | - |
| `EMAIL_PASSWORD` | Senha do email | Sim | - |

## 📝 Licença

UNLICENSED

## 👤 Autor

Glasser Study Team

## 🔗 Referências

- [NestJS Documentation](https://docs.nestjs.com/)
- [Apollo Federation](https://www.apollographql.com/docs/federation/)
- [GraphQL](https://graphql.org/)
- [MongoDB](https://www.mongodb.com/)
