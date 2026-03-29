# 🛡️ Strategic Vision & Best Practices - Ciberportero Project

This document outlines the security, privacy, and development principles that guide the **Ciberportero** project. Our core mission is to empower the **UNDEF (National Defense University)** community with a professional-grade academic management ecosystem.

## 🚀 Strategic Direction: Student-First
While this project originated as a research blog, our roadmap has shifted to prioritize the **UNDEF student experience**. Every feature is designed to reduce frictionless access to academic tools while maintaining the highest security standards.

### 🌓 Privacy-by-Design (Beta v0.1)
*   **Zero-Friction Adoption**: We currently utilize **LocalStorage** for activity tracking. This allows students to immediately benefit from the portal without undergoing authentication procedures.
*   **Client-Side Sovereignty**: All progress data remains within the user's browser, ensuring total privacy until the user chooses to sync with the cloud.
*   **Evolution to Cloud Sync**: As the platform matures, we will integrate **Google OAuth 2.0 (Auth.js)** as an opt-in feature to allow multi-device synchronization while maintaining a "Guest Mode" for privacy-conscious users.

## 🔐 Security Architecture

### 1. Identity Management (Planned OAuth 2.0)
We are prepared to deploy **Auth.js v5** with the following security-first features:
- **Passwordless**: We never store passwords, eliminating the risk of credential leakage.
- **Delegated Trust**: We rely on Google's institutional-grade infrastructure for identity validation.
- **Signed Sessions (JWE)**: Using high-entropy secrets to sign and encrypt session cookies.

### 2. Localization-by-Default
*   **Inclusive Design**: Localization (ES / EN / PT) is not a feature; it is a **Core Development Standard**. Every new component must support multi-language strings from day one.
*   **Institutional Language**: We prioritize Argentinian Spanish (`es-AR`) for academic contexts while providing full internationalization for the global cyberdefense community.

### 3. Secure Workflow: Two-Step Verification
*   **Accidental Prevention**: Critical actions (like deleting academic records) require a **two-step confirmation**. This aligns with the "Human-in-the-Loop" security principle, ensuring that no data is lost due to a single misclick during intense study sessions.

### 4. Database Security (Prisma + PostgreSQL)
- **Least Privilege**: We only request and store the minimum necessary metadata (`email`, `name`).
- **SQL Injection Prevention**: Using Prisma's type-safe query builder to eliminate malicious input vectors.

## 🛠️ Project Integrity & Secret Management
- **Environment Isolation**: `.env` and local database files are strictly excluded from version control.
- **Security Headers**: We implement `Content-Security-Policy` and `X-Frame-Options` to proactively defend against XSS and Clickjacking.

---
*"Mens secura in corpore tuto"* – *A secure mind in a safe body.*
