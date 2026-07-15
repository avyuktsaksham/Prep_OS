// src/hooks/useRevisionLookahead.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { getRevisionLookahead } from '../engine/revisionLookaheadEngine';
import type { LookaheadBucket } from '../engine/revisionLookaheadEngine';

export function useRevisionLookahead(daysAhead = 7): LookaheadBucket[] {
  const buckets = useLiveQuery(
    () => getRevisionLookahead(daysAhead),
    [daysAhead],
    []
  );

  return buckets ?? [];
}
