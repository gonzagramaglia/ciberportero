# Code Standards

Implementation rules and conventions for the entire project. AI agents and contributors must follow these without exception. These rules prevent pattern drift across sessions.

## Engineering Mindset

- Think before implementing — understand what is being built and why before writing a single line.
- Read context files first — never assume, always verify against `architecture.md` and `project-overview.md`.
- Scope is sacred — only build what the current feature requires. Never go beyond scope.
- Every feature must be testable — if it cannot be verified immediately after implementation, it is incomplete.
- Clean over clever — simple readable code that a junior developer can understand is always preferred.
- One thing at a time — complete one feature fully before touching the next.
- Failures are expected — use try/catch at recoverable boundaries (API routes, server actions). Let unrecoverable failures propagate. Never swallow errors to continue with invalid state.

## Git & CodeRabbit Workflow

All changes go through Pull Requests. Never push directly to `main`.

1. **Feature Branches**: Create a branch for each task. Branch naming: `<type>/<short-kebab-description>`.
   - Example: `git checkout -b feat/podcast-search`
2. **Commit & Push**: Use Conventional Commits (enforced by commitlint + Husky).
3. **Pull Request**: Open a PR against `main`. This triggers CodeRabbit automatically.
4. **Review & Fix**: Address CodeRabbit findings, push fixes.
5. **Merge**: Only merge when CodeRabbit approves and tests pass.

## TypeScript

- Strict mode enabled — no exceptions.
- Never use `any` — use `unknown` and narrow the type.
- Never use type assertions (`as SomeType`) unless absolutely necessary and commented why.
- All function parameters and return types should be explicitly typed.
- Use `type` for object shapes and unions — use `interface` only for extendable props.
- All async functions must have proper error handling.
- Use `const` by default — only use `let` when reassignment is necessary.

## Next.js Conventions

- Use the App Router (`src/app/`) with file-based routing.
- Server Components by default — only add `"use client"` when interactivity is needed.
- Data fetching in Server Components via server actions (`src/lib/actions.ts`).
- API routes only for external integrations or client-side mutations that can't use server actions.
- Never fetch data directly inside client components without a hook or server action abstraction.

## File and Folder Naming

- Folders: kebab-case — `admin-panel`, `calendar-events`.
- Component files: PascalCase — `BlogClient.tsx`, `CountdownWidget.tsx`.
- Utility/lib files: kebab-case — `string-utils.ts`, `posts-client.ts`.
- Type files: kebab-case — `next-auth.d.ts`.
- Test files: mirror the source path inside `__tests__/` — `__tests__/utils.test.ts` tests `lib/utils.ts`.
- One component per file — never export multiple components from one file.

## Component Structure

Every component follows this exact order:

```tsx
// 1. External imports
import { useState } from "react";

// 2. Internal imports
import { translations } from "@/lib/translations";

// 3. Type definitions
type Props = {
  lang: string;
  title: string;
};

// 4. Component
export function ComponentName({ lang, title }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

- Named exports for all components (no default exports).
- Props type defined directly above the component.
- No inline hardcoded strings — always use translations.

## API Route Structure

```ts
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // validate body

    // business logic
    const result = { id: body.id }; // placeholder
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/example]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

- Every route validates the session before processing.
- Every route has a try/catch with logged errors.
- Internal errors never exposed to clients.

## Server Actions

```ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function createPost(data: CreatePostInput): Promise<Post> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // validation
  // mutation
  const result = await prisma.post.create({ data });
  return result;
}
```

- Always verify session and role before mutations.
- Use Prisma for all database operations.
- Revalidate paths after mutations when needed.

## Prisma & Database

- Schema is the single source of truth for data models.
- Always scope queries to the authenticated user (defense in depth).
- Use transactions for multi-step mutations.
- Never expose raw Prisma errors to the client.

## Testing Standards

- Pure functions in `src/lib/` get unit tests.
- Test files live in `src/lib/__tests__/`.
- Use `describe` blocks to group related tests.
- Use `it()` with plain English descriptions.
- Mock external dependencies — never make real network calls in tests.
- Run tests with `yarn test`. All tests must pass before opening a PR.
- Coverage threshold: 80% minimum (statements, branches, functions, lines).

## Internationalization

- All user-facing text comes from `src/lib/translations.ts`.
- Content stored in DB as JSON: `{ "es": "...", "en": "...", "pt": "..." }`.
- Language is managed via React Context (`LanguageContext`).
- Default language: Spanish (`es`).
