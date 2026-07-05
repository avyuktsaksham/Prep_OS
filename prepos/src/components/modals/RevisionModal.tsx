// src/components/modals/RevisionModal.tsx
import React, { useState, useEffect } from 'react';

interface RevisionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (qualityRating: number) => void;
}

export default function RevisionModal({ open, onClose, onSave }: RevisionModalProps) {
  // Default to 3 (Good) based on standard SM-2 baseline
  const [qualityRating, setQualityRating] = useState<number>(3);

  useEffect(() => {
    if (open) {
      setQualityRating(3);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(qualityRating);
  };

  const ratings = [
    { value: 0, label: 'Blackout', desc: 'Complete blank, forgot entirely', color: 'text-red-600' },
    { value: 1, label: 'Bad', desc: 'Familiar, but answered incorrectly', color: 'text-orange-600' },
    { value: 2, label: 'Hard', desc: 'Incorrect, but recalled easily upon seeing answer', color: 'text-amber-600' },
    { value: 3, label: 'Good', desc: 'Correct, but required significant effort', color: 'text-blue-600' },
    { value: 4, label: 'Easy', desc: 'Correct, after slight hesitation', color: 'text-indigo-600' },
    { value: 5, label: 'Perfect', desc: 'Correct, instant and effortless recall', color: 'text-green-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden scale-in-95 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Log Revision Session</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                How well did you remember this topic? (SM-2 Quality Rating)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ratings.map((rating) => (
                  <button
                    key={rating.value}
                    type="button"
                    onClick={() => setQualityRating(rating.value)}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left ${
                      qualityRating === rating.value
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {rating.value}
                      </span>
                      <span className={`text-sm font-bold ${qualityRating === rating.value ? rating.color : 'text-gray-900'}`}>
                        {rating.label}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                      {rating.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
            >
              Log Revision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}