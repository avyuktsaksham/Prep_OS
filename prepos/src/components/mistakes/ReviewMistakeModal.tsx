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
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-void-raised w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-edge flex items-center justify-between bg-void-raised shrink-0">
          <h2 className="text-xl font-bold text-ink">Review Mistake</h2>
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
        <div className="p-6 space-y-6 bg-void-raised overflow-y-auto max-h-[60vh]">
          {/* Top Metadata */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
              mistake.difficulty === 'HARD' ? 'bg-stop/10 text-stop' :
              mistake.difficulty === 'MEDIUM' ? 'bg-warn/10 text-warn' :
              'bg-go/10 text-go'
            }`}>
              {mistake.difficulty || 'MEDIUM'}
            </span>
            <span className="text-sm font-mono text-ink-faint bg-panel-raised px-3 py-1 rounded-lg">
              Topic: {mistake.topicId}
            </span>
          </div>

          {/* Question Reference */}
          <div>
            <h3 className="text-sm font-semibold text-ink-faint uppercase tracking-wider mb-2">Question Reference</h3>
            <p className="text-lg font-bold text-ink leading-relaxed border-l-4 border-signal pl-4 py-1">
              {mistake.questionReference}
            </p>
          </div>

          {/* Notes (if available) */}
          {mistake.notes && (
            <div className="bg-warn/10/50 p-4 rounded-xl border border-warn/25">
              <h3 className="text-sm font-semibold text-warn mb-1">My Notes</h3>
              <p className="text-warn text-sm whitespace-pre-wrap">{mistake.notes}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-panel-raised p-4 rounded-xl border border-edge">
              <span className="block text-xs font-semibold text-ink-faint uppercase tracking-wider mb-1">Attempts</span>
              <span className="text-lg font-bold text-ink">{mistake.attempts}</span>
            </div>
            <div className="bg-panel-raised p-4 rounded-xl border border-edge">
              <span className="block text-xs font-semibold text-ink-faint uppercase tracking-wider mb-1">Next Review</span>
              <span className="text-lg font-bold text-ink">{formatDate(mistake.nextReviewDate)}</span>
            </div>
          </div>
        </div>

        {/* Footer (Confidence Actions) */}
        <div className="px-6 py-5 border-t border-edge bg-panel-raised flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="w-full text-center sm:text-left sm:flex-1 mb-2 sm:mb-0">
            <span className="text-sm font-semibold text-ink-faint">How well do you know this now?</span>
            <p className="text-xs text-ink-faint mt-1">
                Choose the option that best reflects your confidence.
            </p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <button
              onClick={() => handleReview('AGAIN')}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-stop bg-stop/15 border border-stop/30 rounded-lg hover:bg-stop/25 transition-colors focus:outline-none focus:ring-2 focus:ring-stop/50"
            >
              Again
            </button>
            <button
              onClick={() => handleReview('HARD')}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-warn bg-warn/15 border border-warn/30 rounded-lg hover:bg-warn/25 transition-colors focus:outline-none focus:ring-2 focus:ring-warn/50"
            >
              Hard
            </button>
            <button
              onClick={() => handleReview('GOOD')}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-signal-bright bg-signal/15 border border-signal/30 rounded-lg hover:bg-signal/25 transition-colors focus:outline-none focus:ring-2 focus:ring-signal/50"
            >
              Good
            </button>
            <button
              onClick={() => handleReview('EASY')}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-go bg-go/15 border border-go/30 rounded-lg hover:bg-go/25 transition-colors focus:outline-none focus:ring-2 focus:ring-go/50"
            >
              Easy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}