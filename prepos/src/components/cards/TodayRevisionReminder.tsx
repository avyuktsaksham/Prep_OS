// src/components/cards/TodayRevisionReminder.tsx
import { Link } from 'react-router-dom';
import { BellRing, Clock } from 'lucide-react';
import { useTodayRevisionReminders } from '../../hooks/useTodayRevisionReminders';

export default function TodayRevisionReminder() {
  const reminders = useTodayRevisionReminders();

  if (reminders.length === 0) return null;

  const totalMinutes = reminders.reduce((sum, r) => sum + r.estimatedMinutes, 0);

  return (
    <section className="mb-10 bg-pulse/10 border border-pulse/30 rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="flex items-center gap-2 text-lg font-display font-bold text-ink">
          <BellRing className="w-5 h-5 text-pulse-bright" />
          Revise Today
        </h2>
        <span className="flex items-center gap-1.5 text-xs font-bold font-mono bg-void-raised border border-edge px-3 py-1.5 rounded-full text-ink-muted">
          <Clock className="w-3.5 h-3.5" />
          Max {totalMinutes} min total
        </span>
      </div>

      <div className="space-y-2">
        {reminders.map((r) => (
          <Link
            key={r.topicId}
            to={`/subject/${r.subjectId}`}
            className="flex items-center justify-between panel p-3.5 hover:border-pulse/40 transition-colors"
          >
            <div className="min-w-0">
              <h3 className="font-semibold text-ink text-sm truncate">{r.topicName}</h3>
              <p className="text-xs text-ink-faint">{r.subjectName}</p>
            </div>
            <span className="shrink-0 text-xs font-bold font-mono text-pulse-bright bg-pulse/15 px-2.5 py-1 rounded-md">
              max {r.estimatedMinutes}m
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
