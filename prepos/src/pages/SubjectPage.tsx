import { useParams, Link } from 'react-router-dom';
import gateData from '../data/gate.json';
import TopicCard from '../components/cards/TopicCard';
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

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  
  const subject = (gateData.subjects as Subject[]).find((s) => s.id === id);
  const { progress } = useSubjectProgress(id ?? '');

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center p-6 py-24">
        <h2 className="text-2xl font-bold text-ink mb-4">Subject Not Found</h2>
        <Link to="/" className="text-signal-bright hover:underline font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <Link to="/" className="text-sm font-medium text-ink-faint hover:text-ink transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Subject Header */}
      <header className="panel p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-ink">
              {subject.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-signal/10 text-signal-bright">
                {subject.weightage} Marks
              </span>
              <span className="text-ink-faint text-sm font-medium">
                {subject.topics.length} Topics
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end bg-panel-raised px-6 py-4 rounded-xl border border-edge">
            <span className="text-xs font-bold text-ink-faint uppercase tracking-wider mb-1">Subject Progress</span>
            <span className="font-mono text-3xl font-black text-ink">{progress}%</span>
          </div>
        </div>
      </header>

      {/* Topics List */}
      <div className="space-y-6">
        {subject.topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} subjectName={subject.name} />
        ))}
      </div>
    </div>
  );
}