# Glasser Study Platform - Backend Services

Plataforma de estudo colaborativo com arquitetura de microserviços baseada em GraphQL Federation.

## 📋 Visão Geral

O Glasser Study é uma plataforma educacional composta por múltiplos microserviços que trabalham em conjunto através de **GraphQL Federation** e **Apollo Gateway**. O sistema permite que usuários compartilhem materiais de estudo, interajam através de posts, comentários, chats e notificações em tempo real.

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      Router (API Gateway)                   │
│                    Port: 3000 (Gateway)                      │
│              JWT Auth | Context Propagation                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼────┐    ┌─────▼─────┐   ┌─────▼─────┐
   │ Client  │    │   Admin   │   │ External │
   │  App    │    │   App     │   │  Clients │
   └─────────┘    └───────────┘   └──────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼─────┐     ┌─────▼────┐    ┌──────▼─────┐
   │ RabbitMQ │     │ MongoDB  │    │   AWS S3   │
   │ Message  │     │ Database │    │  Storage  │
   │  Broker  │     │          │    │  Images   │
   └──────────┘     └──────────┘    └───────────┘
```

## 📦 Microserviços

### 1. 🔐 User Service (Porta 4000)
**Responsabilidade**: Gerenciamento de usuários, autenticação e goals.

**Funcionalidades**:
- Cadastro e login com JWT
- Upload de imagens de perfil via AWS S3
- Recuperação de senha por email
- Gerenciamento de goals e tarefas
- Controle de acesso (admin/usuário)

**Tecnologias**: NestJS, GraphQL, JWT, bcrypt, AWS S3, Nodemailer

---

### 2. 📝 Post Service (Porta 4001)
**Responsabilidade**: Gerenciamento de posts, comentários e curtidas.

**Funcionalidades**:
- CRUD de posts com materiais de estudo
- Sistema de comentários
- Sistema de curtidas (toggle)
- Busca avançada por título, tags, assunto, tipo de material
- Notificações via RabbitMQ (novo comentário/curtida)

**Tecnologias**: NestJS, GraphQL, MongoDB, RabbitMQ

---

### 3. 💬 Message Service (Porta 4002)
**Responsabilidade**: Gerenciamento de chats e mensagens.

**Funcionalidades**:
- Criação e gerenciamento de chats em grupo
- Sistema de convites e aceitação
- Envio de mensagens em tempo real
- Rastreamento de leitura
- Notificações via RabbitMQ (nova mensagem/chat)

**Tecnologias**: NestJS, GraphQL, MongoDB, RabbitMQ

---

### 4. 🔔 Notification Service (Porta 4000)
**Responsabilidade**: Notificações em tempo real via GraphQL Subscriptions.

**Funcionalidades**:
- Consumo de mensagens do RabbitMQ
- Distribuição de notificações em tempo real
- Status de leitura
- WebSocket subscriptions

**Tecnologias**: NestJS, GraphQL Subscriptions, MongoDB, RabbitMQ, WebSocket

**Tipos de Notificação**:
- `NEW_MESSAGE` - Nova mensagem no chat
- `NEW_CHAT` - Novo chat criado
- `NEW_COMMENT` - Novo comentário no post
- `NEW_LIKE` - Nova curtida no post

---

### 5. 🚨 Report Service (Porta 4005)
**Responsabilidade**: Sistema de denúncias e moderação.

**Funcionalidades**:
- Criação de denúncias
- Status de denúncia (PENDING, RESOLVED, REJECTED)
- Resolução de denúncias (apenas admin)
- Relatórios para administradores

**Tecnologias**: NestJS, GraphQL, MongoDB

---

### 6. 🌐 Router Service (Porta 3000)
**Responsabilidade**: API Gateway federado que orquestra todos os serviços.

**Funcionalidades**:
- Apollo Federation Gateway
- Autenticação JWT centralizada
- Propagação de contexto (userId, isAdmin, origin)
- CORS para múltiplos clients
- Health check de serviços

**Tecnologias**: NestJS, Apollo Gateway, JWT

---

## 🔄 Fluxo de Comunicação

### 1. Autenticação
```
Client → Router (JWT verification) → User Service → JWT Token
```

### 2. Notificações em Tempo Real
```
Post/Comment/Like Action 
  → RabbitMQ Message 
    → Notification Service 
      → GraphQL Subscription 
        → Client
```

### 3. Propagação de Contexto
```
Client Request
  → Router (extract JWT)
    → Adds headers: user-id, is-admin, from
      → Forwards to appropriate service
