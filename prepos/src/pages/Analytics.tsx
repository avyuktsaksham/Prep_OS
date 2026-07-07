// src/pages/Analytics.tsx
import { useAnalytics } from '../hooks/useAnalytics';

export default function Analytics() {
  const data = useAnalytics();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium text-sm">Crunching numbers...</p>
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const sortedSubjectsByProgress = [...data.subjectMetrics].sort((a, b) => b.subjectProgress - a.subjectProgress);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Your comprehensive GATE preparation metrics</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Overall</span>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-gray-900">{data.overallProgress}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Topics Done</span>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-gray-900">{data.completedTopics}</span>
            <span className="text-sm font-medium text-gray-400 mb-1">/ {data.totalTopics}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Study Time</span>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-gray-900">{formatTime(data.totalStudyTimeMinutes)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">PYQs Solved</span>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-gray-900">{data.totalPyqsSolved}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Accuracy</span>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-gray-900">{data.overallAccuracy}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Due Revisions</span>
          <div className="flex items-end gap-1">
            <span className={`text-2xl font-bold ${data.dueRevisionsCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {data.dueRevisionsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 1: Subject Progress */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight shrink-0">Subject Progress</h2>
          <div className="overflow-y-auto pr-2 flex-grow space-y-4 custom-scrollbar">
            {sortedSubjectsByProgress.map((subject) => (
              <div key={subject.subjectId} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700 truncate mr-2" title={subject.subjectName}>
                    {subject.subjectName}
                  </span>
                  <span className="font-bold text-gray-900">{subject.subjectProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${subject.subjectProgress}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {sortedSubjectsByProgress.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No subjects available.</p>
            )}
          </div>
        </div>

        {/* Chart 2: Weightage vs Progress */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Accuracy vs Progress</h2>
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Progress</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Accuracy</div>
            </div>
          </div>
          <div className="overflow-y-auto pr-2 flex-grow space-y-5 custom-scrollbar">
            {sortedSubjectsByProgress.map((subject) => (
              <div key={`weightage-${subject.subjectId}`} className="flex flex-col gap-1.5">
                <div className="text-sm font-semibold text-gray-700 truncate" title={subject.subjectName}>
                  {subject.subjectName}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-1.5 flex-grow overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${subject.subjectProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 w-8 text-right">{subject.subjectProgress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-1.5 flex-grow overflow-hidden">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${subject.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 w-8 text-right">{subject.accuracy}%</span>
                  </div>
                </div>
              </div>
            ))}
            {sortedSubjectsByProgress.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No subjects available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Insights */}
      <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4">Key Insights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Strongest Subject</p>
            <p className="text-sm font-bold text-gray-900 truncate" title={data.insights.strongestSubject || 'N/A'}>
              {data.insights.strongestSubject || 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Weakest Subject</p>
            <p className="text-sm font-bold text-gray-900 truncate" title={data.insights.weakestSubject || 'N/A'}>
              {data.insights.weakestSubject || 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Most Studied</p>
            <p className="text-sm font-bold text-gray-900 truncate" title={data.insights.mostStudiedSubject || 'N/A'}>
              {data.insights.mostStudiedSubject || 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 shrink-0">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Least Studied</p>
            <p className="text-sm font-bold text-gray-900 truncate" title={data.insights.leastStudiedSubject || 'N/A'}>
              {data.insights.leastStudiedSubject || 'N/A'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Custom Scrollbar Styles for the Charts */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}