// src/components/cards/StudyHeatmap.tsx
import { Flame } from 'lucide-react';
import { useStudyHeatmap } from '../../hooks/useStudyHeatmap';
import type { HeatmapDay } from '../../engine/heatmapEngine';

const LEVEL_COLORS: Record<number, string> = {
  0: 'bg-panel-raised',
  1: '#1e3a6e',
  2: '#2f5aa8',
  3: '#3b82f6',
  4: '#60a5fa',
};

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function chunkIntoWeeks(days: HeatmapDay[]): HeatmapDay[][] {
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export default function StudyHeatmap() {
  const { days, loading } = useStudyHeatmap(18);

  if (loading && days.length === 0) {
    return (
      <section className="mb-10 panel p-6">
        <div className="h-32 flex items-center justify-center text-sm text-ink-faint">
          Loading heatmap...
        </div>
      </section>
    );
  }

  const weeks = chunkIntoWeeks(days);
  const activeDaysCount = days.filter((d) => d.minutes > 0).length;

  const monthLabels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstDay = week[0];
    if (firstDay) {
      const month = firstDay.date.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ weekIndex: i, label: firstDay.date.toLocaleDateString(undefined, { month: 'short' }) });
        lastMonth = month;
      }
    }
  });

  return (
    <section className="mb-10 panel p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="flex items-center gap-2 text-lg font-display font-bold text-ink">
          <Flame className="w-4 h-4 text-warn" />
          Study Activity
        </h2>
        <span className="text-sm text-ink-faint font-mono">{activeDaysCount} active days in last {weeks.length} weeks</span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-max">
          <div className="flex gap-1 pl-8">
            {weeks.map((_, i) => {
              const monthLabel = monthLabels.find((m) => m.weekIndex === i);
              return (
                <div key={i} className="w-3 text-[10px] text-ink-faint font-mono font-medium">
                  {monthLabel ? monthLabel.label : ''}
                </div>
              );
            })}
          </div>

          <div className="flex gap-1">
            <div className="flex flex-col gap-1 pr-1">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="w-6 h-3 text-[10px] text-ink-faint font-mono font-medium flex items-center">
                  {label}
                </div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, di) => {
                  const day = week[di];
                  if (!day) return <div key={di} className="w-3 h-3" />;
                  const color = LEVEL_COLORS[day.level];
                  return (
                    <div
                      key={di}
                      title={`${day.date.toLocaleDateString()}: ${day.minutes} min`}
                      className={`w-3 h-3 rounded-sm ${day.level === 0 ? color : ''}`}
                      style={day.level > 0 ? { backgroundColor: color } : undefined}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-4 text-xs text-ink-faint">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`w-3 h-3 rounded-sm ${level === 0 ? LEVEL_COLORS[0] : ''}`}
            style={level > 0 ? { backgroundColor: LEVEL_COLORS[level] } : undefined}
          />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
