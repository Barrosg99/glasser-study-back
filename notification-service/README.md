# Notification Service

Este é o serviço de notificações do sistema Glasser Study, responsável por gerenciar todas as notificações dos usuários.

## Funcionalidades

- Criação de notificações
- Listagem de notificações por usuário
- Marcação de notificações como lidas
- Envio de notificações por email
- Contagem de notificações não lidas
- Suporte a diferentes tipos de notificação (likes, comentários, mensagens, etc.)

## Tecnologias

- NestJS
- GraphQL (Apollo Federation)
- MongoDB (Mongoose)
- SendGrid (Email)

## Tipos de Notificação

- `POST_LIKE`: Quando alguém curte um post
- `POST_COMMENT`: Quando alguém comenta em um post
- `NEW_FOLLOWER`: Quando alguém segue o usuário
- `CHAT_MESSAGE`: Quando recebe uma mensagem no chat
- `SYSTEM`: Notificações do sistema

## Estrutura do Projeto

```
src/
├── app.module.ts          # Módulo principal da aplicação
├── main.ts               # Ponto de entrada da aplicação
├── app.controller.ts     # Controller de health check
└── notification/         # Módulo de notificações
    ├── notification.module.ts
    ├── notification.service.ts
    ├── notification.resolver.ts
    ├── models/
    │   └── notification.model.ts
    └── dto/
        ├── create-notification.dto.ts
        └── update-notification.dto.ts
```

## Configuração

### Variáveis de Ambiente

```env
PORT=3004
MONGO_USERNAME=your_mongo_username
MONGO_PASSWORD=your_mongo_password
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=notifications
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Docker

```bash
# Construir e executar
docker-compose up --build

# Executar em background
docker-compose up -d

# Parar
docker-compose down
```

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run start:dev

# Executar em modo debug
npm run start:debug

# Build da aplicação
npm run build

# Executar testes
npm run test

# Executar testes em modo watch
npm run test:watch
```

## GraphQL Schema

O serviço expõe um schema GraphQL com as seguintes operações principais:

### Queries
- `myNotifications`: Lista notificações do usuário logado
- `myUnreadNotifications`: Lista notificações não lidas
- `notification`: Busca uma notificação específica
- `notificationCount`: Conta total e não lidas

### Mutations
- `createNotification`: Cria uma nova notificação
- `updateNotification`: Atualiza uma notificação
- `markNotificationAsRead`: Marca como lida
- `markAllNotificationsAsRead`: Marca todas como lidas
- `deleteNotification`: Remove uma notificação

## Integração

Este serviço é projetado para funcionar como um subgraph do Apollo Federation, permitindo que outros serviços consultem informações de notificações através do router GraphQL principal.

## Monitoramento

O serviço inclui um endpoint de health check em `/health` para monitoramento de disponibilidade.
