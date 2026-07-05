// src/hooks/useSubjectProgress.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { calculateSubjectProgress } from '../engine/progressEngine';

export function useSubjectProgress(subjectId: string) {
  const defaultProgress = { progress: 0, breakdown: { lecture: 0, notes: 0, pyq: 0 } };

  // useLiveQuery automatically recalculates whenever db.resources changes
  const progressData = useLiveQuery(
    () => calculateSubjectProgress(subjectId),
    [subjectId],
    defaultProgress
  );

  return progressData || defaultProgress;
}