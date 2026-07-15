// src/components/mistakes/LogMistakeModal.tsx
import { useState, useEffect } from 'react';
export interface LogMistakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    questionReference: string;
    notes: string;
    difficulty: "HARD" | "MEDIUM" | "EASY";
  }) => void;
}

export default function LogMistakeModal({ isOpen, onClose, onSave }: LogMistakeModalProps) {
  const [questionReference, setQuestionReference] = useState('');
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<"HARD" | "MEDIUM" | "EASY">("MEDIUM");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuestionReference('');
      setNotes('');
      setDifficulty('MEDIUM');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isSaveDisabled = !questionReference.trim();

  const handleSave = () => {
    if (isSaveDisabled) return;
    
    onSave({
      questionReference: questionReference.trim(),
      notes: notes.trim(),
      difficulty
    });
    onClose();
  };

  return (
    <div 
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-void-raised w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-edge flex items-center justify-between bg-void-raised">
          <h2 className="text-xl font-bold text-ink">Log a Mistake</h2>
          <button 
            onClick={onClose}
            className="text-ink-faint hover:text-ink transition-colors p-1 rounded-lg hover:bg-edge"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-void-raised">
          <div>
            <label htmlFor="questionReference" className="block text-sm font-semibold text-ink-muted mb-1.5">
              Question Reference <span className="text-red-500">*</span>
            </label>
            <input
              id="questionReference"
              type="text"
              value={questionReference}
              onChange={(e) => setQuestionReference(e.target.value)}
              placeholder="e.g., Gate 2023 - Q45, or page 42 #3"
              className="w-full px-3.5 py-2.5 text-ink bg-panel-raised border border-edge rounded-xl focus:outline-none focus:ring-2 focus:ring-signal/50 focus:border-signal transition-all placeholder:text-ink-faint"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-semibold text-ink-muted mb-1.5">
              Initial Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "HARD" | "MEDIUM" | "EASY")}
              className="w-full px-3.5 py-2.5 text-ink bg-panel-raised border border-edge rounded-xl focus:outline-none focus:ring-2 focus:ring-signal/50 focus:border-signal transition-all appearance-none cursor-pointer"
            >
              <option value="HARD">Hard</option>
              <option value="MEDIUM">Medium</option>
              <option value="EASY">Easy</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-ink-muted mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why did you get this wrong? Key concept to remember..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-ink bg-panel-raised border border-edge rounded-xl focus:outline-none focus:ring-2 focus:ring-signal/50 focus:border-signal transition-all resize-none placeholder:text-ink-faint"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-edge bg-panel-raised flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-ink-muted bg-void-raised border border-edge rounded-xl hover:bg-panel-raised hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-edge"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="px-5 py-2.5 text-sm font-bold text-white bg-signal rounded-xl hover:bg-signal-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-signal/50"
          >
            Save Mistake
          </button>
        </div>
      </div>
    </div>
  );
}