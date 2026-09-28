// src/components/modals/ImportLecturesModal.tsx
import { useState, useRef } from 'react';
import { Sparkles, Upload, X, Trash2 } from 'lucide-react';
import gateData from '../../data/gate.json';
import { extractLecturesFromScreenshots } from '../../engine/lectureImportEngine';
import type { ProposedLecture } from '../../engine/lectureImportEngine';
import { addLecture } from '../../db/lectureService';

interface GateSubject {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
}

const subjects = (gateData as { subjects: GateSubject[] }).subjects;

interface ReviewRow extends ProposedLecture {
  id: string;
  included: boolean;
}

interface ImportLecturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

const CONFIDENCE_STYLE: Record<string, string> = {
  high: 'bg-go/15 text-go',
  medium: 'bg-warn/15 text-warn',
  low: 'bg-stop/15 text-stop',
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const full = reader.result as string;
      resolve(full.split(',')[1] ?? full);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImportLecturesModal({ isOpen, onClose, onImported }: ImportLecturesModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setFiles([]);
    setRows([]);
    setError(null);
    onClose();
  };

  const handleFilesSelected = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
    setRows([]);
    setError(null);
  };

  const handleExtract = async () => {
    if (files.length === 0) return;
    setIsExtracting(true);
    setError(null);
    try {
      const images = await Promise.all(
        files.map(async (f) => ({ base64: await fileToBase64(f), mimeType: f.type || 'image/png' }))
      );
      const proposed = await extractLecturesFromScreenshots(images);
      if (proposed.length === 0) {
        setError('Koi lecture title nahi mila. Clear/zoomed screenshot try kar.');
      }
      setRows(proposed.map((p, i) => ({ ...p, id: `${i}-${p.title}`, included: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsExtracting(false);
    }
  };

  const updateRow = (id: string, patch: Partial<ReviewRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const includedCount = rows.filter((r) => r.included).length;

  const handleCommit = async () => {
    setIsSaving(true);
    setError(null);
    try {
      for (const row of rows.filter((r) => r.included)) {
        await addLecture(row.topicId, { title: row.title, durationMinutes: row.durationMinutes });
      }
      onImported();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lectures.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-void-raised border border-edge rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-edge sticky top-0 bg-void-raised z-10">
          <h2 className="flex items-center gap-2 text-lg font-display font-bold text-ink">
            <Sparkles className="w-5 h-5 text-pulse-bright" />
            Import Lectures
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-panel text-ink-faint hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFilesSelected(e.target.files);
              e.target.value = '';
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isExtracting}
            className="w-full border-2 border-dashed border-edge rounded-xl py-8 flex flex-col items-center justify-center gap-2 hover:border-signal/50 hover:bg-panel-raised transition-colors disabled:opacity-50"
          >
            <Upload className="w-6 h-6 text-ink-faint" />
            <span className="text-sm font-semibold text-ink-muted">
              {files.length === 0 ? 'Screenshots upload kar (ek ya zyada)' : `${files.length} screenshot(s) — aur add kar`}
            </span>
            <span className="text-xs text-ink-faint">Subject AI khud pehchanega — kisi bhi subject ke mix kar sakta hai</span>
          </button>

          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={`${f.name}-${i}`} className="flex items-center gap-1.5 text-xs bg-panel-raised border border-edge rounded-md px-2 py-1 text-ink-muted">
                  {f.name.length > 22 ? `${f.name.slice(0, 20)}…` : f.name}
                  <button onClick={() => { setFiles((p) => p.filter((_, idx) => idx !== i)); setRows([]); }} disabled={isExtracting}>
                    <X className="w-3 h-3 hover:text-stop" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {files.length > 0 && rows.length === 0 && (
            <button
              onClick={handleExtract}
              disabled={isExtracting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-signal to-pulse text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Reading {files.length} screenshot(s)...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Extract Lectures
                </>
              )}
            </button>
          )}

          {error && (
            <div className="p-3 bg-stop/10 border border-stop/30 rounded-lg text-sm font-medium text-stop">{error}</div>
          )}

          {rows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-ink-faint uppercase tracking-wider">
                  Review Before Adding ({includedCount} selected)
                </label>
                <button onClick={handleExtract} disabled={isExtracting} className="text-xs font-semibold text-signal-bright hover:text-pulse-bright transition-colors">
                  Re-extract
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {rows.map((row) => (
                  <div key={row.id} className="panel p-3 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={row.included}
                      onChange={(e) => updateRow(row.id, { included: e.target.checked })}
                      className="mt-1.5 w-4 h-4 accent-signal shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) => updateRow(row.id, { title: e.target.value })}
                        className="w-full bg-transparent text-sm font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-signal/50 rounded px-1 -mx-1"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={row.topicId}
                          onChange={(e) => {
                            for (const s of subjects) {
                              const t = s.topics.find((tp) => tp.id === e.target.value);
                              if (t) {
                                updateRow(row.id, { topicId: t.id, topicName: t.name, subjectName: s.name });
                                break;
                              }
                            }
                          }}
                          className="text-xs bg-panel-raised border border-edge rounded-md px-2 py-1 text-ink-muted focus:outline-none focus:ring-1 focus:ring-signal/50 max-w-full"
                        >
                          {subjects.map((s) => (
                            <optgroup key={s.id} label={s.name}>
                              {s.topics.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${CONFIDENCE_STYLE[row.confidence]}`}>
                          {row.confidence}
                        </span>
                        {row.durationMinutes !== undefined && (
                          <span className="text-[10px] font-mono text-ink-faint">{row.durationMinutes}m</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                      className="p-1 text-ink-faint hover:text-stop transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {rows.length > 0 && (
          <div className="p-5 border-t border-edge sticky bottom-0 bg-void-raised">
            <button
              onClick={handleCommit}
              disabled={isSaving || includedCount === 0}
              className="w-full py-2.5 bg-gradient-to-r from-signal to-pulse text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? 'Adding...' : `Add ${includedCount} Lecture${includedCount === 1 ? '' : 's'}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
