# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bookmark Manager** — A fullstack SaaS monorepo for saving, organizing, and searching bookmarks. Core feature: when a URL is saved, the backend automatically scrapes its metadata (title, description, og:image, favicon) using Cheerio + node-fetch. Similar to Pocket / Raindrop.io.

Built as a portfolio project to demonstrate fullstack seniority.

## Monorepo Structure

```
apps/
  web/          → Next.js 15 (App Router, SSR, Server Actions)
  api/          → NestJS 11 (REST API)
packages/
  types/        → Zod schemas shared between FE and BE (single source of truth for validation)
  ui/           → Shared Ant Design wrapper components with Tailwind customization
  config/       → tsconfig.base.json, ESLint shared configs
```

**Tooling:** Turborepo + pnpm workspaces

## Common Commands

```bash
# Install all dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Run a specific app
pnpm dev --filter=web
pnpm dev --filter=api

# Build all
pnpm build

# Run tests (all)
pnpm test

# Run tests for a specific app
pnpm test --filter=api

# Lint all
pnpm lint

# Prisma commands (run from apps/api)
pnpm --filter=api db:migrate       # prisma migrate dev
pnpm --filter=api db:studio        # prisma studio
pnpm --filter=api db:seed          # seed script
pnpm --filter=api db:generate      # prisma generate
```

## Tech Stack

### Frontend — `apps/web`

- **Next.js 15** with App Router
- **Ant Design 5.x** — primary component library, handles forms and validation UI
- **Tailwind CSS 4.x** — layout and customization outside antd (preflight disabled to avoid conflicts with antd styles)
- **TanStack Query** — server state, caching, loading/error states
- **Zustand** — client-side state
- **Axios** — HTTP client with JWT interceptors for automatic token refresh

### Backend — `apps/api`

- **NestJS 11** — modules, guards, pipes, decorators
- **Prisma** — ORM with versioned migrations
- **PostgreSQL** — primary database, full-text search via `tsvector` (no Elasticsearch needed)
- **Passport.js + JWT** — auth strategy with NestJS guards
- **Cheerio + node-fetch** — lightweight metadata scraping (title, description, og:image, favicon)
- **@nestjs/config + Joi** — environment variable validation on startup

### Shared — `packages/types`

- **Zod schemas** are the single source of truth for validation
- FE uses schemas inside antd `Form.Item` custom `validator` rules
- BE uses a `ZodValidationPipe` as a global NestJS pipe
- Any validation change propagates automatically to both layers

## Architecture Decisions

### Zod as shared validator

Schemas live in `packages/types/src/schemas/`. Both `apps/web` and `apps/api` import from this package. Do not duplicate validation logic — if a field rule changes, it changes in one place.

### Ant Design + Tailwind coexistence

Tailwind's `preflight` is disabled in `tailwind.config` to prevent CSS reset conflicts with antd. Use antd components for UI elements, Tailwind for spacing, layout, and overrides.

### No Redis, no WebSockets

Out of scope for this project. Metadata scraping is async via the API on bookmark creation. No real-time features.

### Full-text search

Use PostgreSQL native full-text search (`tsvector` / `tsquery`) on bookmark title, description, and tags. No external search service.

## Environment Variables

Each app has a `.env.example` committed to the repo. Copy to `.env` and fill in values.

```bash
# apps/api/.env
DATABASE_URL=postgresql://localhost:5432/bookmark_dev   # local
# DATABASE_URL=postgresql://...@railway.app:5432/...   # production (Railway)
JWT_SECRET=your-local-secret
```

Local development uses a local PostgreSQL instance. Production uses Railway-managed PostgreSQL. The `DATABASE_URL` in `.env.example` points to the Railway instance so anyone cloning the repo can run the project without setting up a local DB.

## Database Models (Prisma)

Core entities: `User`, `Bookmark`, `Collection`, `Tag`

- A `User` has many `Bookmarks` and `Collections`
- A `Bookmark` belongs to a `User`, optionally to a `Collection`, and has many `Tags`
- A `Collection` can be public or private (`isPublic: Boolean`)
- Tags are free-form strings associated with bookmarks

## Auth Flow

- Register/Login return `accessToken` (short-lived JWT) + `refreshToken` (long-lived)
- Axios interceptor in `apps/web` catches 401s and calls the refresh endpoint automatically
- NestJS guards protect all routes except `/auth/register` and `/auth/login`

## Development Phases (Commit Structure)

| Phase | Scope                                                                 | Estado |
| ----- | --------------------------------------------------------------------- | ------ |
| 1     | Monorepo bootstrap — Turborepo, pnpm workspaces, tsconfig, ESLint     | ✅ |
| 2     | `packages/types` — Zod schemas for User, Bookmark, Collection         | ⚠️ Incompleto — faltan: RefreshTokenSchema, UpdateUserSchema, SearchBookmarksSchema, PaginationSchema, tipos de respuesta con campos scrapeados |
| 3     | Prisma schema — all models and relations                              | 🔄 En progreso |
| 4     | First migration + seed script                                         |
| 5     | NestJS bootstrap — health check, config module, env validation        |
| 6     | Auth module (BE) — register, login, JWT, Passport, guards             |
| 7     | Next.js bootstrap — antd + Tailwind config, base layout               |
| 8     | Auth UI (FE) — login/register pages, Axios JWT interceptor            |
| 9     | Bookmarks API — CRUD + metadata scraping on creation                  |
| 10    | Bookmarks UI — dashboard, bookmark cards, create form, TanStack Query |

Install libraries incrementally as each phase requires them — do not pre-install the full stack upfront.

## Deployment

| Service    | Platform                                                    |
| ---------- | ----------------------------------------------------------- |
| `apps/web` | Vercel                                                      |
| `apps/api` | Railway                                                     |
| PostgreSQL | Railway (managed)                                           |
| CI/CD      | GitHub Actions — runs tests on PR, deploys on merge to main |
