// src/hooks/useTopicProgress.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { calculateTopicProgress } from '../engine/topicProgressEngine';
import type { TopicProgress } from '../engine/topicProgressEngine';

export function useTopicProgress(topicId: string): TopicProgress {
  const defaultProgress: TopicProgress = {
    progress: 0,
    lecture: 0,
    notes: 0,
    pyq: 0,
    confidence: 0
  };

  const progressData = useLiveQuery(
    () => calculateTopicProgress(topicId),
    [topicId],
    defaultProgress
  );

  return progressData || defaultProgress;
}