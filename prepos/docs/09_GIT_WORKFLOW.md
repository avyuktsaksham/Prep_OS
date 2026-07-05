# Prep_OS Git Workflow

> This document defines the Git workflow for Prep_OS.

---

# Branch Strategy

Main Branch

main

Purpose

Production Ready Code

---

Development Branch

develop

Purpose

Daily Development

Current Working Branch

develop

---

Future Feature Branches

feature/<feature-name>

Examples

feature/mistake-notebook

feature/analytics

feature/ai-mentor

feature/streak-system

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

Git Add

↓

Git Commit

↓

Git Push

↓

Documentation Update

---

# Daily Workflow

1.

Open Project

↓

2.

git pull

↓

3.

npm install (only if required)

↓

4.

npm run dev

↓

5.

Implement Feature

↓

6.

Test

↓

7.

Commit

↓

8.

Push

---

# Commit Message Convention

Feature

feat: add revision queue

Bug Fix

fix: correct pyq validation

Refactor

refactor: optimize topic progress engine

Documentation

docs: update architecture documentation

Performance

perf: optimize dashboard rendering

Style

style: improve topic card layout

---

# Commit Rules

Every commit should represent one logical change.

Never mix unrelated changes in a single commit.

Commit only working code.

Never commit broken builds.

---

# Push Rules

Push after every stable feature.

Do not accumulate many local commits without pushing.

GitHub should always contain a recent working version.

---

# Rollback Strategy

If a feature breaks the project:

Identify the last stable commit.

Checkout or revert to that commit.

Fix the issue.

Create a new commit.

Never rewrite Git history unless absolutely necessary.

---

# Pull Request Strategy (Future)

Feature Branch

↓

Review

↓

Merge into develop

↓

Testing

↓

Merge into main

---

# Release Workflow

Milestone Complete

↓

Full Testing

↓

Documentation Updated

↓

Git Tag

↓

Release

---

# Recovery Rules

Before making major architectural changes:

Commit current state.

Push to GitHub.

Only then start large refactoring.

---

# Current Repository Status

Repository

Prep_OS

Primary Development Branch

develop

Production Branch

main

Status

Stable

---

# Git Philosophy

Commit often.

Push frequently.

Keep history clean.

Never lose working code.

Every stable milestone should always exist on GitHub.