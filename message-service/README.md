# Message Service

Serviço de mensagens e chats para o Glasser Study Platform.

## 📋 Descrição

Este serviço é responsável por gerenciar chats e mensagens na plataforma Glasser Study. Ele utiliza GraphQL com Apollo Federation para se integrar com outros serviços do sistema.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **GraphQL** - Query language e runtime
- **Apollo Federation** - Federated GraphQL schema
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **RabbitMQ** - Sistema de mensageria para notificações

## 📦 Estrutura do Projeto

```
message-service/
├── src/
│   ├── app.module.ts          # Módulo principal da aplicação
│   ├── app.controller.ts      # Controller de health check
│   ├── main.ts                # Arquivo de entrada da aplicação
│   ├── chat/                  # Módulo de chats
│   │   ├── models/
│   │   │   └── chat.model.ts  # Modelo de dados do chat
│   │   ├── dto/
│   │   │   └── create-chat.dto.ts
│   │   ├── chat.service.ts    # Lógica de negócio
│   │   ├── chat.resolver.ts   # Resolvers GraphQL
│   │   └── chat.module.ts
│   └── message/               # Módulo de mensagens
│       ├── models/
│       │   └── message.model.ts
│       ├── dto/
│       │   ├── save-message.dto.ts
│       │   └── query-messages.dto.ts
│       ├── message.service.ts
│       ├── message.resolver.ts
│       └── message.module.ts
├── docker-compose.yml         # Configuração Docker
├── Dockerfile                 # Imagem Docker
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
cd message-service
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente (crie um arquivo `.env`):
```env
PORT=3002
MONGO_URI=mongodb://localhost:27017/message_db
MONGO_USERNAME=admin
MONGO_PASSWORD=admin
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=message_db
```

## 🚀 Executando o Serviço

### Desenvolvimento

```bash
npm run start:dev
```

O serviço estará disponível em `http://localhost:3002`

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
- **URL**: `http://localhost:3002/`
- **Health Check**: `http://localhost:3002/health`

### Schema

#### Chat Schema

**Campos:**
- `id: ID` - Identificador único do chat
- `name: String` - Nome do chat
- `description: String` - Descrição do chat
- `members: [Member]` - Lista de membros
- `isModerator: Boolean` - Se o usuário atual é moderador
- `isInvited: Boolean` - Se o usuário atual está convidado
- `hasRead: Boolean` - Se o usuário atual leu as mensagens
- `createdAt: Date` - Data de criação
- `updatedAt: Date` - Data de atualização

#### Message Schema

**Campos:**
- `id: ID` - Identificador único da mensagem
- `senderId: ID` - ID do remetente
- `chatId: ID` - ID do chat
- `content: String` - Conteúdo da mensagem
- `isRead: Boolean` - Se foi lida
- `sender: User` - Remetente da mensagem
- `chat: Chat` - Chat da mensagem
- `isCurrentUser: Boolean` - Se o usuário atual enviou
- `createdAt: Date` - Data de criação
- `updatedAt: Date` - Data de atualização

## 📝 Queries e Mutations

### Chat Queries

```graphql
# Obter chats do usuário atual
query MyChats($search: String) {
  myChats(search: $search) {
    id
    name
    description
    members {
      user {
        id
      }
      isInvited
      isModerator
    }
  }
}

# Obter todos os chats (apenas admin)
query AdminGetChats {
  adminGetChats {
    id
    name
    description
  }
}

# Contar chats (apenas admin)
query AdminCountChats {
  adminCountChats
}

# Obter chat por ID (apenas admin)
query AdminGetChat($id: String!) {
  adminGetChat(id: $id) {
    id
    name
    description
  }
}
```

### Chat Mutations

