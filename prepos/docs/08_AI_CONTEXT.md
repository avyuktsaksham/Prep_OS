# Prep_OS AI Context

> This document defines how every AI assistant must work on Prep_OS.

---

# Purpose

Prep_OS is a long-term production project.

The goal is to build a scalable, maintainable and offline-first GATE CSE Operating System.

Every AI must preserve the architecture and existing functionality.

---

# Read Order

Before writing any code, read:

1. 00_MASTER_INDEX.md

2. 01_PROJECT_CONTEXT.md

3. 02_ARCHITECTURE.md

4. 03_DATABASE.md

5. 04_FORMULAS.md

6. 05_DEVELOPMENT_RULES.md

7. Current Feature Documentation

Only after understanding these documents should implementation begin.

---

# Architecture Rules

Respect the layered architecture.

UI

↓

Hooks

↓

Engine

↓

Database Service

↓

IndexedDB

Never bypass layers.

---

# Existing Architecture

Frontend

- React
- TypeScript
- Vite
- TailwindCSS

Database

- Dexie
- IndexedDB

Business Logic

- Engine Layer

React Logic

- Hooks

---

# Existing Features

Current stable features include:

- Dashboard
- Subject Page
- Topic Cards
- Lecture CRUD
- Notes CRUD
- PYQ CRUD
- Revision CRUD
- Topic Progress Engine
- Subject Progress Engine
- Confidence Engine
- PYQ Validation

These features must never be broken.

---

# Modification Rules

Always modify the minimum amount of code.

Prefer extending existing code.

Never rewrite an entire file unless explicitly requested.

Preserve existing functionality.

Avoid duplicate logic.

---

# Code Quality Rules

Produce production-ready code.

Avoid unnecessary complexity.

Prefer readability over cleverness.

Use TypeScript properly.

Avoid "any".

Reuse existing types.

---

# Folder Responsibilities

components

UI only

hooks

React logic

engine

Business calculations

db

CRUD

types

Interfaces

utils

Reusable helpers

Never mix responsibilities.

---

# AI Behaviour

If context is missing:

Ask.

Do not guess.

If implementation details are unclear:

Ask.

Do not invent.

If a feature may break existing functionality:

Warn before changing.

---

# Response Rules

Unless requested otherwise:

Do not regenerate entire files.

Return only the modified code.

Keep responses minimal.

Explain only when asked.

---

# Development Workflow

Requirement

↓

Architecture

↓

Implementation

↓

Testing

↓

Git Commit

↓

Git Push

↓

Documentation Update

---

# Completion Checklist

Before considering a feature complete:

□ Project builds successfully

□ TypeScript errors = 0

□ Runtime tested

□ Existing features verified

□ Documentation updated

□ Git commit created

□ Git pushed

---

# Long-Term Goal

Prep_OS should evolve into an intelligent AI-powered GATE Operating System capable of:

- Planning study sessions
- Scheduling revisions
- Detecting weak topics
- Tracking progress
- Predicting readiness
- Guiding preparation with minimal manual effort

Every new feature should move the project closer to this vision.