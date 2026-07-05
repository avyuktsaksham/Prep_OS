# Prep_OS Database

> This document defines the complete database architecture of Prep_OS.

---

# Database

Engine

- IndexedDB

Library

- Dexie.js

Type

- Offline First

---

# Current Tables

## resources

Purpose

Stores every study resource.

Resource Types

- LECTURE
- NOTES
- PYQ
- BOOK
- LINK

Fields

- id
- topicId
- type
- title
- url
- createdAt

Lecture Fields

- durationMinutes
- watchedMinutes
- completed
- lastWatchedAt

Notes Fields

- markdown

PYQ Fields

- totalQuestions
- correct
- incorrect
- accuracy

---

## revisions

Purpose

Stores spaced repetition schedule.

Algorithm

SM-2

Fields

- id
- topicId
- nextReviewDate
- interval
- easeFactor
- reviewCount

---

# Future Tables

## mistakes

Purpose

Store mistakes for later revision.

Planned Fields

- id
- topicId
- note
- createdAt
- resolved

---

## streak

Purpose

Track study streak.

Planned Fields

- id
- currentStreak
- longestStreak
- lastStudyDate

---

## daily_progress

Purpose

Track daily study analytics.

Planned Fields

- id
- date
- studyMinutes
- lecturesCompleted
- notesWritten
- pyqsSolved
- revisionsDone

---

## settings

Purpose

Application settings.

Planned Fields

- key
- value

---

# Relationships

Topic

↓

Resources

1 → Many

---

Topic

↓

Revision

1 → 1

---

Topic

↓

Mistakes

1 → Many

---

# Database Rules

Every resource belongs to exactly one Topic.

Every Topic can have only one Revision Schedule.

Every database write must go through db services.

Components must never access IndexedDB directly.

---

# Indexing Strategy

Indexed Fields

- topicId
- type
- createdAt
- nextReviewDate

Future Indexes

- date
- resolved
- currentStreak

---

# Current Services

lectureService

notesService

pyqService

revisionService

---

# Future Services

mistakeService

streakService

analyticsService

settingsService

plannerService

---

# Migration Rules

Never delete existing tables.

Only create new versions using Dexie migrations.

Always keep backward compatibility.

---

# Database Status

Current Version

Stable

Schema

Normalized

Offline Support

Complete

Migration Ready

Yes