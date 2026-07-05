# Prep_OS Architecture

> This document defines the architecture of Prep_OS.

---

# Architecture Overview

Prep_OS follows a layered architecture.

```

UI (Components & Pages)

↓

Hooks

↓

Business Engine

↓

Database Services

↓

IndexedDB (Dexie)

```

Each layer has a single responsibility.

---

# Folder Structure

```

src/

├── components/

├── pages/

├── db/

├── engine/

├── hooks/

├── types/

├── data/

├── assets/

└── utils/

```

---

# Folder Responsibilities

## components/

Contains reusable UI.

Examples

- TopicCard
- LectureModal
- NotesModal
- PyqModal
- RevisionModal

Rules

- UI only
- No calculations
- No database queries

---

## pages/

Contains application pages.

Examples

- Dashboard
- SubjectPage

Rules

- Compose components
- Handle routing
- No business logic

---

## db/

Responsible for all database operations.

Examples

- lectureService
- notesService
- pyqService
- revisionService

Rules

- CRUD only
- No UI
- No calculations

---

## engine/

Contains business logic.

Examples

- progressEngine
- topicProgressEngine

Rules

- Pure calculations
- No React
- No JSX
- No database writes

---

## hooks/

Bridges React and Engine.

Examples

- useSubjectProgress
- useTopicProgress

Rules

- Call engines
- Return computed state
- No calculations

---

## types/

Contains shared interfaces.

Rules

- Interfaces only
- No functions

---

## data/

Contains static project data.

Example

- gate.json

Rules

- Read-only

---

## utils/

Contains helper utilities.

Rules

- Reusable functions
- Independent from UI

---

# Data Flow

User Action

↓

React Component

↓

Custom Hook

↓

Business Engine

↓

Database Service

↓

IndexedDB

↓

Hook Refresh

↓

UI Update

---

# Architecture Rules

Every feature must respect the following:

UI

↓

Hooks

↓

Engine

↓

DB

↓

Storage

Never skip layers.

---

# Forbidden

Never access IndexedDB directly from Components.

Never calculate progress inside Components.

Never write React code inside Engine.

Never put JSX inside Hooks.

Never mix UI and business logic.

Never duplicate calculations.

---

# Current Architecture

Presentation Layer

✅ Components

Application Layer

✅ Hooks

Business Layer

✅ Engines

Persistence Layer

✅ Dexie Services

Storage Layer

✅ IndexedDB

---

# Design Goal

Every layer should be replaceable without affecting the others.

Loose coupling.

High cohesion.

Easy maintenance.

Production ready.