```graphql
# Criar/Atualizar chat
mutation SaveChat($saveChatData: CreateChatDto!, $id: String) {
  saveChat(saveChatDto: $saveChatData, id: $id) {
    id
    name
    description
  }
}

# Remover chat
mutation RemoveChat($id: String!) {
  removeChat(id: $id) {
    id
  }
}

# Aceitar/Rejeitar convite
mutation ManageInvitation($id: String!, $accept: Boolean!) {
  manageInvitation(id: $id, accept: $accept)
}

# Sair do chat
mutation ExitChat($id: String!) {
  exitChat(id: $id)
}
```

### Message Queries

```graphql
# Obter mensagens de um chat
query ChatMessages($chatId: ID!) {
  chatMessages(chatId: $chatId) {
    id
    content
    sender {
      id
    }
    chat {
      id
    }
    isRead
    createdAt
  }
}

# Obter mensagens do usuário
query MyMessages {
  myMessages {
    id
    content
    sender {
      id
    }
  }
}

# Obter conversa entre usuários
query Conversation($otherUserId: ID!) {
  conversation(otherUserId: $otherUserId) {
    id
    content
    sender {
      id
    }
    createdAt
  }
}

# Obter todas as mensagens (apenas admin)
query AdminGetMessages($queryMessagesInput: QueryMessagesInput!) {
  adminGetMessages(queryMessagesInput: $queryMessagesInput) {
    id
    content
    sender {
      id
    }
    chat {
      id
    }
  }
}

# Contar mensagens (apenas admin)
query AdminCountMessages($queryMessagesInput: QueryMessagesInput!) {
  adminCountMessages(queryMessagesInput: $queryMessagesInput)
}
```

### Message Mutations

```graphql
# Enviar mensagem
mutation SaveMessage($saveMessageInput: SaveMessageDto!, $id: ID) {
  saveMessage(saveMessageInput: $saveMessageInput, id: $id) {
    id
    content
    chat {
      id
    }
    createdAt
  }
}

# Marcar mensagem como lida
mutation MarkMessageAsRead($id: ID!) {
  markMessageAsRead(id: $id) {
    id
    isRead
  }
}

# Remover mensagem
mutation RemoveMessage($id: ID!) {
  removeMessage(id: $id) {
    id
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

1. **Novo chat criado** - Notifica todos os membros convidados
2. **Mensagem enviada** - Notifica membros do chat (exceto o remetente)

**Exchange**: `notifications_exchange`
**Routing Key**: `notification.created`

**Formato da notificação:**
```json
{
  "userId": "user-id",
  "message": "NEW_CHAT" | "NEW_MESSAGE",
  "type": "info"
}
```

## 🏗️ Arquitetura

### Chat Management

- **Criação**: Apenas usuários autenticados podem criar chats
- **Convites**: Membros podem ser convidados para chats
- **Moderação**: O criador é automaticamente o moderador
- **Leitura**: Sistema rastreia se membros leram as mensagens

### Message Management

- **Envio**: Apenas membros do chat podem enviar mensagens
- **Leitura**: Sistema atualiza status de leitura automaticamente
- **Notificações**: Membros são notificados via RabbitMQ
- **Histórico**: Mensagens são armazenadas com timestamps

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
docker build -t message-service .
```

### Executar com Docker Compose

```bash
docker-compose up -d
```

O serviço estará disponível em `http://localhost:3002` e o banco de dados PostgreSQL em `http://localhost:5433`.

**Nota**: A configuração atual do `docker-compose.yml` usa PostgreSQL, mas o serviço foi desenvolvido para MongoDB. Certifique-se de ajustar a configuração conforme necessário.

## 🔧 Configuração de Banco de Dados

### MongoDB

O serviço usa MongoDB para persistência. Configure a string de conexão:

```env
MONGO_URI=mongodb://username:password@host:port/database
```

### Schema do Banco

**Collection: chats**
```typescript
{
  name: string;
  description: string;
  moderator: ObjectId;
  members: [{
    user: ObjectId;
    hasRead: boolean;
  }];
  invitedMembers: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Collection: messages**
```typescript
{
  senderId: ObjectId;
  chatId: ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 📝 Licença

UNLICENSED

## 👤 Autor

Glasser Study Team

