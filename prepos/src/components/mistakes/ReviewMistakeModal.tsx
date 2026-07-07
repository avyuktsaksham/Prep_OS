// src/components/mistakes/ReviewMistakeModal.tsx
import { formatDate } from '../../utils/date';
import type { ExtractedMistake } from '../../engine/mistakeEngine';

export interface ReviewMistakeModalProps {
  isOpen: boolean;
  mistake: ExtractedMistake | null;
  onClose: () => void;
  onReview: (confidence: "AGAIN" | "HARD" | "GOOD" | "EASY") => void;
}

export default function ReviewMistakeModal({ isOpen, mistake, onClose, onReview }: ReviewMistakeModalProps) {
  if (!isOpen || !mistake) return null;

  const handleReview = (confidence: "AGAIN" | "HARD" | "GOOD" | "EASY") => {
    onReview(confidence);
    onClose();
  };

  return (
    <div
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Review Mistake</h2>
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
        <div className="p-6 space-y-6 bg-white overflow-y-auto max-h-[60vh]">
          {/* Top Metadata */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
              mistake.difficulty === 'HARD' ? 'bg-red-50 text-red-600' :
              mistake.difficulty === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' :
              'bg-green-50 text-green-600'
            }`}>
              {mistake.difficulty || 'MEDIUM'}
            </span>
            <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
              Topic: {mistake.topicId}
            </span>
          </div>

          {/* Question Reference */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Question Reference</h3>
            <p className="text-lg font-bold text-gray-900 leading-relaxed border-l-4 border-blue-500 pl-4 py-1">
              {mistake.questionReference}
            </p>
          </div>

          {/* Notes (if available) */}
          {mistake.notes && (
            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
              <h3 className="text-sm font-semibold text-orange-800 mb-1">My Notes</h3>
              <p className="text-orange-900 text-sm whitespace-pre-wrap">{mistake.notes}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Attempts</span>
              <span className="text-lg font-bold text-gray-900">{mistake.attempts}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Next Review</span>
              <span className="text-lg font-bold text-gray-900">{formatDate(mistake.nextReviewDate)}</span>
            </div>
          </div>
        </div>

        {/* Footer (Confidence Actions) */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="w-full text-center sm:text-left sm:flex-1 mb-2 sm:mb-0">
            <span className="text-sm font-semibold text-gray-500">How well do you know this now?</span>
            <p className="text-xs text-gray-400 mt-1">
                Choose the option that best reflects your confidence.
            </p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <button
              onClick={() => handleReview('AGAIN')}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              Again
            </button>
            <button
              onClick={() => handleReview('HARD')}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-orange-700 bg-orange-100 border border-orange-200 rounded-lg hover:bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              Hard
            </button>
            <button
              onClick={() => handleReview('GOOD')}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-blue-700 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              Good
            </button>
            <button
              onClick={() => handleReview('EASY')}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-green-700 bg-green-100 border border-green-200 rounded-lg hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              Easy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}