# Post Service

Serviço de posts, comentários e curtidas para o Glasser Study Platform.

## 📋 Descrição

Este serviço é responsável por gerenciar posts, comentários e curtidas na plataforma Glasser Study. Ele utiliza GraphQL com Apollo Federation para se integrar com outros serviços do sistema e envia notificações via RabbitMQ.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **GraphQL** - Query language e runtime
- **Apollo Federation** - Federated GraphQL schema
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **RabbitMQ** - Sistema de mensageria para notificações

## 📦 Estrutura do Projeto

```
post-service/
├── src/
│   ├── app.module.ts              # Módulo principal da aplicação
│   ├── app.controller.ts          # Controller de health check
│   ├── main.ts                    # Arquivo de entrada da aplicação
│   ├── post/                      # Módulo de posts
│   │   ├── models/
│   │   │   └── post.model.ts      # Modelo de dados do post
│   │   ├── dto/
│   │   │   ├── save-post.dto.ts
│   │   │   └── post-summary.dto.ts
│   │   ├── post.service.ts        # Lógica de negócio
│   │   ├── post.resolver.ts       # Resolvers GraphQL
│   │   └── post.module.ts
│   ├── comment/                   # Módulo de comentários
│   │   ├── models/
│   │   │   └── comment.model.ts
│   │   ├── dto/
│   │   │   └── create-comment.dto.ts
│   │   ├── comment.service.ts
│   │   ├── comment.resolver.ts
│   │   └── comment.module.ts
│   └── like/                       # Módulo de curtidas
│       ├── models/
│       │   └── like.model.ts
│       ├── dto/
│       │   └── create-like.dto.ts
│       ├── like.service.ts
│       ├── like.resolver.ts
│       └── like.module.ts
├── docker-compose.yml             # Configuração Docker
├── Dockerfile                     # Imagem Docker
└── package.json
```

## 🛠️ Instalação

### Pré-requisitos

- Node.js (v18 ou superior)
- MongoDB
- RabbitMQ
- Docker (opcional)

### Configuração

1. Clone o repositório

```bash
cd post-service
```

2. Instale as dependências

```bash
npm install
```

3. Configure as variáveis de ambiente (crie um arquivo `.env`):

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/post-service
MONGO_USERNAME=admin
MONGO_PASSWORD=admin
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=post-service
RABBITMQ_URI=amqp://guest:guest@localhost:5672
```

## 🚀 Executando o Serviço

### Desenvolvimento

```bash
npm run start:dev
```

O serviço estará disponível em `http://localhost:3001`

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
- **URL**: `http://localhost:3001/`
- **Health Check**: `http://localhost:3001/health`

### Schema

#### Post Schema

**Campos:**
- `id: ID` - Identificador único do post
- `title: String` - Título do post
- `subject: String` - Assunto do post
- `description: String` - Descrição do post
- `tags: [String]` - Tags do post
- `materials: [Material]` - Materiais associados
- `author: User` - Autor do post
- `likesCount: Int` - Número de curtidas
- `commentsCount: Int` - Número de comentários
- `isAuthor: Boolean` - Se o usuário atual é autor
- `isDeleted: Boolean` - Se foi deletado
- `createdAt: Date` - Data de criação
- `updatedAt: Date` - Data de atualização

**Material:**
- `name: String` - Nome do material
- `link: String` - Link do material
- `type: MaterialType` - Tipo do material

**Enums:**
- `MaterialType`: READ, LISTEN, WATCH, WATCH_AND_LISTEN, DISCUSS, PRACTICE, TEACHING

#### Comment Schema

**Campos:**
- `id: ID` - Identificador único
- `author: User` - Autor do comentário
- `post: Post` - Post do comentário
- `content: String` - Conteúdo do comentário
- `isAuthor: Boolean` - Se o usuário atual é autor
- `createdAt: Date` - Data de criação
- `updatedAt: Date` - Data de atualização

#### Like Schema

**Campos:**
- `id: ID` - Identificador único
- `user: User` - Usuário que curtiu
- `post: Post` - Post curtido
- `createdAt: Date` - Data de criação
- `updatedAt: Date` - Data de atualização

## 📝 Queries e Mutations

### Post Queries

```graphql
# Obter todos os posts
query Posts($searchTerm: String, $searchFilter: String, $subject: String, $materialType: String) {
  posts(
    searchTerm: $searchTerm
    searchFilter: $searchFilter
    subject: $subject
    materialType: $materialType
  ) {
    id
    title
    subject
    description
    tags
    author {
      id
    }
    likesCount
    commentsCount
    createdAt
  }
}

# Obter um post por ID
query Post($id: ID!) {
  post(id: $id) {
    id
    title
    subject
    description
    tags
    materials {
      name
      link
      type
    }
    author {
      id
    }
    likesCount
    commentsCount
    createdAt
  }
}

# Obter posts do usuário atual
query MyPosts {
  myPosts {
    id
    title
    subject
    description
    tags
    materials {
      name
      link
      type
    }
    createdAt
  }
}

# Obter resumo de posts (apenas admin)
query AdminGetPostSummary($postSummaryInput: PostSummaryInput!) {
  adminGetPostSummary(postSummaryInput: $postSummaryInput) {
    labels
    data
  }
}

# Obter todos os posts (apenas admin)
query AdminGetPosts {
  adminGetPosts {
    id
    title
    subject
    description
    author {
      id
    }
    createdAt
  }
}

# Contar posts (apenas admin)
query AdminCountPosts {
  adminCountPosts
}

# Obter post por ID (apenas admin)
query AdminGetPost($id: ID!) {
  adminGetPost(id: $id) {
    id
    title
    subject
    description
    createdAt
  }
}
```

