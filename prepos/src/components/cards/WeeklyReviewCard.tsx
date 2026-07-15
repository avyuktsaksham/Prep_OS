// src/components/cards/WeeklyReviewCard.tsx
import { useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { generateWeeklyReview } from '../../engine/aiReviewEngine';
import type { AnalyticsSnapshot } from '../../types';

interface WeeklyReviewCardProps {
  snapshot: AnalyticsSnapshot;
}

export default function WeeklyReviewCard({ snapshot }: WeeklyReviewCardProps) {
  const [review, setReview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateWeeklyReview(snapshot);
      setReview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-8 bg-void-raised border border-pulse/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-pulse/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse to-signal flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-bold text-ink">AI Weekly Review</h2>
              <span className="text-[10px] font-bold bg-pulse/20 text-pulse-bright px-1.5 py-0.5 rounded uppercase tracking-wider">
                Gemini AI
              </span>
            </div>
            <p className="text-sm text-ink-faint mt-0.5">
              A short, honest read on your week.
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pulse to-signal text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? 'Generating...' : review ? 'Regenerate' : 'Generate Review'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-stop/10 border border-stop/30 rounded-lg text-sm font-medium text-stop relative">
          {error}
        </div>
      )}

      {review && !error && (
        <div className="p-4 bg-panel border border-edge rounded-lg text-sm text-ink-muted whitespace-pre-wrap leading-relaxed relative">
          {review}
        </div>
      )}

      {!review && !error && !loading && (
        <p className="text-sm text-ink-faint relative">
          Click "Generate Review" to get a data-based summary of your week.
        </p>
      )}
    </section>
  );
}
