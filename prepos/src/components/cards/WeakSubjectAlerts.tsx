// src/components/cards/WeakSubjectAlerts.tsx
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { getWeakSubjectAlerts } from '../../engine/weakTopicEngine';

export default function WeakSubjectAlerts() {
  const analytics = useAnalytics();

  if (!analytics) return null;

  const alerts = getWeakSubjectAlerts(analytics.subjectMetrics);

  if (alerts.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 text-xl font-display font-bold text-ink">
          <AlertTriangle className="w-5 h-5 text-warn" />
          Falling Behind
        </h2>
        <span className="text-sm text-ink-faint">High marks, lagging progress</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((subject) => (
          <Link
            key={subject.subjectId}
            to={`/subject/${subject.subjectId}`}
            className="panel panel-hover p-5 hover:shadow-md group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-ink text-sm">{subject.subjectName}</h3>
              <span className="text-xs font-bold bg-warn/15 text-warn px-2 py-1 rounded-md">
                {subject.weightage} Marks
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-ink-faint font-medium">Progress</span>
              <span className="font-bold text-ink">{subject.subjectProgress}%</span>
            </div>
            <div className="w-full bg-panel-raised rounded-full h-1.5">
              <div
                className="bg-warn h-1.5 rounded-full transition-all"
                style={{ width: `${subject.subjectProgress}%` }}
              />
            </div>
            <p className="text-xs text-ink-faint mt-3 group-hover:text-warn transition-colors">
              Behind your average — high-yield to catch up on.
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
