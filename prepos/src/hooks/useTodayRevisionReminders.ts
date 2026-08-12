// src/hooks/useTodayRevisionReminders.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { getTodayRevisionReminders } from '../engine/revisionReminderEngine';
import type { RevisionReminder } from '../engine/revisionReminderEngine';

export function useTodayRevisionReminders(): RevisionReminder[] {
  const reminders = useLiveQuery(() => getTodayRevisionReminders(), [], []);
  return reminders ?? [];
}
