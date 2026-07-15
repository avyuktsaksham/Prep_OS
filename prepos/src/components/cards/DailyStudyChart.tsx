// src/components/cards/DailyStudyChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useDailyStudyTrend } from '../../hooks/useDailyStudyTrend';

export default function DailyStudyChart() {
  const { points, todayMinutes, last7DayAvgMinutes, insight, loading } = useDailyStudyTrend(14);

  if (loading && points.length === 0) {
    return (
      <section className="mb-10 panel p-6">
        <div className="h-40 flex items-center justify-center text-sm text-ink-faint">
          Loading study trend...
        </div>
      </section>
    );
  }

  const hasAnyData = points.some((p) => p.minutes > 0);

  return (
    <section className="mb-10 panel p-6">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="flex items-center gap-2 text-lg font-display font-bold text-ink">
          <TrendingUp className="w-4 h-4 text-signal-bright" />
          Daily Study Time
        </h2>
        <span className="text-sm text-ink-faint font-mono">Last 14 days</span>
      </div>

      {!hasAnyData ? (
        <p className="text-sm text-ink-faint py-8 text-center">
          Koi session data nahi hai abhi. Timer chala ke study session log kar, graph yahan dikhega.
        </p>
      ) : (
        <>
          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#565d72' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#565d72' }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  formatter={(value) => [`${value} min`, 'Studied']}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid #242939',
                    background: '#12151f',
                    color: '#f3f5fa',
                  }}
                  labelStyle={{ color: '#8b93a7' }}
                />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                  {points.map((p) => (
                    <Cell key={p.dateKey} fill={p.isToday ? '#3b82f6' : '#242939'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-6 mt-2 text-xs text-ink-faint font-mono">
            <span>
              Today: <span className="font-bold text-ink">{todayMinutes} min</span>
            </span>
            <span>
              7-day avg: <span className="font-bold text-ink">{last7DayAvgMinutes} min</span>
            </span>
          </div>

          <div className="mt-4 p-3 bg-signal/10 border border-signal/25 rounded-lg text-sm text-ink-muted">
            {insight}
          </div>
        </>
      )}
    </section>
  );
}
