# Prep_OS Development Rules

> This document defines the engineering standards for Prep_OS.

---

# Core Principles

Every change should make the project:

- Cleaner
- Safer
- Easier to maintain
- Easier to extend

Never sacrifice architecture for short-term convenience.

---

# General Rules

1. Never break existing features.

2. Modify the minimum required code.

3. Prefer improving existing code instead of rewriting it.

4. Avoid duplicate logic.

5. Every feature must have a single responsibility.

6. Keep the project modular.

---

# React Rules

Components should only render UI.

Components should never:

- Calculate business logic
- Directly access IndexedDB
- Contain duplicated calculations

Use Hooks whenever state or computed data is required.

---

# Hooks Rules

Hooks connect React with the Business Layer.

Hooks should:

- Read data
- Call Engines
- Return computed state

Hooks should never contain UI.

---

# Engine Rules

Engines contain business logic.

Allowed

- Calculations
- Algorithms
- Progress logic
- Confidence logic
- Scheduling

Not Allowed

- JSX
- React Hooks
- UI Rendering
- Database Writes

---

# Database Rules

All database operations must go through db services.

Never call Dexie directly from Components.

Never mix CRUD with UI.

---

# TypeScript Rules

Avoid "any".

Use interfaces whenever possible.

Reuse existing types before creating new ones.

---

# Naming Convention

Components

PascalCase

Example

TopicCard.tsx

Hooks

camelCase starting with use

Example

useTopicProgress.ts

Services

camelCase ending with Service

Example

lectureService.ts

Engines

camelCase ending with Engine

Example

topicProgressEngine.ts

---

# Folder Ownership

components

UI

pages

Screens

hooks

React Logic

engine

Business Logic

db

Database

types

Interfaces

utils

Reusable Helpers

---

# Error Handling

Every async function must use try/catch.

Never silently ignore errors.

Log useful messages during development.

---

# Testing Checklist

Before every Commit:

Project Compiles

TypeScript Errors = 0

Runtime Errors = 0

Feature Tested

Database Tested

UI Tested

---

# Git Rules

Every stable feature

↓

git add .

↓

git commit

↓

git push

Never leave uncommitted working code for multiple days.

---

# Documentation Rules

Whenever architecture changes:

Update documentation.

Whenever formulas change:

Update FORMULAS.md

Whenever database changes:

Update DATABASE.md

Whenever feature is completed:

Update CHANGELOG.md

---

# Code Review Checklist

Before finishing any feature ask:

Is the code readable?

Is the architecture preserved?

Is duplicate logic removed?

Can another developer understand this?

Does it compile?

Has it been tested?

---

# Definition of Ready

A feature is ready for implementation only when:

Requirement is clear.

Architecture is decided.

Folder responsibility is known.

Implementation plan exists.

---

# Definition of Done

A feature is complete only if:

✓ Code Complete

✓ Build Pass

✓ Runtime Pass

✓ UI Tested

✓ Database Tested

✓ Git Commit

✓ Git Push

✓ Documentation Updated

---

# Engineering Philosophy

Write code that future-you can understand.

Optimize for maintainability before cleverness.

Keep every layer independent.

Think long-term.