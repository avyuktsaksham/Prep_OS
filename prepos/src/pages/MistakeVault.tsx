// src/pages/MistakeVault.tsx
import { useMemo, useState } from 'react';
import { useMistakes } from '../hooks/useMistakes';
import { formatDate } from "../utils/date";

type TabType = 'DUE' | 'PENDING' | 'RESOLVED';

export default function MistakeVault() {
  const mistakes = useMistakes();
  const [activeTab, setActiveTab] = useState<TabType>('DUE');

  
  const {
  totalMistakes,
  pendingMistakes,
  resolvedMistakes,
  displayedMistakes
} = useMemo(() => {
    const now = Date.now();
  const totalMistakes = mistakes.length;

  const pendingMistakes = mistakes.filter(
    m => m.status === "PENDING"
  ).length;

  const resolvedMistakes = mistakes.filter(
    m => m.status === "RESOLVED"
  ).length;

  const displayedMistakes = mistakes.filter(m => {
    switch (activeTab) {
      case "DUE":
        return (
          m.status === "PENDING" &&
          m.nextReviewDate <= now
        );

      case "PENDING":
        return m.status === "PENDING";

      case "RESOLVED":
        return m.status === "RESOLVED";

      default:
        return false;
    }
  });

  return {
    totalMistakes,
    pendingMistakes,
    resolvedMistakes,
    displayedMistakes
  };
}, [mistakes, activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mistake Vault</h1>
        <p className="text-sm text-gray-500 mt-1">Review and master your weakest concepts.</p>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Mistakes</span>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-gray-900">{totalMistakes}</span>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending</span>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-orange-600">{pendingMistakes}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Resolved</span>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-green-600">{resolvedMistakes}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-px">
        <button
          onClick={() => setActiveTab('DUE')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'DUE' 
              ? 'border-blue-600 text-blue-700 bg-blue-50/50' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Due Review
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'PENDING' 
              ? 'border-blue-600 text-blue-700 bg-blue-50/50' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab('RESOLVED')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'RESOLVED' 
              ? 'border-blue-600 text-blue-700 bg-blue-50/50' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Resolved
        </button>
      </div>

      {/* Content Grid */}
      {displayedMistakes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedMistakes.map(mistake => (
            <div key={mistake.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                  mistake.difficulty === 'HARD' ? 'bg-red-50 text-red-600' :
                  mistake.difficulty === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  {mistake.difficulty || 'MEDIUM'}
                </span>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                  mistake.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {mistake.status}
                </span>
              </div>
              
              <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
                {mistake.questionReference}
              </h3>
              <p className="text-xs text-gray-500 mb-4 font-mono truncate" title={mistake.topicId}>
                Topic ID: {mistake.topicId}
              </p>

              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                  <span className="font-medium">Attempts:</span>
                  <span className="font-bold text-gray-900">{mistake.attempts}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                  <span className="font-medium">Next Review:</span>
                  <span className={`font-bold ${
                    mistake.nextReviewDate <= Date.now() && mistake.status === 'PENDING' ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {formatDate(mistake.nextReviewDate)}
                  </span>
                </div>

                <button
                  disabled
                  className="w-full mt-2 py-2.5 px-4 bg-gray-100 text-gray-400 font-bold text-sm rounded-lg cursor-not-allowed border border-gray-200"
                >
                  Review Mistake
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No mistakes found</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            {activeTab === 'DUE' ? "You're all caught up! There are no mistakes due for review today." : 
             activeTab === 'PENDING' ? "Great job! You don't have any pending mistakes right now." :
             "You haven't resolved any mistakes yet. Keep reviewing!"}
          </p>
        </div>
      )}
    </div>
  );
}