# Prep_OS AI Coding Instructions

These instructions apply to every AI assistant working on this repository.

---

# Project

Prep_OS is an Offline-First GATE CSE Preparation Operating System.

The project follows a layered architecture and must remain modular.

---

# Before Writing Code

Always read:

docs/00_MASTER_INDEX.md

↓

docs/01_PROJECT_CONTEXT.md

↓

docs/02_ARCHITECTURE.md

↓

docs/03_DATABASE.md

↓

docs/04_FORMULAS.md

↓

docs/05_DEVELOPMENT_RULES.md

↓

Relevant Feature Documentation

Only after understanding the project should implementation begin.

---

# Architecture

UI

↓

Hooks

↓

Business Engine

↓

Database Services

↓

IndexedDB

Never bypass architecture.

---

# Responsibilities

components/

UI only

pages/

Screens

hooks/

React logic

engine/

Business logic

db/

CRUD

types/

Interfaces

utils/

Helpers

Never mix responsibilities.

---

# Coding Rules

Never regenerate an entire file unless explicitly requested.

Modify only the required code.

Reuse existing code whenever possible.

Avoid duplicate logic.

Prefer readability over cleverness.

Use TypeScript properly.

Avoid any.

Reuse existing interfaces.

---

# React Rules

Components render UI only.

Business calculations belong inside Engines.

Database access belongs inside Services.

State synchronization belongs inside Hooks.

---

# Database Rules

Never access Dexie directly from Components.

Always use Services.

Never duplicate CRUD logic.

---

# Validation Rules

Progress ≤ 100%

Confidence ≤ 100%

Accuracy ≤ 100%

Correct ≤ Total

Incorrect ≤ Total

Correct + Incorrect ≤ Total

---

# Quality Checklist

Before finishing:

Project compiles.

No TypeScript errors.

No runtime errors.

Existing features still work.

Architecture preserved.

Documentation updated.

---

# Git Workflow

Feature

↓

Test

↓

git add .

↓

git commit

↓

git push

↓

Update CHANGELOG

---

# Response Style

Unless requested otherwise:

Return only modified code.

Avoid rewriting complete files.

Keep explanations concise.

Preserve existing architecture.

Never invent missing code.

Ask questions if required.

---

# Long-Term Goal

Build the best AI-assisted Offline GATE CSE Operating System.

Every new feature should improve planning, revision, analytics or learning.