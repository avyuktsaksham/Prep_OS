# Revision Module

---

## Purpose

The Revision Module manages spaced repetition for every topic using the SM-2 algorithm.

Its objective is to improve long-term retention by scheduling revisions intelligently.

---

## Features

- Create Revision Schedule
- Update Revision
- Delete Revision
- SM-2 Algorithm
- Confidence Calculation
- Automatic Next Review Date

---

## Database

Table

revisions

---

## Fields

id

topicId

nextReviewDate

interval

easeFactor

reviewCount

---

## Algorithm

SM-2

---

## Initial Values

Ease Factor

2.5

Interval

0

Review Count

0

---

## Confidence Formula

If Revision does not exist

↓

Confidence = PYQ Accuracy

Else

↓

Confidence

=

60% PYQ Accuracy

+

40% Revision Quality

---

## Revision Quality

Revision Quality

=

EaseFactor

÷

2.5

×

100

Maximum

100%

---

## UI

Revision Modal

Topic Card

Confidence Badge

Revision Timeline

---

## Services

revisionService

---

## Current Limitations

Single revision schedule per topic.

Manual review only.

No reminder system.

---

## Known Bugs

None

---

## Future Improvements

Notification System

Calendar Integration

AI Revision Suggestions

Missed Revision Recovery

Priority Queue

Revision Analytics

Daily Revision Dashboard

---

## Current Status

Stable

Production Ready

Tested