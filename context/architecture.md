# Architecture

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | Full-stack React framework with SSR/SSG |
| Language | TypeScript 5 | Type-safe development |
| Database | PostgreSQL (Supabase) | Primary data store |
| ORM | Prisma 6 | Type-safe database access and migrations |
| Auth | Auth.js v5 (next-auth) | Google OAuth + session management |
| Storage | Supabase Storage | Image uploads for rooms and blog |
| Realtime | Supabase Realtime | Live updates in collaborative rooms |
| Styling | CSS Modules + Global CSS | Component-scoped and global styles |
| Linting | ESLint 9 + Commitlint | Code quality and commit message enforcement |
| Testing | Vitest + @vitest/coverage-v8 | Unit testing with 80% coverage threshold |
| Code Review | CodeRabbit | Automated AI review on PRs to main |
| Hosting | Vercel | Production deployment |

## Folder Structure

```text
/
├── AGENTS.md                  → Agent instructions (read first)
├── CLAUDE.md                  → Points to AGENTS.md
├── context/                   → Project documentation for agents
│   ├── project-overview.md
│   ├── architecture.md
│   └── code-standards.md
├── docs/
│   └── project-report.md     → Full project report
├── PR_STANDARDS.md            → Pull Request conventions
├── prisma/
│   └── schema.prisma          → Database schema
├── src/
│   ├── app/                   → Next.js App Router pages
│   │   ├── api/               → API routes (REST endpoints)
│   │   ├── admin/             → Admin panel pages
│   │   ├── blog/              → Blog pages
│   │   ├── calendar/          → Calendar pages
│   │   ├── dashboard/         → Student dashboard
│   │   ├── editor/            → Editor role pages
│   │   ├── links/             → Links page
│   │   ├── plan/              → Study plan page
│   │   ├── podcast/           → Podcast pages
│   │   └── salas/             → Collaborative rooms
│   ├── components/            → Reusable UI components
│   │   └── admin/             → Admin-specific components
│   ├── context/               → React Context providers
│   ├── data/                  → Static data (curriculum)
│   ├── hooks/                 → Custom React hooks
│   ├── lib/                   → Utilities, DB client, server actions
│   │   └── __tests__/         → Unit tests
│   └── types/                 → TypeScript type definitions
├── public/                    → Static assets
├── scripts/                   → Seed scripts
└── vitest.config.ts           → Test configuration
```

## System Boundaries

| Layer | Responsibility |
|-------|---------------|
| `src/app/` | Next.js pages, layouts, and API routes. Minimal business logic. |
| `src/components/` | Reusable UI only. No direct database calls. |
| `src/lib/` | Database client, server actions, utilities. All business logic lives here. |
| `src/hooks/` | Client-side React hooks for state and effects. |
| `src/context/` | React Context providers (Auth, Language). |
| `prisma/` | Database schema and migrations. Source of truth for data models. |

## Data Flow: Page Rendering

```text
User requests page
  ↓
Next.js App Router resolves the route
  ↓
Server Component fetches data via Prisma (src/lib/actions.ts)
  ↓
Data passed as props to Client Components
  ↓
Client Components handle interactivity (language switching, local state)
```

## Data Flow: Collaborative Rooms

```text
User joins room with secret code
  ↓
RoomMember record created via server action
  ↓
Client subscribes to Supabase Realtime channel (room messages)
  ↓
User sends message → API route inserts into RoomMessage table
  ↓
Supabase broadcasts to all subscribed clients
  ↓
UI updates in real-time
```

## Data Flow: Authentication

```text
User clicks "Sign in with Google"
  ↓
Auth.js handles OAuth flow (Google provider)
  ↓
Prisma Adapter creates/updates User + Account records
  ↓
Session stored server-side, accessible via auth() helper
  ↓
Role-based access checked in layouts/pages (admin, editor, user)
```

## Database Schema (Key Models)

| Model | Purpose |
|-------|---------|
| User | Authentication, roles, relationships |
| Post | Multilingual blog posts with tags and voting |
| Podcast | Audio episodes with voting |
| Comment | Nested comments on posts/podcasts |
| Link | Admin-managed useful links |
| CalendarEvent | Academic calendar with personal events |
| Notification | Active banners/alerts |
| Countdown | Homepage countdown widgets |
| Room | Collaborative study rooms |
| RoomCategory / RoomSubcategory | Room structure |
| RoomMessage | Chat messages with threading and pinning |
| Image | Uploaded media management |
| AuditLog | Admin action tracking |

## Invariants

Rules that must never be violated:

- Pages (`src/app/`) contain no heavy business logic — delegate to `src/lib/`.
- Components never call Prisma directly — always go through server actions or API routes.
- All database mutations are scoped to the authenticated user (except admin operations).
- Multilingual content stored as JSON (`{ "es": "...", "en": "...", "pt": "..." }`).
- Admin routes are protected by role check in the layout.
- No hardcoded strings in UI — all text comes from `src/lib/translations.ts`.
- Images uploaded via Supabase Storage, URLs stored in the database.
- All API routes validate request body before processing.
- Server actions use `auth()` to verify the session before any mutation.
