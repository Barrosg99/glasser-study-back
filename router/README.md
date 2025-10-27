# 🚀 Router Service (API Gateway)

Um gateway de API GraphQL federado construído com NestJS e Apollo Gateway que atua como ponto de entrada único para todos os microserviços do sistema Glasser Study.

## 📋 Visão Geral

Este serviço implementa um **Apollo Federation Gateway** que:

- **Federada** múltiplos microserviços GraphQL em uma única API
- **Autentica** requisições usando JWT
- **Propaga** contexto de usuário (userId, isAdmin) para os subgrafos
- **Gerencia** CORS para permitir requisições dos clients (localhost:3000 e localhost:3001)
- **Configura** infraestrutura (MongoDB e RabbitMQ) via Docker

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│         Router (API Gateway)           │
│         Port: 3000                     │
└─────────────┬───────────────────────────┘
              │
              ├─────► Users Service (4001)
              ├─────► Posts Service (4002)
              ├─────► Messages Service (4003)
              ├─────► Reports Service (4005)
              └─────► Notifications Service (4004)
```

## 🎯 Funcionalidades

### 1. Federated GraphQL Gateway
- Combina múltiplos subgrafos GraphQL em uma supergraph unificada
- Permite consultas que cruzam fronteiras de serviços

### 2. Autenticação JWT
- Verifica e valida tokens JWT no header `Authorization`
- Extrai `userId` e `isAdmin` do payload do token
- Propaga essas informações para os subgrafos via headers HTTP customizados

### 3. Context Propagation
Propaga automaticamente os seguintes headers para os subgrafos:
- `user-id`: ID do usuário autenticado
- `is-admin`: Indica se o usuário é administrador
- `from`: Origem da requisição (client ou admin)

### 4. Health Check Integration
- Ferramenta `check-services.js` para verificar disponibilidade dos serviços
- Aguarda todos os serviços estarem prontos antes de iniciar

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# JWT
JWT_SECRET=your-secret-key-here

# MongoDB
MONGO_PORT=27017
MONGO_USERNAME=admin
MONGO_PASSWORD=admin123

# Porta do Gateway
PORT=3000

# Subgrafos (opcional - usa localhost por padrão)
SUBGRAPHS=http://users:4001,http://posts:4002,http://messages:4003,http://reports:4005
```

### Serviços Monitorados

Por padrão, o gateway monitora os seguintes serviços:

| Serviço | Porta | Endpoint |
|---------|-------|----------|
| Users | 4001 | http://localhost:4001 |
| Posts | 4002 | http://localhost:4002 |
| Messages | 4003 | http://localhost:4003 |
| Notifications | 4004 | http://localhost:4004 |
| Reports | 4005 | http://localhost:4005 |

## 🚀 Executando

### Modo Desenvolvimento (com health check)

```bash
npm run start:debug
```

Este comando:
1. Verifica se os containers Docker estão rodando
2. Aguarda todos os serviços estarem prontos
3. Inicia o gateway em modo watch

### Modo Desenvolvimento (sem health check)

```bash
npm run start:dev
```

### Modo Produção

```bash
npm run start:prod
```

### Build

```bash
npm run build
```

## 🐳 Docker

### Iniciar containers (MongoDB e RabbitMQ)

```bash
node start-containers.js
```

Este script:
- Verifica se o Docker está rodando
- Inicia os containers necessários (MongoDB, RabbitMQ)
- Aguarda os serviços estarem prontos

### Verificar serviços

```bash
node check-services.js
```

Este script verifica se todos os serviços estão respondendo na porta correta.

### docker-compose

```bash
docker-compose up -d
```

Inicia:
- **MongoDB** na porta configurada em `MONGO_PORT`
- **RabbitMQ** nas portas 5672 (AMQP) e 15672 (Management UI)

## 🔧 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run start` | Inicia o gateway |
| `npm run start:dev` | Inicia em modo watch |
| `npm run start:debug` | Inicia com health check dos serviços |
| `npm run start:prod` | Inicia em modo produção |
| `npm run build` | Builda a aplicação |
| `npm run lint` | Executa o linter |
| `npm run format` | Formata o código |

## 🔐 Segurança

### CORS
O gateway está configurado para aceitar requisições dos seguintes origins:
- `http://localhost:3000` (Client)
- `http://localhost:3001` (Admin)

### Headers Permitidos
- `Content-Type`
- `Authorization`
- `from`

### Autenticação
O JWT é verificado e decodificado automaticamente. Em caso de token inválido, retorna erro: `Token Inválido`.

## 📊 Endpoints

### GraphQL Playground
- URL: `http://localhost:3000`
- Método: GET/POST
- Autenticação: Bearer token no header `Authorization`

### Exemplo de Query

```graphql
query {
  posts {
    id
    title
    content
    user {
      name
      email
    }
  }
}
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:cov

# Testes e2e
npm run test:e2e
```

## 🔍 Troubleshooting

### Serviços não estão prontos
Use o script de health check:
```bash
node check-services.js
```

### Containers não iniciam
Verifique se o Docker está rodando:
```bash
docker info
```

### Erro de conexão com subgrafos
1. Verifique se todos os serviços estão rodando
2. Confirme que as portas estão corretas no `.env`
3. Verifique os logs dos serviços individuais

## 📚 Tecnologias

- **NestJS** - Framework Node.js
- **Apollo Gateway** - Federated GraphQL
- **GraphQL** - Query language
- **JWT** - Autenticação
- **Docker** - Containerização
- **RabbitMQ** - Message broker
- **MongoDB** - Database

## 📝 Notas

- O gateway está configurado para introspect automaticamente os subgrafos
- O playground do Apollo está desabilitado por padrão
- A landing page do Apollo Server está habilitada
- O contexto é extraído de cada requisição e propagado para os subgrafos

## 🤝 Contribuindo

Para contribuir com este projeto, siga os padrões estabelecidos no código e execute os linters antes de fazer commit.

## 📄 Licença

MIT
