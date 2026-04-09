# 🛡️ Ciberportero 

Welcome to **Ciberportero**, an advanced academic ecosystem and study portal specifically designed for the **UNDEF (National Defense University)** community. While it serves as a space for cyberdefense research, its primary mission is to provide students with a centralized, high-fidelity experience for managing their academic life.

## 🎓 For UNDEF Students

This site is **heavily focused on the needs of students** of the **Bachelor's Degree in Cyberdefense (UNDEF)**. It currently features a state-of-the-art **Academic Plan Manager (Beta v0.1)**:

- **Interactive Kanban Roadmap**: A high-density, side-by-side view of all four academic years. Scroll horizontally to plan your entire career at a glance.
- **Dependency Tracking (Smart Hover)**: Hover over any subject to instantly see its **Prerequisites** (🔴) and **Unlocks** (🔵) light up with high-intensity gradients.
- **Smart Locking System**: Subjects are automatically "locked" (🔒) until their prerequisites are completed, preventing planning errors.
- **Objective-Based Progress**: Toggle between **Analista (Intermediate 📜)** and **Licenciatura (Full 🎓)** objectives. All statistics and dependency lists update in real-time.
- **Reactive Search Engine**: A fast, accent-insensitive search bar to find subjects by name or ID instantly.
- **Tri-State Subject Tracking**: Manage your semester with precision. Subjects now support three distinct states: **Pending** (⚪), **In Progress** (🟡), and **Completed** (🟢), allowing for dynamic career visualization.

## 📅 Academic Calendar & Security

Ciberportero includes a centralized command center to keep you informed of critical dates and security status:

- **Interactive Timeline**: A modern, full-feature calendar interface to manage your academic year at a glance.
- **Strategic Filtering**: Filter events by subject or academic period (e.g., *1st Semester / 1st Year*) to focus on what matters.
- **Critical Security Alerts**: High-visibility (Red/Danger) notification system for urgent campus alerts, such as mandatory password resets or system outages.
- **Real-Time Roadmap**: Synchronized dates for exams, deliverable announcements, and administrative periods (Enrollment, Classes Start).
- **Feedback Loop**: Integrated direct-contact mechanism for reporting missing dates or data corrections.

## ✨ Technical Highlights

- **Progress Persistence**: Track your degree progress without requiring an account. Data is securely saved in your browser's **LocalStorage**.
- **Performance-First Design**: Built with a "Mission Control" aesthetic, optimized for information density and horizontal scanning. 
- **Full Localization (ES / EN / PT)**: The entire platform—including the academic plan and calendar—is localized across three languages.
- **Regional Branding**: A clean, premium UI synchronized with the **Flag of Córdoba** color palette and UNDEF institutional aesthetics.
- **Security-First Approach**: Built following strict Ciberdefense principles (see [BEST_PRACTICES.md](./BEST_PRACTICES.md)).

## 📝 Community Contributions

If you want to add a new post or resource, you can do so by submitting a **Pull Request**. Simply create a file in the `posts/` folder according to your preferred language. All submissions go through a review process to ensure relevance for the student community.

Each file must start with this basic frontmatter:

```markdown
---
title: "Your title here"
date: "2026-03-29"
description: "A short description of your note"
---
```

## 📜 Footer

© 2026 | *Mens secura in corpore tuto*