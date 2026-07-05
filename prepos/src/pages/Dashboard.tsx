// src/pages/Dashboard.tsx
import { Link } from 'react-router-dom';
import gateData from '../data/gate.json';
import { useSubjectProgress } from '../hooks/useSubjectProgress';

interface Topic {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  weightage: number;
  topics: Topic[];
}

interface GateData {
  exam: string;
  subjects: Subject[];
}

const typedGateData = gateData as GateData;

// Extracted to an individual component so the hook can be used properly in a loop
function SubjectCard({ subject }: { subject: Subject }) {
  const { progress } = useSubjectProgress(subject.id);

  return (
    <Link 
      to={`/subject/${subject.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md hover:border-blue-200 transition-all duration-200"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex-grow">
        {subject.name}
      </h2>
      
      <div className="space-y-4 border-t border-gray-50 pt-4 mt-auto">
        {/* Real-time Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</span>
            <span className="text-sm font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-medium text-gray-500">Weightage</span>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700">
            {subject.weightage} Marks
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Topics</span>
          <span className="text-sm font-semibold text-gray-700">
            {subject.topics.length}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            {typedGateData.exam}
          </h1>
          <p className="text-gray-500 mt-2">PrepOS Personal Dashboard</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {typedGateData.subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
}