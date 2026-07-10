# Project Report

**Project Name:** Ciberportero
**Repository:** [github.com/gonzagramaglia/ciberportero](https://github.com/gonzagramaglia/ciberportero)

## 1. Executive Summary

Ciberportero is an academic ecosystem and community portal for the Licenciatura en Ciberdefensa at UNDEF (National Defense University, Argentina). It centralizes academic resources, collaborative study rooms, an interactive study plan manager, calendar, blog, podcast, and student dashboard — all in a fully localized platform (ES / EN / PT).

## 2. Project Overview

### 2a. Why we're building this

Students of the Ciberdefensa degree program lacked a unified platform to access academic resources, track progress, and collaborate with peers. Information was scattered across WhatsApp groups, Google Drives, and institutional portals. Ciberportero centralizes everything into a single, modern web application.

### 2b. Target Audience

Students and faculty of the Licenciatura en Ciberdefensa at UNDEF (FADENA). The platform supports Spanish-speaking students primarily, with English and Portuguese localization for accessibility.

## 3. Key Features

- **Academic Links Hub** — Curated, admin-managed links to Moodle, SIU Guaraní, Google Drive, and community groups.
- **Interactive Study Plan** — Visual representation of all 37 subjects with dependency tracking, smart locking, and progress tracking.
- **Academic Calendar** — Admin-managed events with Google Calendar sync and batch .ics export.
- **Blog System** — Multilingual posts with tags, comments, and voting.
- **Podcast Hub** — Audio episodes with native player, comments, and voting.
- **Collaborative Rooms** — Private study spaces with hierarchical structure, real-time chat, image uploads, and pinned messages.
- **Student Dashboard** — Personal progress tracking for self-assessments, exams, and practical works.
- **Notifications & Countdowns** — Active alerts and countdown widgets for important dates.
- **Role-Based Access** — Admin panel for full CRUD, editor role for content management.
- **Full Localization** — ES / EN / PT with instant switching.

## 4. Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 6 |
| Auth | Auth.js v5 (Google OAuth) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Testing | Vitest + @vitest/coverage-v8 |
| Code Review | CodeRabbit |
| Linting | ESLint 9 + Commitlint + Husky |
| Hosting | Vercel |

## 5. Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (Vercel)                        │
│  Next.js 16 App Router (SSR + Static)                    │
│  Server Components → Prisma → PostgreSQL                 │
│  Client Components → Supabase Realtime (Rooms)           │
└───────────────────────────┬─────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
     ┌──────────────┐ ┌─────────┐ ┌──────────────┐
     │  Supabase    │ │ Prisma  │ │  Auth.js     │
     │  Storage     │ │ ORM     │ │  (Google)    │
     │  (Images)    │ │         │ │              │
     └──────────────┘ └────┬────┘ └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  PostgreSQL  │
                    │  (Supabase)  │
                    └──────────────┘
```

## 6. Database Schema (Key Models)

| Model | Purpose |
|-------|---------|
| User | Authentication, roles (admin/editor/user) |
| Post | Multilingual blog posts with tags, voting |
| Podcast | Audio episodes with voting |
| Comment | Nested comments on posts/podcasts |
| Link | Admin-managed useful links (ordered) |
| CalendarEvent | Academic dates with personal events |
| Notification | Active banners/alerts |
| Countdown | Homepage countdown widgets |
| Room | Collaborative study rooms |
| RoomCategory / RoomSubcategory | Room content structure |
| RoomMessage | Chat messages with threading, pinning, images |
| Image | Media management |
| AuditLog | Admin action tracking |

## 7. Testing

- **Framework:** Vitest with @vitest/coverage-v8.
- **Coverage Threshold:** 80% minimum (statements, branches, functions, lines).
- **Current Status:** 51 unit tests passing, 100% coverage on targeted utility files.

```bash
yarn test          # Run all tests
yarn test:coverage # Run with coverage report
```

## 8. Security

- **Authentication:** Auth.js v5 with Google OAuth.
- **Authorization:** Role-based access control (admin, editor, user) checked in layouts and server actions.
- **Database:** All mutations scoped to authenticated user. Admin operations require admin role.
- **Storage:** Images uploaded to Supabase Storage with access policies.
- **Input Validation:** Server-side validation on all mutations.
- **Audit Trail:** AuditLog model tracks all admin actions.
- **Secrets Management:** Environment variables for all credentials, never exposed client-side.

## 9. Code Quality

- **CodeRabbit:** Automated AI code review on every PR to `main`.
- **ESLint 9:** Code quality enforcement.
- **Commitlint + Husky:** Conventional Commits enforced via pre-commit hooks.
- **Vitest Coverage:** 80% threshold prevents merging undertested code.

## 10. Future Improvements

- Real-time notifications (push or in-app).
- AI-powered study recommendations based on progress.
- Mobile-native app (React Native / Expo).
- Exam scheduling with reminders.
- PDF export of study plan progress.
- Integration with SIU Guaraní API for automatic grade sync.
- Voice notes in collaborative rooms.

## 11. Tools Used

| Tool | Purpose |
|------|---------|
| Kiro | Primary development environment |
| CodeRabbit | Automated AI code review |
| Vercel | Production hosting |
| Supabase | PostgreSQL + Auth + Storage + Realtime |
| Prisma | ORM and schema management |
| Vitest | Unit testing with coverage |
| Husky + Commitlint | Git hooks and commit conventions |
