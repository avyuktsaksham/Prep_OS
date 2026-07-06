import { useLiveQuery } from 'dexie-react-hooks';
import { getTodayTasks } from '../engine/todayTaskEngine';
import type { TodayTask } from '../types';

export function useTodayTasks(): TodayTask[] {
  const tasks = useLiveQuery(
    () => getTodayTasks(),
    [],
    []
  );

  return tasks ?? [];
}