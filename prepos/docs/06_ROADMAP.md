# Prep_OS Roadmap

> This document defines the complete development roadmap of Prep_OS.

---

# Project Goal

Build the best Offline-First AI-assisted GATE CSE Operating System.

Every completed feature should make study planning easier, smarter and more automated.

---

# Development Strategy

Development follows milestone-based releases.

Each milestone must end in a stable, tested and documented version.

---

# Milestone 1 — Foundation ✅

Status

Completed

Features

✅ Git Setup
✅ GitHub Repository
✅ Development Workflow
✅ Dashboard
✅ Subject Page
✅ Lecture CRUD
✅ Notes CRUD
✅ PYQ CRUD
✅ Revision CRUD
✅ Topic Progress Engine
✅ Subject Progress Engine
✅ Confidence Engine
✅ PYQ Validation

---

# Milestone 2 — Study Management ✅

Status

Completed

Features

✅ Mistake Notebook (Mistake Vault)
✅ Today's Tasks (weightage-aware priority engine)
✅ Revision Queue / 7-Day Revision Lookahead
✅ Study Session Timer
✅ Daily Progress (Daily Study Chart)
⬜ Daily Planner (not built — Today's Tasks + Revision Forecast cover this need)
⬜ Study Calendar (not built — heatmap + forecast strip cover this need)

---

# Milestone 3 — Analytics ✅

Status

Completed

Features

✅ Weak Topic Detection (weakTopicEngine.ts)
✅ Strong/Weak Subject Pills (Analytics page)
✅ Subject Analytics
✅ Daily Analytics (Daily Study Chart)
⬜ Weekly / Monthly rollup views (only daily + 7-day + 18-week heatmap exist)
✅ Heatmaps (GitHub-style study activity heatmap)
✅ Study Trends (Daily Study Chart with 7-day average comparison)

---

# Milestone 4 — Intelligence ✅

Status

Completed

Features

✅ Smart Revision (SM-2 spaced repetition)
✅ AI Suggestions (Gemini Weekly Review, Mistake Pattern Analysis)
✅ Recommended Topics (Focus: Next Actions widget)
✅ Dynamic Priority (weightage-aware yield scoring)
✅ Personalized Study Strategy (AI Weekly Review recommendations)
⬜ Confidence Prediction (only current confidence tracked, no forward prediction)
⬜ Readiness Score (intentionally not built — would require fabricating a
   percentile/rank estimate with no real cohort data to back it; flagged as
   dishonest UI in the redesign pass and skipped)

---

# Milestone 5 — Productivity (partial, by design)

Status

Partially completed / intentionally deprioritized

Features

⬜ Pomodoro (skipped — scope creep risk flagged during planning; the person's
   own Study Session Timer already covers focused-session tracking)
⬜ Focus Mode (skipped, same reasoning)
✅ Daily Goals (implicit via Daily Study Chart's 7-day average comparison)
⬜ Weekly Goals (not built)
⬜ Achievement System (skipped — flagged as scope creep during planning;
   Streak tracker covers the core motivational loop)
⬜ Motivation Dashboard (Streak badge + Daily Study insight cover this)
✅ Study Statistics (Analytics page)

---

# Milestone 6 — AI Mentor ✅ (scoped version)

Status

Completed (as three focused features rather than one combined "mentor" persona)

Features

✅ AI Weekly Review (Gemini, Analytics page)
✅ AI Mistake Pattern Analysis (Gemini, Mistake Vault)
✅ AI Concept Explanation (Gemini, per-topic on TopicCard when confidence < 50%)
⬜ AI Study Planner (not built — Today's Tasks + Revision Forecast are the
   deterministic planner; no separate LLM planner was added)
⬜ AI Doubt Assistant (not built — out of scope for now)
⬜ AI Performance Prediction (not built — same reasoning as Readiness Score
   above: no real cohort/rank data to predict against)

---

# Milestone 7 — Cloud ✅

Status

Completed

Features

✅ Authentication (Supabase email/password, AuthGate)
✅ Cloud Backup (Supabase push/pull sync + local JSON export/import)
✅ Multi Device Sync (any device, same login, Sync/Restore)
⬜ Mobile App — not a native app, but the site is a full installable PWA
   (works offline, home-screen install, same experience)
⬜ Desktop App (same as above — PWA covers this use case without a
   separate Electron build)

---

# Deployment ✅

Status

Completed

- vite-plugin-pwa configured (installable, offline app-shell, Supabase
  runtime caching)
- Deployed to Vercel (production)
- Gemini API key kept server-side via a Vercel serverless proxy in
  production builds

---

# Current Sprint

Current Goal

Daily usage — the product is feature-complete against the original roadmap.
No new feature work is planned until real usage surfaces a genuine gap.

Next Feature

None queued. Backlog ideas (not committed) are tracked in 07_CHANGELOG.md
under "Upcoming".

---

# Feature Priority

Priority 1

Core Study Features

Priority 2

Analytics

Priority 3

AI

Priority 4

Cloud

---

# Release Policy

Every milestone must satisfy:

✅ Build Pass

✅ No TypeScript Errors

✅ Runtime Tested

✅ Documentation Updated

✅ Git Commit

✅ Git Push

Only then a milestone is considered complete.

---

# Long-Term Vision

Prep_OS should become an intelligent personal operating system for competitive exam preparation.

The software should know:

- What to study
- When to study
- What to revise
- Which topics are weak
- How prepared the student is

without requiring manual planning.

# Deliberately Not Built

A few reference-inspired ideas were considered during the UI redesign and
explicitly rejected to avoid showing fabricated data:

- "Predicted AIR" / rank estimate — no real percentile/cohort data exists
  to back this; showing a number would be dishonest UI, not a real feature.
- A leaderboard — this is a single-user personal tool, not a multi-user
  product yet. Would only make sense post-GATE if PrepOS becomes a real
  multi-user product (see 01_PROJECT_CONTEXT.md long-term vision).
