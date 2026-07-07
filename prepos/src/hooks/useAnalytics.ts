// src/hooks/useAnalytics.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { generateAnalyticsSnapshot } from '../engine/analyticsEngine';
import type { AnalyticsSnapshot } from '../types';

export function useAnalytics(): AnalyticsSnapshot | undefined {
  return useLiveQuery(() => generateAnalyticsSnapshot());
}