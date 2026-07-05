# Prep_OS - Project Context

> Last Updated: 05 July 2026

---

# Project Overview

Prep_OS is an Offline-First GATE CSE Preparation Platform.

The goal is to become the best personal preparation system for GATE CSE.

Everything should work locally without requiring internet.

The application should be fast, modular, scalable and production-ready.

---

# Tech Stack

Frontend
- React
- TypeScript
- Vite
- TailwindCSS

Database
- Dexie.js
- IndexedDB

State
- React Hooks

Version Control
- Git
- GitHub

Branch
- develop

---

# Project Rules

Always follow these rules.

1. Never regenerate entire files unless absolutely necessary.

2. Modify the minimum amount of code.

3. Never break existing features.

4. Every new feature must be tested.

5. Every stable feature must be committed.

6. Every commit must be pushed.

7. Never leave the project in a broken state.

---

# Git Workflow

Feature

↓

Testing

↓

git add .

↓

git commit

↓

git push

---

# Current Folder Structure

src/

components/

pages/

db/

engine/

hooks/

types/

store/

utils/

---

# Completed Features

✅ Git Repository

✅ GitHub Repository

✅ develop branch

✅ Lecture CRUD

✅ Notes CRUD

✅ PYQ CRUD

✅ Revision CRUD

✅ Topic Progress Engine

✅ Confidence Engine

✅ PYQ Validation

✅ Subject Progress

✅ Dashboard

---

# Current Progress

Project is compiling successfully.

No TypeScript errors.

Development server working.

GitHub synced.

Current branch:
develop

---

# AI Development Rules

Whenever AI modifies code:

- Read this document first.
- Understand existing architecture.
- Preserve existing functionality.
- Modify only required code.
- Return production-ready code.

---

# Commit History

Commit 1

Initial Prep_OS project

Commit 2

Topic Progress Engine

Confidence Engine

PYQ Validation

---

# Current Milestone

Milestone 1 Completed

Stable Version

Ready for next feature.

---

# Database Architecture

Current Database Tables

resources

revisions

Future Tables

mistakes

daily_progress

settings

streak

---

# Resource Types

LECTURE

NOTES

PYQ

BOOK

LINK

---

# Progress Formula

Lecture = 40%

Notes = 30%

PYQ = 30%

Overall Progress

= Lecture × 0.40

+ Notes × 0.30

+ PYQ × 0.30

---

# Confidence Formula

If Revision does not exist

Confidence = PYQ Accuracy

Else

Confidence

=

60% PYQ Accuracy

+

40% Revision Quality

Revision Quality

=

EaseFactor / 2.5 × 100

Maximum

100%

---

# Validation Rules

Lecture

Watched Minutes

≤

Duration

PYQ

Correct

≤

Total

Incorrect

≤

Total

Correct + Incorrect

≤

Total

Accuracy

Never

>

100%

Confidence

Never

>

100%

Progress

Never

>

100%

---

# Current Engines

Subject Progress Engine

Topic Progress Engine

Revision Engine (SM-2)

---

# Current Hooks

useSubjectProgress

useTopicProgress

---

# Current Services

lectureService

notesService

pyqService

revisionService

---

# Stable Build

Project Status

Stable

Compile

PASS

TypeScript

PASS

GitHub

Synced

Branch

develop

Last Stable Milestone

Milestone 1
---

# Folder Responsibilities

## components/

Contains reusable UI components.

Examples

- TopicCard
- LectureModal
- NotesModal
- PyqModal
- RevisionModal

Rules

- UI only
- Never calculate business logic
- Never access database directly

---

## pages/

Contains application pages.

Examples

- Dashboard
- SubjectPage

Rules

- Compose components
- Never implement database logic

---

## db/

Contains all database services.

Examples

- lectureService
- notesService
- pyqService
- revisionService

Rules

- Only database CRUD
- No UI logic

---

## engine/

Contains business logic.

Examples

- progressEngine
- topicProgressEngine

Rules

- Only calculations
- Never render UI
- Never contain React code

---

## hooks/

Contains custom React hooks.

Examples

- useSubjectProgress
- useTopicProgress

Rules

- Connect React with engines
- No business calculations

---

## types/

Contains shared interfaces.

Rules

- Never put logic here
- Types only

---

# Development Rules

Before writing any code

Step 1

Understand the feature.

Step 2

Decide which folder is responsible.

Step 3

Modify minimum code.

Step 4

Compile project.

Step 5

Test manually.

Step 6

Commit.

Step 7

Push.

---

# Never Do

Never regenerate entire project.

Never rewrite working files.

Never duplicate logic.

Never mix UI with business logic.

Never put calculations inside React components.

Never put JSX inside engines.

Never access IndexedDB directly from UI.

Never break existing features.

---

# AI Rules

Whenever any AI works on this project:

1. Read PROJECT_CONTEXT.md completely.

2. Preserve architecture.

3. Preserve folder responsibilities.

4. Preserve Git workflow.

5. Preserve existing features.

6. Return production-ready code.

7. Never hallucinate missing code.

8. If information is missing, ask before changing.
---

# Long-Term Vision

Prep_OS is not a notes application.

Prep_OS is an intelligent personal GATE Operating System.

Every feature should help the student answer one question:

"What should I study next?"

The application should eventually become an AI-assisted preparation platform.

---

# Development Philosophy

Simple UI.

Powerful Backend.

Offline First.

Fast.

Minimal clicks.

Everything measurable.

Every study activity should generate data.

Every data point should improve future recommendations.

---

# Future Modules

Phase 1

✅ Lecture Tracking

✅ Notes

✅ PYQ

✅ Revision

✅ Progress

Phase 2

⬜ Mistake Notebook

⬜ Daily Planner

⬜ Today's Tasks

⬜ Revision Queue

⬜ Weak Topic Detection

⬜ Analytics Dashboard

⬜ Subject Insights

Phase 3

⬜ AI Mentor

⬜ Smart Recommendations

⬜ Personalized Study Plan

⬜ AI Revision Strategy

⬜ AI Weekly Report

Phase 4

⬜ Cloud Sync

⬜ Multi Device Support

⬜ Mobile App

⬜ Team Features

---

# Feature Development Workflow

Every feature must follow this order.

1.

Requirement

↓

2.

Architecture

↓

3.

Implementation

↓

4.

Testing

↓

5.

Bug Fix

↓

6.

Git Commit

↓

7.

Git Push

↓

8.

Update PROJECT_CONTEXT.md

---

# Definition of Done

A feature is COMPLETE only if:

✅ Compiles successfully

✅ No TypeScript errors

✅ No runtime errors

✅ UI tested

✅ Database tested

✅ Progress calculations verified

✅ Git committed

✅ Git pushed

✅ PROJECT_CONTEXT.md updated

Otherwise,

Feature Status = In Progress

---

# Current Development Status

Current Branch

develop

Current Version

Milestone 1

Status

Stable

Next Target

Milestone 2