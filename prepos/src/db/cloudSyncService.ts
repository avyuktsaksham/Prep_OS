// src/db/cloudSyncService.ts
import { db } from './index';
import { supabase } from '../lib/supabaseClient';
import type { Resource, Revision, Setting } from '../types';

interface CloudRow {
  id: string;
  data: Resource | Revision | Setting;
}

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Not signed in.');
  }
  return data.user.id;
}

/**
 * Pushes all local Dexie data (resources, revisions, settings) to Supabase.
 * Overwrites cloud data with whatever is currently on this device.
 */
export async function pushToCloud(): Promise<void> {
  const userId = await getUserId();

  const [resources, revisions, settings] = await Promise.all([
    db.resources.toArray(),
    db.revisions.toArray(),
    db.settings.toArray(),
  ]);

  // Clear existing cloud rows for this user, then insert fresh snapshot.
  await Promise.all([
    supabase.from('prepos_resources').delete().eq('user_id', userId),
    supabase.from('prepos_revisions').delete().eq('user_id', userId),
    supabase.from('prepos_settings').delete().eq('user_id', userId),
  ]);

  if (resources.length > 0) {
    const rows = resources.map((r) => ({
      id: r.id,
      user_id: userId,
      data: r,
    }));
    const { error } = await supabase.from('prepos_resources').insert(rows);
    if (error) throw error;
  }

  if (revisions.length > 0) {
    const rows = revisions.map((r) => ({
      id: r.id,
      user_id: userId,
      data: r,
    }));
    const { error } = await supabase.from('prepos_revisions').insert(rows);
    if (error) throw error;
  }

  if (settings.length > 0) {
    const rows = settings.map((s) => ({
      id: s.key,
      user_id: userId,
      data: s,
    }));
    const { error } = await supabase.from('prepos_settings').insert(rows);
    if (error) throw error;
  }
}

/**
 * Pulls all data from Supabase for the signed-in user and replaces
 * everything currently in local Dexie storage.
 */
export async function pullFromCloud(): Promise<void> {
  const userId = await getUserId();

  const [resourcesRes, revisionsRes, settingsRes] = await Promise.all([
    supabase
      .from('prepos_resources')
      .select('id, data')
      .eq('user_id', userId),
    supabase
      .from('prepos_revisions')
      .select('id, data')
      .eq('user_id', userId),
    supabase
      .from('prepos_settings')
      .select('id, data')
      .eq('user_id', userId),
  ]);

  if (resourcesRes.error) throw resourcesRes.error;
  if (revisionsRes.error) throw revisionsRes.error;
  if (settingsRes.error) throw settingsRes.error;

  const resources = ((resourcesRes.data ?? []) as CloudRow[]).map(
    (row) => row.data as Resource
  );
  const revisions = ((revisionsRes.data ?? []) as CloudRow[]).map(
    (row) => row.data as Revision
  );
  const settings = ((settingsRes.data ?? []) as CloudRow[]).map(
    (row) => row.data as Setting
  );

  await db.transaction(
    'rw',
    db.resources,
    db.revisions,
    db.settings,
    async () => {
      await db.resources.clear();
      await db.revisions.clear();
      await db.settings.clear();

      if (resources.length > 0) await db.resources.bulkAdd(resources);
      if (revisions.length > 0) await db.revisions.bulkAdd(revisions);
      if (settings.length > 0) await db.settings.bulkAdd(settings);
    }
  );
}
