# 🛡️ Ciberportero

Welcome to **[Ciberportero](https://www.ciberportero.com)**, a healthy community and content platform dedicated to making cybersecurity and tech careers accessible to everyone. 

Beyond writing code, this is my core initiative to help fellow students navigate the tech and security landscape. It serves as a centralized hub offering both academic tools and educational content.

![Ciberportero Cover](./public/ciberportero-cover.jpeg)

## 💪 Tech Content & Community

- 🌴 **[YouTube Channel](https://www.youtube.com/@ciberportero):** Creating educational videos about the Cyberdefense career, programming, and cybersecurity (some with over 1,000 views!).
- 📚 **[Student Resources & Course Blogs](https://www.ciberportero.com/blog):** Writing detailed blog posts for each subject as I progress through the Cyberdefense degree, alongside developing tools and compiling resources to help fellow students succeed in tech.

## 🎓 Academic Plan Manager (For UNDEF Students)

The platform features a state-of-the-art **Academic Plan Manager** built to support the needs of **Cyberdefense (UNDEF)** students:

- **Interactive Kanban Roadmap**: A high-density, side-by-side view of all four academic years. Scroll horizontally to plan your entire career at a glance.
- **Dependency Tracking (Smart Hover)**: Hover over any subject to instantly see its **Prerequisites** (🔴) and **Unlocks** (🔵) light up with high-intensity gradients.
- **Smart Locking System**: Subjects are automatically "locked" (🔒) until their prerequisites are completed, preventing planning errors.
- **Objective-Based Progress**: Toggle between **Analista (Intermediate 📜)** and **Licenciatura (Full 🎓)** objectives. All statistics and dependency lists update in real-time.
- **Tri-State Subject Tracking**: Manage your semester with precision. Subjects support **Pending** (⚪), **In Progress** (🟡), and **Completed** (🟢).
- **Centralized Calendar with Google Sync**: A modern interface to manage academic dates and exams. Features one-click "Add to Google Calendar" and batch .ics exports.

## ✨ Technical Highlights

- **Full Cloud Synchronization**: Powered by **Supabase (PostgreSQL)** and **Prisma ORM** for real-time data persistence.
- **Secure Authentication**: Integrated with **Auth.js (v5)** and **Google OAuth** for seamless student access.
- **Media Orchestration**: High-fidelity image management using **Supabase Storage** for institutional assets.
- **Progress Persistence**: Student progress is securely synced across devices.
- **Localization (ES / EN)**: The platform is fully localized to support both Spanish and English across the entire user experience.
- **Regional Branding**: A custom-designed interface that reflects an inviting, institutional identity through original illustrations, warm visuals, and a cohesive design language.

## 🧪 Testing & Code Quality

- **Unit Testing**: **[Vitest](https://vitest.dev/)** with `@vitest/coverage-v8` for fast, reliable tests.
- **Coverage Threshold**: 80% minimum enforced on statements, branches, functions, and lines.
- **Automated PR Reviews**: **[CodeRabbit](https://coderabbit.ai/)** configured with assertive profile for auto-review on every PR to `main`.
- **Commit Standards**: Conventional Commits enforced via **[Commitlint](https://commitlint.js.org/)** + **[Husky](https://typicode.github.io/husky/)** pre-commit hooks.

```bash
# Run tests
yarn test

# Run tests with coverage report
yarn test:coverage
```

## 📖 Documentation

| File | Purpose |
|------|---------|
| **[context/project-overview.md](context/project-overview.md)** | High-level project description, features, and target user |
| **[context/architecture.md](context/architecture.md)** | Technical architecture, stack, folder structure, data flows |
| **[context/code-standards.md](context/code-standards.md)** | Engineering conventions, TypeScript rules, testing standards |
| **[docs/project-report.md](docs/project-report.md)** | Full project report (summary, stack, security, future) |
| **[PR_STANDARDS.md](PR_STANDARDS.md)** | Pull Request conventions and templates |
| **[AGENTS.md](AGENTS.md)** | AI agent instructions (read order, invariants) |

## 🏗️ Project Structure

```
ciberportero/
├── src/
│   ├── app/            # Next.js App Router (pages, API routes, admin)
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context providers (Auth, Language)
│   ├── data/           # Static data (curriculum)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities, DB client, server actions, tests
│   └── types/          # TypeScript definitions
├── prisma/             # Database schema
├── context/            # Agent documentation
├── docs/               # Project report
├── public/             # Static assets
└── scripts/            # Seed scripts
```

![Ciberportero Recover](./public/ciberportero-recover.png)

## 📝 Community Contributions

Contributions are always welcome! Whether you want to fix a bug or add a new feature, you can submit a **Pull Request**. 

If you have ideas for improvements, want to suggest new features, or found a bug, feel free to open an **[Issue](https://github.com/gonzagramaglia/ciberportero/issues)** so we can discuss it.

## ⭐ Support the Project

If Ciberportero has helped you in your academic journey, please consider giving this repository a **Star** as a token of appreciation. It helps the project reach more students! 🚀

## 📫 Get in Touch

**[LinkedIn](https://linkedin.com/in/gonzagramaglia)** | **[Book a Call](https://cal.com/gonza)** | **[Portfolio](https://gonzagramaglia.github.io)**

---
© 2026 | *Mens secura in corpore tuto*