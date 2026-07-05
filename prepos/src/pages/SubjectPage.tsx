import { useParams, Link } from 'react-router-dom';
import gateData from '../data/gate.json';
import TopicCard from '../components/cards/TopicCard';

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

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  
  const subject = (gateData.subjects as Subject[]).find((s) => s.id === id);

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Subject Not Found</h2>
        <Link to="/" className="text-blue-600 hover:underline font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* Subject Header */}
        <header className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {subject.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  {subject.weightage} Marks
                </span>
                <span className="text-gray-500 text-sm font-medium">
                  {subject.topics.length} Topics
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end bg-gray-50 px-6 py-4 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subject Progress</span>
              <span className="text-3xl font-black text-gray-900">0%</span>
            </div>
          </div>
        </header>

        {/* Topics List */}
        <div className="space-y-6">
          {subject.topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </div>
  );
}