```

## 🛠️ Tecnologias Principais

### Backend
- **NestJS** - Framework Node.js
- **GraphQL** - Query language e runtime
- **Apollo Federation** - Federated GraphQL
- **MongoDB** - Banco de dados NoSQL
- **RabbitMQ** - Message broker para notificações
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **AWS S3** - Armazenamento de imagens
- **Nodemailer** - Envio de emails

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 📦 Instalação e Configuração

### Pré-requisitos

- Node.js (v18 ou superior)
- Docker e Docker Compose
- MongoDB
- RabbitMQ
- AWS S3 (para upload de imagens)

### Configuração Inicial

1. **Clone o repositório**
```bash
cd glasser-study-back
```

2. **Configure as variáveis de ambiente**

Crie um arquivo `.env` em cada serviço com as configurações necessárias:

**Router Service**:
```env
PORT=3000
JWT_SECRET=your-secret-key
MONGO_PORT=27017
MONGO_USERNAME=admin
MONGO_PASSWORD=admin
```

**User Service**:
```env
PORT=4000
MONGO_URI=mongodb://admin:admin@localhost:27017/user_db?authSource=admin
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET_NAME=your-bucket
EMAIL_USERNAME=your-email
EMAIL_PASSWORD=your-password
```

**Post Service**:
```env
PORT=4001
MONGO_URI=mongodb://admin:admin@localhost:27017/post_db?authSource=admin
RABBITMQ_URI=amqp://guest:guest@localhost:5672
```

**Message Service**:
```env
PORT=4002
MONGO_URI=mongodb://admin:admin@localhost:27017/message_db?authSource=admin
RABBITMQ_URI=amqp://guest:guest@localhost:5672
```

**Notification Service**:
```env
PORT=4000
MONGO_URI=mongodb://admin:admin@localhost:27017/notification_db?authSource=admin
JWT_SECRET=your-secret-key
RABBITMQ_URI=amqp://guest:guest@localhost:5672
```

**Report Service**:
```env
PORT=4005
MONGO_URI=mongodb://admin:admin@localhost:27017/report_db?authSource=admin
```

3. **Instale as dependências de cada serviço**
```bash
cd user-service && npm install
cd post-service && npm install
cd message-service && npm install
cd notification-service && npm install
cd report-service && npm install
cd router && npm install
```

## 🚀 Executando o Sistema

### Opção 1: Execução Manual

1. **Inicie a infraestrutura**:
```bash
cd router
node start-containers.js
```

2. **Inicie cada serviço em terminais separados**:
```bash
# Terminal 1
cd user-service
npm run start:dev

# Terminal 2
cd post-service
npm run start:dev

# Terminal 3
cd message-service
npm run start:dev

# Terminal 4
cd notification-service
npm run start:dev

# Terminal 5
cd report-service
npm run start:dev

