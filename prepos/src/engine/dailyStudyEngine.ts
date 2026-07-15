// src/engine/dailyStudyEngine.ts
import { supabase } from '../lib/supabaseClient';

export interface DailyStudyPoint {
  dateKey: string;
  label: string;
  minutes: number;
  isToday: boolean;
}

export interface DailyStudyTrend {
  points: DailyStudyPoint[];
  todayMinutes: number;
  last7DayAvgMinutes: number;
  insight: string;
}

function toLocalDateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Fetches the last `daysBack` days of study session data (grouped by local
 * calendar day) and generates a simple, rule-based nudge comparing today's
 * study time against the person's own recent average.
 */
export async function getDailyStudyTrend(daysBack = 14): Promise<DailyStudyTrend> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const emptyResult: DailyStudyTrend = {
    points: [],
    todayMinutes: 0,
    last7DayAvgMinutes: 0,
    insight: 'Sign in to see your study trend.',
  };

  if (!user?.email) return emptyResult;

  const now = new Date();
  const startOfRange = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  startOfRange.setDate(startOfRange.getDate() - (daysBack - 1));

  const { data, error } = await supabase
    .from('prepos_sessions')
    .select('duration_seconds, created_at')
    .eq('user_email', user.email)
    .gte('created_at', startOfRange.toISOString());

  if (error) {
    console.error('Error fetching daily study trend:', error);
    return emptyResult;
  }

  // Bucket seconds by local calendar day
  const minutesByDay = new Map<string, number>();
  for (const row of data ?? []) {
    const d = new Date(row.created_at);
    const key = toLocalDateKey(d);
    const prev = minutesByDay.get(key) ?? 0;
    minutesByDay.set(key, prev + (row.duration_seconds || 0) / 60);
  }

  // Build a continuous day-by-day series (fills in zero-study days too)
  const points: DailyStudyPoint[] = [];
  const todayKey = toLocalDateKey(now);

  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    d.setDate(d.getDate() - i);
    const key = toLocalDateKey(d);
    const minutes = Math.round(minutesByDay.get(key) ?? 0);

    points.push({
      dateKey: key,
      label: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
      minutes,
      isToday: key === todayKey,
    });
  }

  const todayMinutes = points[points.length - 1]?.minutes ?? 0;

  // Average of the 7 days BEFORE today (excludes today so it's a fair comparison)
  const priorSevenDays = points.slice(-8, -1);
  const last7DayAvgMinutes =
    priorSevenDays.length > 0
      ? Math.round(
          priorSevenDays.reduce((sum, p) => sum + p.minutes, 0) / priorSevenDays.length
        )
      : 0;

  const insight = buildInsight(todayMinutes, last7DayAvgMinutes, now.getHours());

  return { points, todayMinutes, last7DayAvgMinutes, insight };
}

function buildInsight(todayMinutes: number, avgMinutes: number, currentHour: number): string {
  if (avgMinutes === 0) {
    if (todayMinutes === 0) {
      return "Abhi tak koi study data nahi hai. Timer start karke aaj se track karna shuru kar.";
    }
    return `Aaj ${todayMinutes} min padha — solid start, ise consistent rakh.`;
  }

  const isLateInDay = currentHour >= 18;
  const deficit = avgMinutes - todayMinutes;

  if (todayMinutes >= avgMinutes) {
    const extra = todayMinutes - avgMinutes;
    return `Aaj tu apne 7-din average (${avgMinutes} min) se ${extra} min aage hai. Bohot badhiya, isi tarah chal.`;
  }

  if (isLateInDay && deficit > 15) {
    return `Aaj tu apne average se ${deficit} min peeche hai aur din khatam ho raha hai — kam se kam ${Math.min(deficit, 45)} min aur nikal le taaki streak aur pace dono maintain ho.`;
  }

  if (deficit > 15) {
    return `Abhi tak aaj sirf ${todayMinutes} min hue hain, average ${avgMinutes} min hai. Din baaki hai — ${deficit} min ka gap pura kar le.`;
  }

  return `Aaj ${todayMinutes} min ho chuke hain, apne average (${avgMinutes} min) ke kaafi kareeb hai. Thoda aur laga toh aage nikal jayega.`;
}
