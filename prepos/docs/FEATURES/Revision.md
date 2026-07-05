# Prep_OS Formulas

> This document contains every calculation used inside Prep_OS.

---

# Purpose

All mathematical calculations must be documented here.

Business logic should never be duplicated anywhere else.

Every Engine must follow these formulas.

---

# Topic Progress Formula

Topic Progress is calculated using three components.

Lecture

40%

Notes

30%

PYQ

30%

Formula

Progress

=

(Lecture × 0.40)

+

(Notes × 0.30)

+

(PYQ × 0.30)

Maximum

100%

Minimum

0%

---

# Subject Progress Formula

Each topic progress contributes equally inside its subject.

Formula

Subject Progress

=

Average of all Topic Progress

---

# Lecture Progress Formula

Lecture Progress

=

Watched Minutes

÷

Duration Minutes

×

100

Maximum

100%

Minimum

0%

---

# Notes Progress Formula

If Notes exist

100%

Else

0%

---

# PYQ Accuracy Formula

Accuracy

=

Correct Answers

÷

Total Questions

×

100

Maximum

100%

Minimum

0%

---

# Confidence Formula

If Revision does not exist

Confidence

=

PYQ Accuracy

Else

Confidence

=

(60% × PYQ Accuracy)

+

(40% × Revision Quality)

Maximum

100%

Minimum

0%

---

# Revision Quality Formula

Revision Quality

=

EaseFactor

÷

2.5

×

100

Maximum

100%

Minimum

0%

---

# SM-2 Revision Algorithm

Initial Values

Ease Factor

2.5

Interval

0

Review Count

0

---

If Quality >= 3

Review 1

Interval = 1 Day

Review 2

Interval = 6 Days

Review 3+

Interval

=

Previous Interval

×

Ease Factor

---

If Quality < 3

Review Count

=

0

Interval

=

1 Day

---

Ease Factor Update

EaseFactor

=

EaseFactor

+

0.1

-

(5 - Quality)

×

(0.08 + (5 - Quality) × 0.02)

Minimum EaseFactor

1.3

---

# Validation Rules

Lecture

Watched Minutes

≤

Duration

---

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

---

Progress

Never greater than

100%

---

Accuracy

Never greater than

100%

---

Confidence

Never greater than

100%

---

# Future Formulas

Study Score

Weak Topic Score

Revision Priority

Difficulty Index

Consistency Score

Learning Velocity

Burnout Score

AI Recommendation Score

---

# Formula Change Policy

Whenever any formula changes:

1. Update this document.

2. Update corresponding Engine.

3. Test calculations.

4. Update CHANGELOG.

5. Commit.

6. Push.