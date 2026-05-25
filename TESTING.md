# AACP Testing Guide

Production-grade test architecture for the AI Advertisement Collaboration Platform.

## Stack

| Layer | Tools |
|-------|--------|
| Backend unit & integration | Vitest, Supertest, MongoDB Memory Server |
| Frontend unit | Vitest, React Testing Library, jsdom |
| E2E | Playwright |

## Prerequisites

- Node.js 20+
- Backend: no external MongoDB required for tests (in-memory DB)
- Frontend E2E (optional): Clerk test user — set `E2E_CLERK_EMAIL` and `E2E_CLERK_PASSWORD`

## Backend

### Install

```bash
cd backend
npm install
```

### Environment (tests auto-configure)

`tests/setup/globalSetup.ts` sets:

- `NODE_ENV=test`
- `MONGO_URI` (MongoDB Memory Server)
- `ENCRYPTION_SECRET`, `JWT_SECRET`, `CHAPA_SECRET_KEY` (mock)

Optional `.env.test` for overrides:

```env
ENCRYPTION_SECRET=your-32-char-minimum-secret-here!!!!
JWT_SECRET=test-jwt-secret
CHAPA_SECRET_KEY=CHASECK_TEST-mock
```

### Run

```bash
# All backend tests
npm test

# Watch mode
npm run test:watch

# Unit only (scoring, wallet, coin packs)
npm run test:unit

# HTTP integration (API + DB)
npm run test:integration

# Coverage
npm run test:coverage
```

### Structure

```
backend/tests/
  setup/           globalSetup.ts, setup.ts
  helpers/         app.ts, auth.ts, fixtures.ts, chapaMock.ts
  unit/            pure logic & services
  integration/     Supertest + real routes
```

### What is covered

- Auth: Clerk mock, JWT fallback, 401 unsynced user
- Opportunities: public list, business create, role restrictions
- Applications: 50-coin debit, insufficient balance
- Payments: Chapa init/verify/webhook, duplicate credit prevention
- Wallet: credit, debit, available balance
- Recommendations: scoring math, role-based API results
- Admin / super-admin permissions
- Chat: conversation + message persistence

## Frontend

### Install

```bash
cd frontend
npm install
```

### Run unit tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

Clerk is mocked via `src/shared/lib/clerk-mock.tsx` (also used when `VITE_CLERK_PUBLISHABLE_KEY` is missing in dev).

### Run E2E (Playwright)

Start dev server automatically, or reuse existing `http://localhost:5173`:

```bash
npm run test:e2e
npm run test:e2e:ui
```

Authenticated flows in `tests/e2e/opportunities.spec.ts` run only when:

```bash
E2E_CLERK_EMAIL=you@example.com E2E_CLERK_PASSWORD=secret npm run test:e2e
```

### Structure

```
frontend/
  src/test/          setup.ts, test-utils.tsx
  tests/unit/        RTL component & guard tests
  tests/e2e/         Playwright specs
  vitest.config.ts
  playwright.config.ts
```

## CI suggestion

```yaml
- run: cd backend && npm ci && npm test
- run: cd frontend && npm ci && npm test
- run: cd frontend && npx playwright install --with-deps && npm run test:e2e
```

## Notes

- Chapa API is mocked with `fetch` stubs in payment tests — no live charges.
- Socket.IO realtime is tested at the service/REST layer; full socket E2E can be added with a test server harness.
- Extend fixtures in `backend/tests/helpers/fixtures.ts` for new workflows.
