# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root via Turbo. Use `pnpm` (never npm or yarn).

```bash
pnpm dev          # Start all dev servers in parallel
pnpm build        # Build all packages and apps (respects dependency order)
pnpm test         # Run all tests (requires build first)
pnpm lint         # Lint all packages and apps
pnpm serve        # Start preview/offline servers
```

To run commands for a single workspace:
```bash
pnpm --filter @learning/shell dev
pnpm --filter @learning/client-mfe dev
pnpm --filter @learning/client-api dev
pnpm --filter @learning/notification-mfe dev
```

To run a single Angular test:
```bash
pnpm --filter @learning/shell test --include="**/some.spec.ts"
```

## Dev Server Ports

| App | Port | Notes |
|-----|------|-------|
| `shell` | 4200 | Angular host (Module Federation host) |
| `client-mfe` | 3001 | React MFE (exposes `./bootstrap`) |
| `notification-mfe` | 3002 | React notification MFE |
| `client-api` | serverless offline | AWS Lambda via serverless-offline |

## Architecture

This is a **micro-frontend monorepo** using pnpm workspaces + Turborepo.

### Apps

- **`apps/shell`** — Angular 19 standalone components. Acts as the Module Federation **host**. Dynamically loads React MFEs at runtime via `MfeLoaderService`, which supports primary/fallback URLs and health checks. Routes: `/clientes` and `/notificaciones`.
- **`apps/client-mfe`** — React 19 + Vite **remote** MFE. Exposes `./bootstrap` via `@originjs/vite-plugin-federation`. Converts to Web Components via `@r2wc/react-to-web-component` for Angular consumption.
- **`apps/notification-mfe`** — Same pattern as `client-mfe` for notifications.
- **`apps/client-api`** — AWS Lambda backend using Serverless Framework + Middy middleware. Local dev uses `serverless offline`.

### Shared Packages

- **`packages/entities`** — Domain types: `IClient`, `ClientStatus`, `UserContext`, `UserRole`, and a `Result<T, E>` monad (`ok()`/`err()` helpers).
- **`packages/logger`** — `ILogger` interface + `ConsoleAdapter` implementation. Exports a singleton `logger` instance.
- **`packages/auth`** — `useAuthToken` React hook.

Packages export TypeScript source directly (`./src/index.ts`) — no build step required for packages.

### Backend (client-api) Structure

```
src/
├── handlers/       # Lambda entry points (Middy middleware chain)
├── usecases/       # Business logic (depends on IClientRepository interface)
├── repositories/   # Supabase PostgreSQL implementations
├── middleware/     # Middy middlewares (mockJwt, schemaValidator)
├── schemas/        # AJV JSON schemas for request validation
└── ioc/            # ServiceFactory.ts — composition root / DI container
```

The Middy chain order matters: `httpJsonBodyParser → mockJwt → schemaValidator → cors → httpErrorHandler`.

`ServiceFactory` uses lazy singletons and is the sole place where concrete implementations are wired to interfaces.

### Key Patterns

- **Result monad** (`packages/entities/src/result.ts`): Use `Result<T, E>` instead of throwing in use cases.
- **Dependency inversion**: Use cases depend on `IClientRepository` (interface in `usecases/types/`), not on the Supabase implementation directly.
- **Module Federation**: The Angular shell fetches remote MFE bundles at runtime. The MFE loader service (`apps/shell/src/app/services/mfe-loader.service.ts`) handles URL resolution with fallbacks and 3s timeout health checks.
