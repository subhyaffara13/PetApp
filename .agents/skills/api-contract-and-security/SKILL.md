---
name: api-contract-and-security
description: >-
  Guidelines for designing robust REST/WebSocket API contracts, input validation, authentication/authorization,
  Stripe webhook signing security, and error handling.
---

# API Contract & Security Best Practices

Use this skill when defining endpoint contracts, handling payments/webhooks, securing routes, and preventing security vulnerabilities across the stack.

---

## 1. REST & WebSocket API Contracts

- **Predictable Response Structure**:
  - Success responses: `{ success: true, data: T, timestamp: string }`
  - Error responses: `{ success: false, error: { code: string, message: string, details?: any }, timestamp: string }`
- **HTTP Status Codes**:
  - `200 OK` / `201 Created` / `204 No Content`
  - `400 Bad Request` (validation errors), `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests`, `500 Internal Server Error`.

---

## 2. Security & Hardening Checklist

- **Environment Variables & Secrets**:
  - Never commit `.env` files or hardcode API keys (Stripe, OpenAI, Google Gemini, Database credentials).
  - Use environment validation at application startup.
- **Stripe Webhook Security**:
  - Always verify webhook signatures using `stripe.webhooks.constructEvent()` with raw body buffers before processing events.
- **CORS & Rate Limiting**:
  - Restrict CORS origins to authorized frontend and clinic portal URLs in production.
  - Implement rate limiting (`@nestjs/throttler`) on public emergency triage and auth routes.
- **Data Sanitization**:
  - Sanitize all user inputs to prevent NoSQL injection (Mongoose `$where`, operator injection) and XSS.
