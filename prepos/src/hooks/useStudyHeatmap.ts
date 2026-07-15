// src/hooks/useStudyHeatmap.ts
import { useCallback, useEffect, useState } from 'react';
import { getStudyHeatmap } from '../engine/heatmapEngine';
import type { HeatmapDay } from '../engine/heatmapEngine';

export function useStudyHeatmap(weeksBack = 18) {
  const [days, setDays] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getStudyHeatmap(weeksBack);
      setDays(result);
    } finally {
      setLoading(false);
    }
  }, [weeksBack]);

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

  return { days, loading, refetch };
}
