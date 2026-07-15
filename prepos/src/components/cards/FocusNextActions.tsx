// src/components/cards/FocusNextActions.tsx
import { Link } from 'react-router-dom';
import { Repeat, Video, FileText, PenLine, Target } from 'lucide-react';
import type { TodayTask } from '../../types';

interface FocusNextActionsProps {
  tasks: TodayTask[];
}

const TYPE_STYLES: Record<string, { bg: string; text: string; icon: typeof Repeat }> = {
  REVISION: { bg: 'bg-pulse/15', text: 'text-pulse-bright', icon: Repeat },
  LECTURE: { bg: 'bg-signal/15', text: 'text-signal-bright', icon: Video },
  NOTES: { bg: 'bg-warn/15', text: 'text-warn', icon: FileText },
  PYQ: { bg: 'bg-go/15', text: 'text-go', icon: PenLine },
};

export default function FocusNextActions({ tasks }: FocusNextActionsProps) {
  const topThree = tasks.slice(0, 3);

  return (
    <section className="mb-10 bg-void-raised border border-edge grid-texture rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 text-ink font-display font-bold text-lg">
          <Target className="w-5 h-5 text-signal-bright" />
          Focus: Next Actions
        </h2>
        <span className="text-xs font-semibold text-ink-faint">Do these first</span>
      </div>

      {topThree.length === 0 ? (
        <p className="text-ink-muted text-sm">
          Sab clear hai abhi ke liye — koi pending high-priority task nahi.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((task, index) => {
            const style = TYPE_STYLES[task.type] ?? TYPE_STYLES.LECTURE;
            const Icon = style.icon;
            return (
              <Link
                key={task.id}
                to={`/subject/${task.subjectId}`}
                className="panel p-4 hover:border-edge-bright hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${style.bg} ${style.text}`}>
                    <Icon className="w-3 h-3" /> #{index + 1}
                  </span>
                  <span className="text-xs text-ink-faint font-mono">
                    {task.estimatedMinutes}m
                  </span>
                </div>
                <h3 className="font-bold text-ink text-sm leading-snug mb-1">
                  {task.topicName}
                </h3>
                <p className="text-xs text-ink-faint mb-3">{task.title}</p>
                <span className="text-xs font-bold text-signal-bright group-hover:text-pulse-bright transition-colors">
                  {task.actionLabel} →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
