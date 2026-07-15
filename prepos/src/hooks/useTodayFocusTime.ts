// src/hooks/useTodayFocusTime.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useTodayFocusTime() {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTodayFocusTime = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // FIX: Get exact local midnight, let JS convert it properly to UTC for Supabase
      const localStartOfDay = new Date();
      localStartOfDay.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('prepos_sessions')
        .select('duration_seconds')
        .eq('user_email', user.email)
        .gte('created_at', localStartOfDay.toISOString());

      if (error) {
        console.error("Error fetching today's focus time:", error);
        return;
      }

      if (data) {
        const total = data.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
        setTotalSeconds(total);
      }
    } catch (error) {
      console.error("Failed to fetch focus time", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayFocusTime();

    // Refetch whenever the tab regains focus/visibility, or the local
    // calendar date has silently rolled over while the tab was open.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchTodayFocusTime();
      }
    };
    window.addEventListener('focus', fetchTodayFocusTime);
    window.addEventListener('prepos:session-saved', fetchTodayFocusTime);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', fetchTodayFocusTime);
      window.removeEventListener('prepos:session-saved', fetchTodayFocusTime);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchTodayFocusTime]);

  return { totalSeconds, loading, refetch: fetchTodayFocusTime };
}