# Terminal 6
cd router
npm run start:dev
```

### Opção 2: Docker Compose (Recomendado)

```bash
# Na raiz do projeto backend
docker-compose up -d
```

## 🔍 Verificação de Saúde

Verifique se todos os serviços estão rodando:

```bash
cd router
node check-services.js
```

Este script verifica se todos os microserviços estão respondendo nas portas corretas.

## 📊 Endpoints Disponíveis

| Serviço | URL | Health Check | Description |
|---------|-----|--------------|-------------|
| **Router** | http://localhost:3000 | `/` | Gateway principal |
| **User** | http://localhost:4000 | `/health` | Usuários e autenticação |
| **Post** | http://localhost:4001 | `/health` | Posts e comentários |
| **Message** | http://localhost:4002 | `/health` | Chats e mensagens |
| **Notification** | http://localhost:4000 | `/health` | Notificações |
| **Report** | http://localhost:4005 | `/health` | Denúncias |
| **RabbitMQ** | http://localhost:15672 | - | Management UI |
| **MongoDB** | mongodb://localhost:27017 | - | Database |

## 🔐 Autenticação

O sistema utiliza **JWT** para autenticação. Todas as requisições devem incluir o token no header:

```http
Authorization: Bearer <jwt-token>
```

O Router extrai automaticamente:
- `userId` do token
- `isAdmin` do token
- Propaga via headers HTTP para os subgrafos

## 🔔 Sistema de Notificações

### Fluxo de Notificação
1. Ação no serviço (ex: novo comentário)
2. Serviço publica mensagem no RabbitMQ
3. Notification Service consome a mensagem
4. Notificação é persistida no MongoDB
5. Subscription GraphQL distribui em tempo real
6. Cliente recebe a notificação

### Mensagens Suportadas
- **NEW_MESSAGE** - Nova mensagem no chat
- **NEW_CHAT** - Novo chat criado
- **NEW_COMMENT** - Novo comentário no post
- **NEW_LIKE** - Nova curtida no post

## 🏗️ Arquitetura de Dados

### MongoDB Collections

Cada serviço possui suas próprias collections:

**User Service**:
- `users` - Dados dos usuários
- `goals` - Goals dos usuários

**Post Service**:
- `posts` - Posts publicados
- `comments` - Comentários nos posts
- `likes` - Curtidas nos posts

**Message Service**:
- `chats` - Grupos de chat
- `messages` - Mensagens enviadas

**Notification Service**:
- `notifications` - Notificações dos usuários

**Report Service**:
- `reports` - Denúncias criadas

## 🌐 GraphQL Federation

### Subgraphs
Cada serviço expõe um subgraph GraphQL que é combinado pelo Router:

```graphql
# Schema unificado após federation
type Query {
  # User Service
  me: User
  myGoals: [Goal]
  
  # Post Service
  posts: [Post]
  myPosts: [Post]
  
  # Message Service
  myChats: [Chat]
  chatMessages(chatId: ID!): [Message]
  
  # Notification Service
  myNotifications: [Notification]
  countMyUnreadNotifications: Int
}
```

## 🔄 Context Propagation

O Router propaga automaticamente o contexto para os subgrafos via headers:

```http
user-id: <ObjectId>
is-admin: true/false
from: client|admin
```

## 🐳 Docker

### Containers
- **MongoDB** - Banco de dados na porta 27017
- **RabbitMQ** - Message broker na porta 5672
- **RabbitMQ Management** - UI na porta 15672

### Build e Push das Imagens
```bash
# Build de cada serviço
docker build -t user-service ./user-service
docker build -t post-service ./post-service
docker build -t message-service ./message-service
docker build -t notification-service ./notification-service
docker build -t report-service ./report-service
docker build -t router ./router

# Executar
docker-compose up -d
```

## 🧪 Testes

Execute testes em cada serviço:

```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:cov

# Testes em watch mode
npm run test:watch

# Testes e2e
npm run test:e2e
```

## 📝 Scripts Disponíveis

Todos os serviços compartilham os seguintes scripts:

```bash
npm run start          # Produção
npm run start:dev      # Desenvolvimento
npm run start:debug    # Debug mode
npm run build         # Compilar
npm run lint           # Linter
npm run format         # Formatar código
```

## 🔧 Configuração de Ambiente

### Variáveis Obrigatórias

| Variável | Descrição | Onde |
|----------|-----------|------|
| `PORT` | Porta do serviço | Todos |
| `MONGO_URI` | Conexão MongoDB | Todos |
| `JWT_SECRET` | Chave secreta JWT | User, Notification, Router |
| `RABBITMQ_URI` | Conexão RabbitMQ | Post, Message, Notification |
| `AWS_*` | Credenciais AWS S3 | User Service |
| `EMAIL_*` | Credenciais SMTP | User Service |

## 🚨 Troubleshooting

### Serviços não iniciam
- Verifique se MongoDB e RabbitMQ estão rodando
- Confirme que as portas não estão em uso
- Verifique os logs com `docker-compose logs`

### Erro de autenticação
- Verifique se o `JWT_SECRET` está configurado corretamente
- Confirme que o token JWT é válido
- Verifique expiração do token

### Notificações não chegam
- Verifique conexão com RabbitMQ
- Confirme que o Notification Service está rodando
- Verifique logs do RabbitMQ Management UI

## 📚 Estrutura do Projeto

```
glasser-study-back/
├── user-service/          # Usuários e autenticação
├── post-service/          # Posts e comentários
├── message-service/       # Chats e mensagens
├── notification-service/  # Notificações em tempo real
├── report-service/        # Denúncias e moderação
└── router/                # API Gateway (Apollo Federation)
```

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

UNLICENSED - Proprietário

## 👥 Equipe

Glasser Study Team

## 🔗 Referências

- [NestJS Documentation](https://docs.nestjs.com/)
- [Apollo Federation](https://www.apollographql.com/docs/federation/)
- [GraphQL](https://graphql.org/)
- [MongoDB](https://www.mongodb.com/)
- [RabbitMQ](https://www.rabbitmq.com/)

