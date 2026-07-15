// src/hooks/useStreak.ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  studiedToday: boolean;
  loading: boolean;
  refetch: () => void;
}

function toLocalDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcA - utcB) / msPerDay);
}

export function useStreak(): StreakData {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [studiedToday, setStudiedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('prepos_sessions')
        .select('created_at')
        .eq('user_email', user.email)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching streak data:', error);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setCurrentStreak(0);
        setLongestStreak(0);
        setStudiedToday(false);
        setLoading(false);
        return;
      }

      // Collect unique active dates (as actual Date objects at local midnight)
      const uniqueDayMap = new Map<string, Date>();
      for (const row of data) {
        const d = new Date(row.created_at);
        const key = toLocalDateKey(row.created_at);
        if (!uniqueDayMap.has(key)) {
          uniqueDayMap.set(key, new Date(d.getFullYear(), d.getMonth(), d.getDate()));
        }
      }

      const activeDays = Array.from(uniqueDayMap.values()).sort(
        (a, b) => a.getTime() - b.getTime()
      );

      // Longest streak: scan consecutive-day runs
      let longest = 1;
      let run = 1;
      for (let i = 1; i < activeDays.length; i++) {
        if (daysBetween(activeDays[i], activeDays[i - 1]) === 1) {
          run += 1;
        } else {
          run = 1;
        }
        longest = Math.max(longest, run);
      }

      // Current streak: walk backwards from today
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const lastActive = activeDays[activeDays.length - 1];
      const gapFromToday = daysBetween(todayMidnight, lastActive);

      let current = 0;
      const studiedTodayFlag = gapFromToday === 0;

      // Streak is "alive" if last active day was today or yesterday
      if (gapFromToday <= 1) {
        current = 1;
        for (let i = activeDays.length - 1; i > 0; i--) {
          if (daysBetween(activeDays[i], activeDays[i - 1]) === 1) {
            current += 1;
          } else {
            break;
          }
        }
      }

      setCurrentStreak(current);
      setLongestStreak(longest);
      setStudiedToday(studiedTodayFlag);
    } catch (err) {
      console.error('Failed to compute streak:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreak();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchStreak();
      }
    };
    window.addEventListener('focus', fetchStreak);
    window.addEventListener('prepos:session-saved', fetchStreak);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', fetchStreak);
      window.removeEventListener('prepos:session-saved', fetchStreak);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchStreak]);

  return { currentStreak, longestStreak, studiedToday, loading, refetch: fetchStreak };
}
