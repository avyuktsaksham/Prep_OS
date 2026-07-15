// src/components/layout/CloudSyncControls.tsx
import { useEffect, useState } from 'react';
import { pushToCloud, pullFromCloud } from '../../db/cloudSyncService';
import { exportBackup, importBackup } from '../../db/backupService';
import { useAuth } from '../../hooks/useAuth';

const LAST_SYNCED_KEY = 'prepos_last_synced_at';

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CloudSyncControls() {
  const { user, signOut } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [lastSynced, setLastSynced] = useState<number | null>(() => {
    const raw = localStorage.getItem(LAST_SYNCED_KEY);
    return raw ? Number(raw) : null;
  });
  const [, forceTick] = useState(0);

  // Re-render every 30s so the "Xm ago" label stays fresh
  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const markSynced = () => {
    const now = Date.now();
    localStorage.setItem(LAST_SYNCED_KEY, String(now));
    setLastSynced(now);
  };

  const runAction = async (action: () => Promise<void>, successMsg: string) => {
    setIsBusy(true);
    setStatus(null);
    try {
      await action();
      setStatus(successMsg);
      markSynced();
    } catch (error) {
      console.error('Sync action failed:', error);
      setStatus('Something went wrong.');
    } finally {
      setIsBusy(false);
    }
  };

  const handlePull = () => {
    const confirmed = window.confirm(
      'This will replace all local data with your cloud backup. Continue?'
    );
    if (!confirmed) return;
    runAction(pullFromCloud, 'Restored from cloud.');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const confirmed = window.confirm(
        'This will replace all local data with the backup file. Continue?'
      );
      if (!confirmed) return;
      setIsBusy(true);
      setStatus(null);
      try {
        await importBackup(file);
        setStatus('Data restored from file.');
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Import failed.');
      } finally {
        setIsBusy(false);
      }
    };
    input.click();
  };

  return (
    <div className="px-3 pb-3">
      <div className="panel p-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-go opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-go" />
            </span>
            <span className="text-xs font-semibold text-ink truncate" title={user?.email ?? ''}>
              {user?.email}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-ink-faint font-mono mb-2.5">
          {lastSynced ? `Synced ${timeAgo(lastSynced)}` : 'Not synced yet'}
        </p>

        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => runAction(pushToCloud, 'Synced to cloud.')}
            disabled={isBusy}
            title="Sync up to cloud"
            className="py-1.5 rounded-lg bg-panel-raised hover:bg-edge text-signal-bright text-[10px] font-bold transition-colors disabled:opacity-50"
          >
            Sync
          </button>
          <button
            onClick={handlePull}
            disabled={isBusy}
            title="Restore from cloud"
            className="py-1.5 rounded-lg bg-panel-raised hover:bg-edge text-ink-muted text-[10px] font-bold transition-colors disabled:opacity-50"
          >
            Restore
          </button>
          <button
            onClick={() => exportBackup()}
            disabled={isBusy}
            title="Export local backup"
            className="py-1.5 rounded-lg bg-panel-raised hover:bg-edge text-ink-muted text-[10px] font-bold transition-colors disabled:opacity-50"
          >
            Export
          </button>
          <button
            onClick={handleImport}
            disabled={isBusy}
            title="Import backup file"
            className="py-1.5 rounded-lg bg-panel-raised hover:bg-edge text-ink-muted text-[10px] font-bold transition-colors disabled:opacity-50"
          >
            Import
          </button>
        </div>

        {status && <p className="text-[11px] text-ink-muted mt-2">{status}</p>}

        <button
          onClick={() => signOut()}
          className="w-full mt-2.5 pt-2.5 border-t border-edge text-[11px] font-semibold text-ink-faint hover:text-stop transition-colors text-left"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
