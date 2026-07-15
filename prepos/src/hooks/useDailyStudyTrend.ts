// src/hooks/useDailyStudyTrend.ts
import { useCallback, useEffect, useState } from 'react';
import { getDailyStudyTrend } from '../engine/dailyStudyEngine';
import type { DailyStudyTrend } from '../engine/dailyStudyEngine';

const EMPTY: DailyStudyTrend = {
  points: [],
  todayMinutes: 0,
  last7DayAvgMinutes: 0,
  insight: '',
};

export function useDailyStudyTrend(daysBack = 14) {
  const [trend, setTrend] = useState<DailyStudyTrend>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDailyStudyTrend(daysBack);
      setTrend(result);
    } finally {
      setLoading(false);
    }
  }, [daysBack]);

  useEffect(() => {
    refetch();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    window.addEventListener('focus', refetch);
    window.addEventListener('prepos:session-saved', refetch);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', refetch);
      window.removeEventListener('prepos:session-saved', refetch);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refetch]);

  return { ...trend, loading, refetch };
}
