// src/engine/heatmapEngine.ts
import { supabase } from '../lib/supabaseClient';

export interface HeatmapDay {
  dateKey: string;
  date: Date;
  minutes: number;
  level: 0 | 1 | 2 | 3 | 4;
}

function toLocalDateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function minutesToLevel(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes <= 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 90) return 2;
  if (minutes < 180) return 3;
  return 4;
}

/**
 * Returns a flat day-by-day array (oldest to newest, today last) covering
 * the last `weeksBack` weeks, aligned to start on a Sunday — ready to be
 * chunked into GitHub-style weekly columns by the UI.
 */
export async function getStudyHeatmap(weeksBack = 18): Promise<HeatmapDay[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Align the range start to the Sunday on/before (today - weeksBack weeks)
  const rangeStart = new Date(today);
  rangeStart.setDate(rangeStart.getDate() - weeksBack * 7);
  rangeStart.setDate(rangeStart.getDate() - rangeStart.getDay());

  const { data, error } = await supabase
    .from('prepos_sessions')
    .select('duration_seconds, created_at')
    .eq('user_email', user.email)
    .gte('created_at', rangeStart.toISOString());

  if (error) {
    console.error('Error fetching study heatmap:', error);
    return [];
  }

  const minutesByDay = new Map<string, number>();
  for (const row of data ?? []) {
    const d = new Date(row.created_at);
    const key = toLocalDateKey(d);
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + (row.duration_seconds || 0) / 60);
  }

  const days: HeatmapDay[] = [];
  const cursor = new Date(rangeStart);

  while (cursor <= today) {
    const key = toLocalDateKey(cursor);
    const minutes = Math.round(minutesByDay.get(key) ?? 0);

    days.push({
      dateKey: key,
      date: new Date(cursor),
      minutes,
      level: minutesToLevel(minutes),
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}
