# Notification Service

Serviço de notificações em tempo real para o Glasser Study Platform.

## 📋 Descrição

Este serviço é responsável por gerenciar notificações do usuário na plataforma Glasser Study. Ele consome mensagens do RabbitMQ e distribui notificações em tempo real via GraphQL Subscriptions.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **GraphQL** - Query language e runtime
- **GraphQL Subscriptions** - Notificações em tempo real
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **RabbitMQ** - Sistema de mensageria
- **JWT** - Autenticação

## 📦 Estrutura do Projeto

```
notification-service/
├── src/
│   ├── app.module.ts              # Módulo principal da aplicação
│   ├── app.controller.ts          # Controller de health check
│   ├── main.ts                    # Arquivo de entrada da aplicação
│   └── notification/              # Módulo de notificações
│       ├── models/
│       │   └── notification.model.ts  # Modelo de dados
│       ├── notification.service.ts     # Lógica de negócio
│       ├── notification.resolver.ts    # Resolvers GraphQL
│       ├── notification.module.ts
│       └── pub-sub.provider.ts         # Provider de PubSub
├── package.json
└── README.md
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
cd notification-service
```

2. Instale as dependências

```bash
npm install
```

3. Configure as variáveis de ambiente (crie um arquivo `.env`):

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/notification_db
MONGO_USERNAME=admin
MONGO_PASSWORD=admin
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=notification_db
JWT_SECRET=your-secret-key
RABBITMQ_URI=amqp://guest:guest@localhost:5672
```

## 🚀 Executando o Serviço

### Desenvolvimento

```bash
npm run start:dev
```

O serviço estará disponível em `http://localhost:4000`

### Produção

```bash
npm run build
npm run start:prod
```

## 📡 GraphQL API

### Endpoint

O serviço expõe uma API GraphQL em:

- **URL**: `http://localhost:4000/`
- **Health Check**: `http://localhost:4000/health`

### Schema

#### Notification Schema

**Campos:**

- `id: ID` - Identificador único
- `userId: ID` - ID do usuário
- `message: Message` - Tipo de mensagem (NEW_MESSAGE, NEW_CHAT, NEW_COMMENT, NEW_LIKE)
- `type: Type` - Tipo de notificação (info, warning, error, success)
- `read: Boolean` - Se foi lida
- `createdAt: Date` - Data de criação
- `updatedAt: Date` - Data de atualização

**Enums:**

- `Type`: INFO, WARNING, ERROR, SUCCESS
- `Message`: NEW_MESSAGE, NEW_CHAT, NEW_COMMENT, NEW_LIKE

## 📝 Queries, Mutations e Subscriptions

### Subscriptions

```graphql
# Receber notificações em tempo real
subscription NewNotification {
  newNotification {
    id
    userId
    message
    type
    read
    createdAt
  }
}
```

### Queries

```graphql
# Obter notificações do usuário
query MyNotifications($limit: Int) {
  myNotifications(limit: $limit) {
    id
    message
    type
    read
    createdAt
  }
}

# Contar notificações não lidas
query CountUnreadNotifications {
  countMyUnreadNotifications
}
```

### Mutations

```graphql
# Marcar notificação como lida
mutation MarkNotificationAsRead($id: String!) {
  markNotificationAsRead(id: $id) {
    id
    read
  }
}

# Marcar todas as notificações como lidas
mutation MarkAllNotificationsAsRead {
  markAllNotificationsAsRead
}
```

## 🔐 Autenticação

O serviço utiliza JWT para autenticação. Inclua o token no header:

```http
Authorization: <jwt-token>
```

O token deve ser válido e conter:

```json
{
  "user": {
    "id": "user-id"
  }
}
```

## 🔔 Integração com RabbitMQ

O serviço consome mensagens do RabbitMQ para criar notificações:

**Exchange**: `notifications_exchange`  
**Routing Key**: `notification.created`  
**Queue**: `notifications_queue`

**Formato da mensagem:**

```json
{
  "id": "unique-id",
  "userId": "user-id",
  "message": "NEW_MESSAGE",
  "type": "info"
}
```

**Tipos de mensagem:**

- `NEW_MESSAGE` - Nova mensagem no chat
- `NEW_CHAT` - Novo chat criado
- `NEW_COMMENT` - Novo comentário no post
- `NEW_LIKE` - Nova curtida no post

## 🏗️ Arquitetura

### Notification Flow

1. **Consumo**: RabbitMQ envia notificação para a fila
2. **Persistência**: Notificação é salva no MongoDB
3. **Distribuição**: Notificação é publicada via PubSub
4. **Subscription**: Clientes conectados recebem a notificação em tempo real

### Gestão de Estado

- **Status de leitura**: Notificações são marcadas como lidas individualmente ou em massa
- **Filtragem**: Notificações são filtradas por usuário usando o contexto de autenticação
- **Limite**: Queries suportam limite de resultados para paginação

## 🔄 WebSocket Subscriptions

O serviço utiliza WebSocket (graphql-ws) para subscriptions em tempo real:

```typescript
// Conexão WebSocket
const wsClient = createClient({
  url: 'ws://localhost:4000',
  connectionParams: {
    Authorization: 'your-jwt-token',
  },
});
```

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

## 🔧 Configuração de Banco de Dados

### MongoDB

O serviço usa MongoDB para persistência. Configure a string de conexão:

```env
MONGO_URI=mongodb://username:password@host:port/database
```

### Schema do Banco

**Collection: notifications**

```typescript
{
  userId: string; // ID do usuário (required)
  message: Message; // Tipo de mensagem (required)
  type: Type; // Tipo de notificação (required)
  read: boolean; // Status de leitura (default: false)
  createdAt: Date; // Data de criação
  updatedAt: Date; // Data de atualização
}
```

**Indexes:**

- `userId + _id` (unique)

## 🔧 Configuração RabbitMQ

O serviço precisa de uma conexão RabbitMQ configurada:

```env
RABBITMQ_URI=amqp://guest:guest@localhost:5672
```

**Exchange Configuration:**

- Nome: `notifications_exchange`
- Tipo: `topic`

## 📈 Performance

- **Subscriptions**: Utiliza PubSub in-memory para baixa latência
- **Queries**: Índice em userId para consultas rápidas
- **Real-time**: WebSocket para distribuição eficiente de notificações

## 🛡️ Segurança

- **JWT Authentication**: Token obrigatório nas requisições
- **User Isolation**: Notificações filtradas automaticamente por usuário
- **Subscription Filtering**: Apenas o usuário correto recebe notificações

## 📝 Licença

UNLICENSED

## 👤 Autor

Glasser Study Team
