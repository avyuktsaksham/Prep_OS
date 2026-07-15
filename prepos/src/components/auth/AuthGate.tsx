// src/components/auth/AuthGate.tsx
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../common/Logo';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { session, loading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="w-10 h-10 border-4 border-edge border-t-signal rounded-full animate-spin" />
      </div>
    );
  }

  if (session) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password);
        setInfo('Account created. Check your email to confirm, then sign in.');
        setMode('signin');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-void grid-texture p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-signal/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pulse/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-sm panel p-8 relative">
        <div className="mb-6">
          <Logo size={40} caption="GATE 2027" />
        </div>

        <h1 className="text-lg font-display font-bold text-ink mb-1">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm text-ink-muted mb-6">
          Your data stays synced to this account across every device.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-ink-muted mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-ink bg-panel-raised border border-edge rounded-xl focus:outline-none focus:ring-2 focus:ring-signal/50 focus:border-signal transition-all placeholder:text-ink-faint"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-ink-muted mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-ink bg-panel-raised border border-edge rounded-xl focus:outline-none focus:ring-2 focus:ring-signal/50 focus:border-signal transition-all placeholder:text-ink-faint"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div className="p-3 bg-stop/10 border border-stop/30 rounded-xl text-sm font-medium text-stop">
              {error}
            </div>
          )}

          {info && (
            <div className="p-3 bg-go/10 border border-go/30 rounded-xl text-sm font-medium text-go">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-signal to-pulse text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
            setInfo(null);
          }}
          className="w-full mt-4 text-sm font-semibold text-signal-bright hover:text-pulse-bright transition-colors"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
