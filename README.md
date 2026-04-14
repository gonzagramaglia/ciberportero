# 🛡️ Ciberportero 

Welcome to **Ciberportero**, an advanced academic ecosystem and community portal specifically designed for the **UNDEF (National Defense University)** community. Its primary mission is to provide students with a centralized, high-fidelity experience for managing their academic life.

## 🎓 For UNDEF Students

This site is **heavily focused on the needs of students** of the **Bachelor's Degree in Cyberdefense (UNDEF)**. It currently features a state-of-the-art **Academic Plan Manager (Beta v0.1)** and a centralized **Command Center**:

- **Interactive Kanban Roadmap**: A high-density, side-by-side view of all four academic years. Scroll horizontally to plan your entire career at a glance.
- **Dependency Tracking (Smart Hover)**: Hover over any subject to instantly see its **Prerequisites** (🔴) and **Unlocks** (🔵) light up with high-intensity gradients.
- **Smart Locking System**: Subjects are automatically "locked" (🔒) until their prerequisites are completed, preventing planning errors.
- **Objective-Based Progress**: Toggle between **Analista (Intermediate 📜)** and **Licenciatura (Full 🎓)** objectives. All statistics and dependency lists update in real-time.
- **Tri-State Subject Tracking**: Manage your semester with precision. Subjects support **Pending** (⚪), **In Progress** (🟡), and **Completed** (🟢).
- **Centralized Calendar with Google Sync**: A modern interface to manage academic dates and exams. Features one-click "Add to Google Calendar" and batch .ics exports with custom filtering.
- **Community Discussion System**: A multilingual discussion platform integrated into every academic module, allowing students to share notes, tips, and coordinate study sessions.

## ⚙️ Admin Dashboard (New)

Ciberportero now includes a restricted **Mission Control** area for administrators to manage the platform's content in real-time across all supported languages:

- **Link Management**: Add, remove, or reorder useful resources and official links.
- **Post Engine**: Manage academic notes and community resources with a localized CMS.
- **Event Orchestrator**: Update the academic calendar dates and period filters instantly.
- **Security & Countdown Hub**: Deploy high-visibility security alerts and manage countdowns for critical dates (Enrollment, Classes Start).

## ✨ Technical Highlights

- **Full Cloud Synchronization**: Powered by **Supabase (PostgreSQL)** and **Prisma ORM** for real-time content management.
- **Secure Authentication**: Integrated with **Auth.js** (NextAuth) and **Google OAuth** for secure admin access.
- **Progress Persistence**: Student progress and personal events are securely synced across devices via **NextAuth** and **Supabase**, with local fallback for anonymous users.
- **Full Localization (ES / EN / PT)**: The entire platform—including the admin dashboard and dynamic content—is fully localized across three languages.
- **Regional Branding**: A clean, premium UI synchronized with UNDEF institutional aesthetics.
- **Performance-First Design**: Optimized for information density and high-speed horizontal scanning.

## 📝 Community Contributions

If you want to contribute, you can still submit a **Pull Request**. While we are migrating to a database-driven system, community contributions remain a core pillar of Ciberportero.

## ⭐ Support the Project

If Ciberportero has helped you in your academic journey, please consider giving this repository a **Star** as a token of appreciation. It helps the project reach more students! 🚀

## 📜 Footer

© 2026 | *Mens secura in corpore tuto*