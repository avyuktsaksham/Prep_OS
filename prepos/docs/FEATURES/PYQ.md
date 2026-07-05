# PYQ Module

---

## Purpose

The PYQ Module stores Previous Year Question practice for every topic.

It measures practice performance using accuracy and contributes to Topic Progress and Confidence calculations.

---

## Features

- Add PYQ
- Edit PYQ
- Delete PYQ
- Accuracy Calculation
- Live Accuracy Preview
- Validation
- Offline Storage

---

## Database

Table

resources

Type

PYQ

---

## Fields

title

totalQuestions

correct

incorrect

accuracy

createdAt

---

## Accuracy Formula

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

## Validation Rules

Correct ≤ Total Questions

Incorrect ≤ Total Questions

Correct + Incorrect ≤ Total Questions

Accuracy ≤ 100%

Invalid data cannot be saved.

---

## Progress Contribution

Topic Progress

30%

Confidence

60%

---

## UI

PyqModal

Topic Card

Accuracy Badge

Validation Messages

---

## Services

pyqService

---

## Current Limitations

Only one PYQ resource per Topic.

No question-wise tracking.

No difficulty analysis.

---

## Known Bugs

None

---

## Future Improvements

Question-wise Analysis

Difficulty Tracking

Year-wise Statistics

Topic-wise Weakness Detection

Negative Marking

Attempt History

Smart Insights

AI Performance Analysis

---

## Current Status

Stable

Production Ready

Tested