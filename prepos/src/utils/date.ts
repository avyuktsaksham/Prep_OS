export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// GATE 2027 exam date — update here if the official date changes.
export const EXAM_DATE = new Date(2027, 1, 6); // Feb 6, 2027

export function getDaysUntilExam(): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((EXAM_DATE.getTime() - today.getTime()) / msPerDay));
}

export function formatFullDate(d: Date = new Date()): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatClockTime(d: Date = new Date()): string {
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}