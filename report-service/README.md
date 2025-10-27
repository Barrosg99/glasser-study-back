# Report Service

GraphQL Federation subgraph service for managing reports in the Glasser Study platform. This service handles creation, querying, and resolution of reports for various entities (posts, messages).

## Overview

The Report Service is a NestJS-based microservice that provides:
- **Report Management**: Create and manage reports for different entities
- **Status Tracking**: Track report status (PENDING, RESOLVED, REJECTED)
- **Admin Controls**: Admin-only queries for viewing and resolving reports
- **GraphQL Federation**: Extends the federated GraphQL schema

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **GraphQL**: Apollo Federation with [@nestjs/apollo](https://www.npmjs.com/package/@nestjs/apollo)
- **Database**: MongoDB with Mongoose
- **Runtime**: Node.js 20

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3004
MONGO_URI=mongodb://username:password@localhost:27017/reports?authSource=admin
MONGO_USERNAME=admin
MONGO_PASSWORD=admin
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=reports
```

## Running the Application

### Local Development

```bash
# Start in development mode with hot reload
npm run start:dev

# Start in production mode
npm run start:prod
```

The GraphQL endpoint will be available at `http://localhost:3004/` (or your configured PORT).
Health check endpoint: `http://localhost:3004/health`

### Using Docker

```bash
# Start with Docker Compose (includes MongoDB)
docker-compose up

# Or build and run Docker container
docker build -t report-service .
docker run -p 3004:3004 report-service
```

## GraphQL API

### Schema Overview

The service exposes the following GraphQL schema:

#### Types

```graphql
enum Entity {
  POST
  MESSAGE
}

enum ReportStatus {
  PENDING
  RESOLVED
  REJECTED
}

type Report {
  id: ID!
  entity: Entity!
  entityId: String!
  reason: String!
  description: String
  status: ReportStatus!
  resolvedReason: String
  user: User!
  resolvedBy: User
  createdAt: Date!
  updatedAt: Date!
}
```

#### Queries

**Get all reports** (Admin only)
```graphql
reports(
  queryReportsDto: QueryReportsDto
): [Report!]!
```

**Count reports** (Admin only)
```graphql
countReports(
  queryReportsDto: QueryReportsDto
): Int!
```

**Get report by ID** (Admin only)
```graphql
report(id: ID!): Report!
```

#### Mutations

**Create a report**
```graphql
createReport(
  saveReportDto: SaveReportDto!
): Report!
```

**Resolve a report** (Admin only)
```graphql
resolveReport(
  id: ID!
  resolvedReason: String!
  status: String!
): Report!
```

### Example Queries

#### Create a Report

```graphql
mutation {
  createReport(saveReportDto: {
    entity: POST
    entityId: "507f1f77bcf86cd799439011"
    reason: "Inappropriate content"
    description: "This post contains inappropriate content"
  }) {
    id
    entity
    status
    createdAt
  }
}
```

#### Query Reports (Admin)

```graphql
query {
  reports(queryReportsDto: { 
    status: PENDING
    entity: POST
  }) {
    id
    entity
    entityId
    reason
    description
    status
    user {
      id
    }
    createdAt
  }
}
```

#### Resolve a Report (Admin)

```graphql
mutation {
  resolveReport(
    id: "507f1f77bcf86cd799439011"
    resolvedReason: "Content removed successfully"
    status: "RESOLVED"
  ) {
    id
    status
    resolvedReason
  }
}
```

### Headers Required

For authenticated operations, include these headers:

```
user-id: <userId>
from: <origin> (e.g., "admin" or "client")
is-admin: <true/false>
```

## Project Structure

```
src/
├── app.module.ts           # Root module configuration
├── app.controller.ts       # Health check controller
├── main.ts                 # Application entry point
└── report/
    ├── report.module.ts    # Report module configuration
    ├── report.resolver.ts  # GraphQL resolver
    ├── report.service.ts   # Business logic
    ├── models/
    │   └── report.model.ts # Mongoose schema and GraphQL types
    └── dto/
        ├── save-report.dto.ts
        └── query-reports.dto.ts
```

## Health Check

The service exposes a health check endpoint:

```bash
curl http://localhost:3004/health
```

Response:
```json
{
  "status": "ok"
}
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

UNLICENSED - Private project
