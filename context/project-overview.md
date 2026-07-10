# Project Overview: Ciberportero

## About the Project

Ciberportero is an advanced academic ecosystem and community portal designed for the **UNDEF (National Defense University)** community. Its primary mission is to provide students of the **Licenciatura en Ciberdefensa** with a centralized, high-fidelity experience for managing their academic life — from course tracking to collaborative study rooms.

**Live:** Deployed on Vercel (Next.js).

## Core User Flows

### 1. Academic Hub (Homepage)

- Centralized useful links (Moodle, SIU Guaraní, Google Drive, WhatsApp groups, Discord).
- Active notifications and countdowns for important academic dates.
- Localized in ES / EN / PT with instant language switching.

### 2. Study Plan Manager

- Interactive view of all 37 subjects across 4 academic years.
- Dependency tracking: prerequisites and unlocks highlighted on hover.
- Smart locking system — subjects locked until prerequisites are completed.
- Tri-state tracking: Pending → In Progress → Completed.
- Toggle between intermediate (Analista) and full degree (Licenciatura) objectives.
- Progress saved locally in the browser (LocalStorage).

### 3. Academic Calendar

- Admin-managed calendar events (exams, classes, administrative dates).
- Personal event creation for individual students.
- Google Calendar integration (one-click export, batch .ics download).
- Filter by semester, subject, and event type.

### 4. Blog & Podcast

- Multilingual blog posts managed by admin.
- Podcast hub with native audio player.
- Comment system with nested replies and image support.
- Like/dislike voting on posts and podcast episodes.

### 5. Collaborative Rooms

- Private study rooms with secret code access.
- Hierarchical organization: Categories → Subcategories → Messages.
- Rich chat with image uploads (Supabase Storage), replies, and pinned messages.
- Real-time updates via Supabase Realtime.

### 6. Student Dashboard

- Personal progress tracking (self-assessments, exams, practical works).
- Grade recording with subject filtering.
- Guest mode with local storage; authenticated mode with cloud sync.

## Target User

A student of the Licenciatura en Ciberdefensa at UNDEF who:

- Needs centralized access to academic resources and schedules.
- Wants to track their academic progress and plan their career path.
- Benefits from collaborative study spaces with peers.
- Is comfortable using a modern web application in Spanish (with EN/PT support).

## Features In Scope

- Google OAuth authentication (Auth.js v5).
- Role-based access (admin / editor / user).
- Full CRUD for posts, links, events, notifications, countdowns, podcasts, images.
- Collaborative rooms with real-time messaging.
- Academic plan with dependency tracking.
- Calendar with Google Calendar sync.
- Multilingual support (ES / EN / PT).
- Comment system with nested replies.

## Features Out of Scope

- Mobile native app (web-only, responsive design).
- Payment or subscription systems.
- AI-powered features (not currently integrated).
- Push notifications.
- Real-time video/voice chat in rooms.
