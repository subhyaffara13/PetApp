---
name: nestjs-fullstack-architecture
description: >-
  Architectural patterns and best practices for building scalable NestJS backends with MongoDB/Mongoose,
  WebSockets (Socket.IO), validation pipes, error filters, and external integrations (Stripe, AI).
---

# NestJS & Full-Stack Backend Architecture

Use this skill when developing, refactoring, or architecting backend services, controllers, gateways, and data layers in NestJS.

---

## 1. Modular Structure & Dependency Injection

- **Feature Modules**: Organize each domain (e.g., `auth`, `pets`, `clinics`, `emergency`, `triage`, `payments`) into its own self-contained module containing:
  - `*.module.ts`: Declarations, imports, and exports.
  - `*.controller.ts`: Routing, request validation, response formatting, status codes.
  - `*.service.ts`: Core business logic, transactional workflows.
  - `*.schema.ts` / `*.entity.ts`: Mongoose schema definitions and interfaces.
  - `dto/`: Data Transfer Objects for requests and responses.
- **Global / Core Modules**: Keep configuration (`ConfigModule`), database connections (`MongooseModule.forRoot`), and cross-cutting utilities in a dedicated `core` or `common` module.

---

## 2. Validation, DTOs & Serialization

- **Class-Validator & Class-Transformer**:
  - Always validate incoming payloads with `@nestjs/common` `ValidationPipe`:
    ```typescript
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    ```
  - Define strict types in DTOs using `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, `@ValidateNested()`, `@Type()`.

---

## 3. Real-Time WebSockets (Socket.IO)

- Use `@WebSocketGateway()` with explicit namespace and CORS configurations.
- Use `@SubscribeMessage('event')` to handle incoming events and `@WebSocketServer() server: Server` to broadcast state updates.
- Keep socket handlers lean by delegating event business logic to NestJS injectable services.

---

## 4. External Integrations (AI & Stripe)

- Wrap 3rd-party clients (Gemini `@google/generative-ai`, OpenAI, Stripe) inside dedicated NestJS injectable providers/services.
- Ensure API keys and secrets are loaded strictly via `@nestjs/config` (`ConfigService`) and never hardcoded.
- Implement proper timeout, retry, and fallback error handling for AI triage and payment webhook processing.
