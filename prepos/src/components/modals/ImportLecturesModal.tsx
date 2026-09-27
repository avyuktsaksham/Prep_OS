// src/components/modals/ImportLecturesModal.tsx
import { useState, useRef } from 'react';
import { Sparkles, Upload, X, Trash2, ImageIcon } from 'lucide-react';
import gateData from '../../data/gate.json';
import { extractLecturesFromScreenshot } from '../../engine/lectureImportEngine';
import type { ProposedLecture } from '../../engine/lectureImportEngine';
import { addLecture } from '../../db/lectureService';

interface GateSubject {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
}

const typedGateData = gateData as { subjects: GateSubject[] };

interface ReviewRow extends ProposedLecture {
  id: string;
  included: boolean;
}

interface ImportLecturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  onImported: () => void;
}

const CONFIDENCE_STYLE: Record<string, string> = {
  high: 'bg-go/15 text-go',
  medium: 'bg-warn/15 text-warn',
  low: 'bg-stop/15 text-stop',
};

export default function ImportLecturesModal({
  isOpen,
  onClose,
  defaultSubjectId,
  onImported,
}: ImportLecturesModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subjectId, setSubjectId] = useState(defaultSubjectId ?? typedGateData.subjects[0]?.id ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const subject = typedGateData.subjects.find((s) => s.id === subjectId);

  const resetAll = () => {
    setImageFile(null);
    setImagePreview(null);
    setRows([]);
    setError(null);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setRows([]);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleExtract = async () => {
    if (!imageFile || !subject) return;
    setIsExtracting(true);
    setError(null);
    try {
      const base64Full = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
      const base64 = base64Full.split(',')[1] ?? base64Full;

      const proposed = await extractLecturesFromScreenshot(subjectId, {
        base64,
        mimeType: imageFile.type || 'image/png',
      });

      if (proposed.length === 0) {
        setError('No lecture titles found in that screenshot. Try a clearer or more zoomed-in image.');
      }

      setRows(
        proposed.map((p, i) => ({
          ...p,
          id: `${i}-${p.title}`,
          included: true,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsExtracting(false);
    }
  };

  const updateRow = (id: string, patch: Partial<ReviewRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const includedCount = rows.filter((r) => r.included).length;

  const handleCommit = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const toAdd = rows.filter((r) => r.included);
      for (const row of toAdd) {
        await addLecture(row.topicId, { title: row.title });
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
            Import Lectures from Screenshot
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-panel text-ink-faint hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-bold text-ink-faint uppercase tracking-wider mb-1.5">
              Target Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setRows([]);
              }}
              disabled={isExtracting}
              className="w-full px-3.5 py-2.5 bg-panel-raised border border-edge rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-signal/50 focus:border-signal disabled:opacity-50"
            >
              {typedGateData.subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-faint uppercase tracking-wider mb-1.5">
              Screenshot
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            {!imagePreview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-edge rounded-xl py-10 flex flex-col items-center justify-center gap-2 hover:border-signal/50 hover:bg-panel-raised transition-colors"
              >
                <Upload className="w-6 h-6 text-ink-faint" />
                <span className="text-sm font-semibold text-ink-muted">Click to upload a screenshot</span>
                <span className="text-xs text-ink-faint">A lecture list, course page, or chapter list</span>
              </button>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full max-h-56 object-contain rounded-xl border border-edge bg-void" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="absolute top-2 right-2 p-1.5 bg-void-raised border border-edge rounded-lg text-ink-muted hover:text-ink transition-colors disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {imagePreview && rows.length === 0 && (
            <button
              onClick={handleExtract}
              disabled={isExtracting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-signal to-pulse text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Reading screenshot...
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
            <div className="p-3 bg-stop/10 border border-stop/30 rounded-lg text-sm font-medium text-stop">
              {error}
            </div>
          )}

          {rows.length > 0 && subject && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-ink-faint uppercase tracking-wider">
                  Review Before Adding ({includedCount} selected)
                </label>
                <button
                  onClick={handleExtract}
                  disabled={isExtracting}
                  className="text-xs font-semibold text-signal-bright hover:text-pulse-bright transition-colors"
                >
                  Re-extract
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
                      <div className="flex items-center gap-2">
                        <select
                          value={row.topicId}
                          onChange={(e) => {
                            const t = subject.topics.find((tp) => tp.id === e.target.value);
                            updateRow(row.id, { topicId: e.target.value, topicName: t?.name ?? '' });
                          }}
                          className="text-xs bg-panel-raised border border-edge rounded-md px-2 py-1 text-ink-muted focus:outline-none focus:ring-1 focus:ring-signal/50"
                        >
                          {subject.topics.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${CONFIDENCE_STYLE[row.confidence]}`}>
                          {row.confidence}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeRow(row.id)}
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
