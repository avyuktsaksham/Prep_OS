// src/components/cards/RevisionLookahead.tsx
import { Link } from 'react-router-dom';
import { useRevisionLookahead } from '../../hooks/useRevisionLookahead';

export default function RevisionLookahead() {
  const buckets = useRevisionLookahead(7);

  const hasAnyItems = buckets.some((b) => b.items.length > 0);

  if (!hasAnyItems) {
    return null;
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-display font-bold text-ink">Revision Forecast</h2>
        <span className="text-sm text-ink-faint font-mono">Next 7 days</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {buckets.map((bucket) => (
          <div
            key={bucket.dateKey}
            className={`shrink-0 w-44 rounded-xl border p-4 ${
              bucket.isOverdue
                ? 'bg-stop/10 border-stop/30'
                : bucket.items.length > 0
                  ? 'panel'
                  : 'bg-void-raised border-edge'
            }`}
          >
            <div
              className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                bucket.isOverdue ? 'text-stop' : 'text-ink-faint'
              }`}
            >
              {bucket.label}
            </div>

            {bucket.items.length === 0 ? (
              <p className="text-xs text-ink-faint">No revisions</p>
            ) : (
              <div className="space-y-2">
                {bucket.items.slice(0, 4).map((item) => (
                  <Link
                    key={item.topicId}
                    to={`/subject/${item.subjectId}`}
                    className="block text-xs font-semibold text-ink-muted hover:text-signal-bright truncate transition-colors"
                    title={item.topicName}
                  >
                    {item.topicName}
                  </Link>
                ))}
                {bucket.items.length > 4 && (
                  <p className="text-xs text-ink-faint font-medium">
                    +{bucket.items.length - 4} more
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
