# 🛡️ Security Best Practices - Ciberportero Project

This project implements a management system for **Cyberdefense (UNDEF)** students following professional security and privacy standards.

## 1. Authentication and Identity Management (OAuth 2.0)
We have implemented **Auth.js v5** with the **Google** provider.
- **Passwordless**: We do not store passwords in our database. This eliminates the risk of credential leakage (Credential Stuffing / Brute Force).
- **Delegation**: We rely on Google's security infrastructure for identity validation.
- **AUTH_SECRET**: We use a high-entropy 32-byte secret generated cryptographically to sign session cookies (JWE), preventing session hijacking.

## 2. Server-Side Data Protection (Next.js Middleware)
Security is not limited to the user interface.
- **Middleware**: Access to the `/dashboard` route is validated at the server level *before* any component is rendered.
- **Server Components**: Student data queries are performed in server components, meaning the client never receives raw database data, only the final HTML.

## 3. Database Security (Prisma + SQLite)
- **Principle of Least Privilege**: We only request strictly necessary fields (`email`, `name`, `image`).
- **Prisma Adapter**: We use the official Auth.js adapter that prevents SQL injection and handles relationships securely.

## 4. Secret and Repository Management
- **.env Exclusion**: The `.env` file is in `.gitignore`. It must never be uploaded to the repository.
- **DB Exclusion**: The local `dev.db` database is excluded to prevent the leakage of test data.

## 5. Recommendations for Production
For final deployment, these additional steps should be followed:
- **Enforced HTTPS**: Ensure the domain has SSL (Vercel does this by default).
- **Security Headers**: Implement headers such as `Content-Security-Policy`, `X-Frame-Options`, and `X-Content-Type-Options`.
- **Secret Rotation**: Change the `AUTH_SECRET` every 6-12 months.
- **Managed Database**: Move from local SQLite to a managed Postgres (Supabase/Neon) with encryption at rest.

---
*"Mens secura in corpore tuto"*
