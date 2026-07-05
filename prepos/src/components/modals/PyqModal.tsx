// src/components/modals/PyqModal.tsx
import { useState, useEffect } from 'react';

export interface PyqData {
  title: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
}

interface PyqModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PyqData) => void;
  initialData?: {
    title: string;
    totalQuestions: number;
    correct: number;
    incorrect: number;
  };
}

export default function PyqModal({ open, onClose, onSave, initialData }: PyqModalProps) {
  const [title, setTitle] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('');
  const [correct, setCorrect] = useState('');
  const [incorrect, setIncorrect] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setTotalQuestions(initialData.totalQuestions.toString());
        setCorrect(initialData.correct.toString());
        setIncorrect(initialData.incorrect.toString());
      } else {
        setTitle('');
        setTotalQuestions('');
        setCorrect('');
        setIncorrect('');
      }
    }
  }, [open, initialData]);

  if (!open) return null;

  const total = Number(totalQuestions) || 0;
  const correctAnswers = Number(correct) || 0;
  const incorrectAnswers = Number(incorrect) || 0;

  const isValid =
    correctAnswers <= total &&
    incorrectAnswers <= total &&
    correctAnswers + incorrectAnswers <= total;

  const dynamicAccuracy = total > 0 ? Math.round((correctAnswers / total) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    onSave({
      title: title.trim() || "Previous Year Questions",
      totalQuestions: total,
      correct: correctAnswers,
      incorrect: incorrectAnswers,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden scale-in-95 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit PYQ Progress' : 'Add PYQ Progress'}
          </h2>
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
          <div className="p-6 space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
                PYQ Title (Optional)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GATE 2015-2023"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label htmlFor="totalQuestions" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Total Questions
                </label>
                <input
                  id="totalQuestions"
                  type="number"
                  required
                  min="1"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="correct" className="block text-sm font-semibold text-gray-700 mb-1.5 text-green-600">
                  Correct Answers
                </label>
                <input
                  id="correct"
                  type="number"
                  required
                  min="0"
                  value={correct}
                  onChange={(e) => setCorrect(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="incorrect" className="block text-sm font-semibold text-gray-700 mb-1.5 text-red-600">
                  Incorrect Answers
                </label>
                <input
                  id="incorrect"
                  type="number"
                  required
                  min="0"
                  value={incorrect}
                  onChange={(e) => setIncorrect(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {!isValid && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-sm font-semibold text-red-600">
                Correct + Incorrect answers cannot exceed Total Questions.
              </div>
            )}

            {total > 0 && (
              <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-purple-800">Calculated Accuracy</span>
                <span className="text-xl font-bold text-purple-600">{dynamicAccuracy}%</span>
              </div>
            )}
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
              disabled={!isValid}
              className={`px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm ${
                !isValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {initialData ? 'Update PYQs' : 'Save PYQs'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}