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
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-gray-900">Log a Mistake</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-white">
          <div>
            <label htmlFor="questionReference" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Question Reference <span className="text-red-500">*</span>
            </label>
            <input
              id="questionReference"
              type="text"
              value={questionReference}
              onChange={(e) => setQuestionReference(e.target.value)}
              placeholder="e.g., Gate 2023 - Q45, or page 42 #3"
              className="w-full px-3.5 py-2.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-400"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Initial Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "HARD" | "MEDIUM" | "EASY")}
              className="w-full px-3.5 py-2.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="HARD">Hard</option>
              <option value="MEDIUM">Medium</option>
              <option value="EASY">Easy</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why did you get this wrong? Key concept to remember..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Save Mistake
          </button>
        </div>
      </div>
    </div>
  );
}