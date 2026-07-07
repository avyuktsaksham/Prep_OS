import { useLiveQuery } from 'dexie-react-hooks';
import { getAllPyqs } from '../db/pyqService';
import { extractAllMistakes, type ExtractedMistake } from '../engine/mistakeEngine';

export function useMistakes(): ExtractedMistake[] {
  const mistakes = useLiveQuery(async () => {
    const pyqs = await getAllPyqs();
    return extractAllMistakes(pyqs);
  });

  return mistakes ?? [];
}