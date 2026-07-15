// src/db/backupService.ts
import { db } from './index';
import type { Resource, Revision, Setting } from '../types';

export interface BackupData {
  version: 1;
  exportedAt: number;
  resources: Resource[];
  revisions: Revision[];
  settings: Setting[];
}

/**
 * Exports all user-generated data (resources, revisions, settings) as a
 * downloadable JSON file. Subjects/Topics are not exported since they come
 * from the static gate.json curriculum, not user data.
 */
export async function exportBackup(): Promise<void> {
  const [resources, revisions, settings] = await Promise.all([
    db.resources.toArray(),
    db.revisions.toArray(),
    db.settings.toArray(),
  ]);

  const backup: BackupData = {
    version: 1,
    exportedAt: Date.now(),
    resources,
    revisions,
    settings,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);

  a.href = url;
  a.download = `prepos-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/**
 * Validates that a parsed JSON object matches the expected BackupData shape.
 */
function isValidBackup(data: unknown): data is BackupData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  return (
    d.version === 1 &&
    Array.isArray(d.resources) &&
    Array.isArray(d.revisions) &&
    Array.isArray(d.settings)
  );
}

/**
 * Imports a backup JSON file, replacing all existing resources, revisions
 * and settings with the data from the file.
 */
export async function importBackup(file: File): Promise<void> {
  const text = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON file.');
  }

  if (!isValidBackup(parsed)) {
    throw new Error('This file is not a valid PrepOS backup.');
  }

  await db.transaction('rw', db.resources, db.revisions, db.settings, async () => {
    await db.resources.clear();
    await db.revisions.clear();
    await db.settings.clear();

    await db.resources.bulkAdd(parsed.resources);
    await db.revisions.bulkAdd(parsed.revisions);

    if (parsed.settings.length > 0) {
      await db.settings.bulkAdd(parsed.settings);
    }
  });
}
