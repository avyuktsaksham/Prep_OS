# Prep_OS Changelog

> This document records every significant change made to Prep_OS.

---

# Versioning Format

Version

Major.Minor.Patch

Example

v1.2.0

Meaning

Major

Breaking Changes

Minor

New Features

Patch

Bug Fixes

---

# v0.1.0

Status

Released

Date

05 July 2026

Milestone

Foundation

Changes

- Initial Project Setup
- Git Repository Created
- GitHub Repository Connected
- Develop Branch Created
- React + TypeScript + Vite Setup
- TailwindCSS Configured
- Dexie Database Setup

---

# v0.2.0

Status

Released

Date

05 July 2026

Changes

Lecture Module

- Lecture CRUD
- Watch Progress Tracking
- Completion Tracking

Notes Module

- Notes CRUD
- Markdown Storage

PYQ Module

- PYQ CRUD
- Accuracy Calculation

Revision Module

- SM-2 Revision System
- Revision CRUD

---

# v0.3.0

Status

Released

Date

05 July 2026

Changes

Progress System

- Topic Progress Engine
- Subject Progress Engine
- Confidence Engine

Validation

- PYQ Validation
- Progress Validation
- Confidence Validation

UI

- Dashboard
- Subject Page
- Topic Cards
- Timeline Improvements

---

# Upcoming

v1.1.0 (Ideas, not yet started)

Accuracy vs Coverage bubble matrix (Analytics)

Mistake categorization (structured pattern breakdown, not just free-text AI analysis)

Stored question options + user's selected answer on mistakes (for a richer review card)

---

# v1.0.0

Status

Released

Date

15 July 2026

Milestone

Full product: Intelligence + Cloud + AI + Redesign + Deployment

This release covers everything built across Milestones 2-7 in a single continuous
build sprint. Bumped straight to v1.0.0 since the app is now feature-complete
against the original roadmap, cloud-synced, AI-assisted, redesigned, and
publicly deployed as an installable PWA.

Bug Fixes (Phase 0)

- Fixed SubjectPage header showing hardcoded 0% instead of real subject progress
- Fixed analyticsEngine/topicProgressEngine formula mismatch (unified 40% Lecture /
  30% Notes / 30% PYQ weighting everywhere)
- Fixed weightage fallback in analyticsEngine (was always 0, now reads real
  gate.json weightage)
- Fixed a later regression where subject progress only averaged "touched" topics
  instead of all topics in the subject, inflating progress numbers
- Fixed a `lectureScore <= 1 → *100` hack that corrupted legitimate low
  (0-1%) lecture progress into 100%

Data Safety

- Local JSON Export/Import (backupService.ts)
- Supabase cloud sync — full email/password auth (AuthGate), push/pull sync
  for resources, revisions, and settings (cloudSyncService.ts)
- Study session log (prepos_sessions table) synced to Supabase

Study Session Tracker

- Live session timer (FocusBanner) with Start/Pause/Finish, persists across
  refresh via localStorage, saves completed sessions to Supabase

Multiple Lectures Per Topic

- lectureService.ts rewritten for 1-to-many lecture resources per topic
- All four progress engines (topicProgressEngine, progressEngine,
  analyticsEngine, todayTaskEngine) updated to average across all lectures
  for a topic (lectureProgress.ts shared helper)
- TopicCard UI supports add/edit/delete of individual lectures

Weightage-Aware Priority

- todayTaskEngine now scores tasks by `weightage * (100 - topicProgress)`
  ("yield") so high-marks, low-progress topics surface first
- "High Yield" badge on Dashboard's top task

Streak & Consistency

- useStreak hook computes current/longest streak from session history
- Dashboard header streak badge (🔥)

Revision Lookahead

- 7-day forward-looking revision forecast (revisionLookaheadEngine.ts),
  grouped into Overdue / Today / Tomorrow / day-by-day buckets

Weak-Subject Alerts

- weakTopicEngine.ts flags subjects that are high-weightage AND meaningfully
  behind the person's own average progress (relative, not an arbitrary
  absolute cutoff) — stays silent until there's enough real progress
  divergence to be meaningful

Daily Study Chart & Heatmap

- 14-day bar chart of daily study minutes with a rule-based "you're above/
  below your average, study X more today" insight (dailyStudyEngine.ts)
- GitHub-style 18-week study activity heatmap (heatmapEngine.ts)

Focus / Next Actions

- Dashboard hero widget surfacing the top 3 highest-priority tasks

Gemini AI Integration

- AI Weekly Review (Analytics page) — data-grounded weekly summary +
  action items, generated from the person's real AnalyticsSnapshot
- AI Mistake Pattern Analysis (Mistake Vault) — analyzes the full mistake
  log for recurring patterns
- AI Concept Explanation — per-topic "Explain this concept" button, shown
  when confidence is below 50%
- Production security: Gemini calls go through a Vercel serverless proxy
  (api/gemini.ts) in production builds so the API key never reaches the
  browser bundle; local dev still calls Gemini directly for convenience

Full UI Redesign — "Mission Control" theme

- Dark, near-black design system (Tailwind v4 @theme tokens): void/panel
  surfaces, signal (blue) + pulse (purple) accents, Space Grotesk display
  font, JetBrains Mono for all numeric/timer readouts
- New lightning-bolt logo + favicon + PWA icons
- Sidebar restyled with grouped nav, consolidated Sync/Backup panel
- Dashboard header shows live date, live clock, and days-to-GATE-2027
  countdown
- Every page (Dashboard, Analytics, Mistake Vault, Subject Page, Topic
  Card, all modals, AuthGate) converted to the dark theme

PWA & Deployment

- vite-plugin-pwa configured: installable app, offline app-shell caching,
  Supabase network-first runtime caching
- Deployed to Vercel (production URL live)

---



# Changelog Rules

Every completed feature must be added here.

Every bug fix must be recorded.

Every architectural change must be recorded.

Every release must have a version number.

Never delete previous entries.

History must remain permanent.