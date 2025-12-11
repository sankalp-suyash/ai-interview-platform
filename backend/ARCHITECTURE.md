# ai interview platform

## Overview 
This platform enables people to give mock ai interview in coding and behavioral questions. One can give 2 interviews per week or subscribe to get more chances.

## Technologies used 

| Component | Technology 
| Runtime   | Node.js    
| Framework | Express.js 
| Database  | MongoDB with mongoose ODM
| Authentication | JWT
| AI model  | Gemini flash 2.0


## Project structure
- backend/
  - src/
    - controllers/      # HTTP handlers
    - routes/           # Express routes
    - models/           # Mongoose schemas
    - services/         # Business logic (AI, payments, scoring)
    - middleware/       # auth, rate-limit, validation
    - workers/          # async jobs (transcripts, scoring)
    - utils/            # helpers
  - config/
  - tests/
  - Dockerfile
  - docker-compose.yml
  - package.json

## System overview
A web API (Express) that serves:
- Authentication & authorization (JWT + refresh tokens)
- Interview orchestration (create session, invoke AI model, persist results)
- Question bank management (coding & behavioral)
- Subscription & billing (limits and upgrades)
- Async processing for transcripts, scoring and notifications

Core integrations:
- MongoDB (primary store)
- AI model API (Gemini flash 2.0 or equivalent)
- Payment provider (Stripe / similar)
- Object storage (S3-compatible) for recordings/transcripts
- Queue (Redis + Bull / RabbitMQ) for background jobs
- Observability (Prometheus/Grafana, Sentry, ELK)

## Components
- API Server (Express)
- Auth Service (JWT + refresh tokens)
- AI Service Adapter (wraps calls to model provider)
- Worker Queue (background processing)
- Database (MongoDB with Mongoose)
- Storage (S3 for audio/screenshots)
- Billing (stripe integration)
- Frontend (separate repo / static hosting)

## Data models (high level)
- User
  - id, name, email, passwordHash, role, subscriptionId, createdAt
- Subscription
  - plan (free/premium), weeklyLimit, nextBilling, status
- InterviewSession
  - id, userId, questions[], startAt, endAt, status, score, transcriptUrl
- Question
  - id, type (coding|behavioral), prompt, difficulty, tags, sampleAnswer
- Attempt / Answer
  - sessionId, questionId, userResponse, aiFeedback, score
- Payment
  - paymentId, userId, amount, status, providerResponse

## Key API endpoints (examples)
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- GET /user/me
- GET /questions (filters: type, difficulty, tags)
- POST /interviews (create session — enforces limits)
- GET /interviews/:id
- POST /interviews/:id/submit (submit answers / finalize)
- GET /admin/stats

## Authentication & authorization
- Use access JWT (short-lived, e.g., 15m) and refresh tokens (httpOnly cookie or storage).
- Middleware verifies JWT and attaches user to request.
- Role-based middleware for admin endpoints.
- Protect sensitive routes with rate limiting and input validation.

## Interview flow (sequence)
1. Client requests new interview -> POST /interviews
2. Server checks subscription / weekly quota
3. Create InterviewSession document with status=queued
4. Enqueue job to worker queue with session id
5. Worker:
   - Fetch questions / build prompt
   - Send prompt to AI model via AI Service Adapter
   - Receive AI response and/or scoring
   - Store transcript in object storage, update InterviewSession (score, transcriptUrl, status=completed)
   - Optionally trigger notification/email
6. Client polls GET /interviews/:id or receives websocket/notification on completion

## Rate-limiting & quotas
- Free plan: 2 interviews/week (enforced on API)
- Premium plans: higher limits; limits tracked per subscription document and cached (Redis)
- Per-IP and per-user rate limiting (express-rate-limit + Redis store)

## Background jobs
- Transcription & post-processing
- AI scoring / reruns
- Billing webhooks processing
- Email/notification sending

## Deployment & scaling
- Containerize with Docker; recommend Kubernetes for production.
- Horizontal scale API servers behind a load balancer.
- Use managed MongoDB or a replica set; enable daily backups.
- Use autoscaling for workers based on queue length.
- CDN for static assets; S3-compatible for transcripts/recordings.

## Environment variables (minimum)
- PORT
- NODE_ENV
- MONGO_URI
- JWT_SECRET
- JWT_REFRESH_SECRET
- AI_API_KEY
- S3_ENDPOINT, S3_BUCKET, S3_KEY, S3_SECRET
- REDIS_URL
- STRIPE_API_KEY
- SENTRY_DSN
- SMTP_* (if emails)

## Security considerations
- Store secrets in a vault or environment (avoid committing)
- Enforce HTTPS and HSTS
- Use helmet, cors with strict origins, and body size limits
- Sanitize inputs; validate schemas with Joi/Zod
- Limit file upload sizes and validate file types
- Keep dependencies up to date; scan for vulnerabilities

## Observability & logging
- Structured logs (JSON) and centralized collector (ELK / Loki)
- Metrics (Prometheus): request latencies, error rates, queue length, job durations
- Tracing (OpenTelemetry) for cross-service traces
- Error reporting (Sentry) for exceptions

## Backups & disaster recovery
- Regular DB backups and point-in-time recovery where available
- Versioned object storage for transcripts
- Recovery runbook in repo

## Testing & CI/CD
- Unit tests for services and controllers (jest)
- Integration tests with in-memory MongoDB (mongodb-memory-server)
- E2E tests for major flows
- GitHub Actions pipeline:
  - lint -> test -> build -> publish docker image -> deploy (staging -> production)
- Run security scans and dependency checks in CI

## Operational notes
- Monitor weekly usage per user and proactively notify when nearing quota.
- Keep AI adapter isolated behind service layer to switch providers easily.
- Store cost and usage telemetry for billing accuracy and optimization.

## Appendix: Minimal sequence example (textual)
- User -> POST /interviews -> API
- API -> Redis queue -> Worker
- Worker -> AI provider -> Worker
- Worker -> S3 + MongoDB -> Worker updates session status
- API -> Client (poll / ws notification)

<!-- end of file -->