### Post Mutations

```graphql
# Criar/Atualizar post
mutation SavePost($savePostInput: SavePostDto!, $id: ID) {
  savePost(savePostInput: $savePostInput, id: $id) {
    id
    title
    subject
    description
    tags
    materials {
      name
      link
      type
    }
    createdAt
  }
}

# Remover post
mutation RemovePost($id: ID!) {
  removePost(id: $id) {
    id
  }
}

# Deletar post (apenas admin)
mutation AdminDeletePost($id: ID!) {
  adminDeletePost(id: $id) {
    id
  }
}
```

### Comment Queries

```graphql
# Obter comentários de um post
query GetComments($postId: String!) {
  getComments(postId: $postId) {
    id
    content
    author {
      id
    }
    isAuthor
    createdAt
  }
}
```

### Comment Mutations

```graphql
# Criar comentário
mutation CreateComment($input: CreateCommentDto!) {
  createComment(input: $input) {
    id
    content
    author {
      id
    }
    createdAt
  }
}

# Deletar comentário
mutation DeleteComment($commentId: String!) {
  deleteComment(commentId: $commentId)
}
```

### Like Mutations

```graphql
# Toggle curtida
mutation ToggleLike($input: CreateLikeDto!) {
  toggleLike(input: $input) {
    id
    user {
      id
    }
    createdAt
  }
}

# Obter curtidas de um post
query GetLikes($postId: String!) {
  getLikes(postId: $postId) {
    id
    user {
      id
    }
    createdAt
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

## 🔔 Integração com RabbitMQ

O serviço publica notificações no RabbitMQ quando:

1. **Novo comentário** - Notifica o autor do post
2. **Nova curtida** - Notifica o autor do post

**Exchange**: `notifications_exchange`  
**Routing Key**: `notification.created`

**Formato da notificação:**
```json
{
  "userId": "user-id",
  "message": "NEW_COMMENT" | "NEW_LIKE",
  "type": "info"
}
```

## 🏗️ Arquitetura

### Post Management

- **Criação**: Usuários autenticados podem criar posts
- **Materiais**: Posts podem incluir materiais de estudo
- **Busca**: Suporta busca por título, descrição, tags, assunto e tipo de material
- **Soft Delete**: Posts são marcados como deletados, não removidos
- **Resumo**: Agregação de posts por período para dashboard admin

### Comment Management

- **Criação**: Usuários autenticados podem comentar
- **Notificações**: Autores são notificados quando recebem comentários
- **Contador**: Atualização automática do contador de comentários

### Like Management

- **Toggle**: Sistema de curtir/descurtir
- **Notificações**: Autores são notificados quando recebem curtidas
- **Contador**: Atualização automática do contador de curtidas

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
docker build -t post-service .
```

### Executar com Docker Compose

```bash
docker-compose up -d
```

O serviço estará disponível em `http://localhost:3001` e o banco de dados MongoDB em `http://localhost:27017`.

## 🔧 Configuração de Banco de Dados

### MongoDB

O serviço usa MongoDB para persistência. Configure a string de conexão:

```env
MONGO_URI=mongodb://username:password@host:port/database
```

### Schema do Banco

**Collection: posts**
```typescript
{
  title: string;
  subject: string;
  description: string;
  tags: string[];
  materials: [{
    name: string;
    link: string;
    type: MaterialType;
  }];
  author: ObjectId;
  likesCount: number;
  commentsCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Collection: comments**
```typescript
{
  author: ObjectId;
  post: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Collection: likes**
```typescript
{
  user: ObjectId;
  post: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## 📈 Performance

- **Índices**: Criados para buscas eficientes
- **Agregação**: Pipeline de agregação otimizado para resumo de posts
- **Soft Delete**: Consultas filtram automaticamente posts deletados
- **Contadores**: Atualização automática de contadores (likes/comments)

## 🛡️ Segurança

- **Autenticação**: Validação de usuário autenticado para mutações
- **Autorização**: Usuários só podem editar/deletar seus próprios posts
- **Admin Check**: Endpoints admin verificam origem e permissões
- **Input Validation**: DTOs validam dados de entrada

## 📝 Licença

UNLICENSED

## 👤 Autor

Glasser Study Team
