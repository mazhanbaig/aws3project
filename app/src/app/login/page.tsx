'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Login failed');
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-glow">CT</div>
            <span className="font-semibold text-sm text-gray-900">CompetitorTracker</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h1>
          <p className="text-muted text-sm mt-1.5 mb-8">Sign in to your account to continue monitoring.</p>

          <div className="card p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="input-field"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2.5 border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>

          <p className="text-sm text-muted mt-6 text-center">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-accent-600 font-medium hover:text-accent-700 transition-colors">
              Create one
            </Link>
          </p>

          <p className="text-xs text-muted mt-8 text-center">
            <Link href="/" className="hover:text-gray-700 transition-colors">&larr; Back to home</Link>
          </p>
        </div>
      </div>

      {/* Right Panel — Brand / Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 items-center justify-center px-12 relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
        
        <div className="max-w-md relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-medium mb-8">
            Automated competitor monitoring
          </div>
          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
            Stay ahead of your competition
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-10">
            Monitor pricing pages, feature lists, and changelogs. Get notified the instant your competitors make a move.
          </p>

          <div className="space-y-5 text-left">
            {[
              { icon: '🔍', title: 'Track competitors', desc: 'Add any public URL and set your check schedule' },
              { icon: '📸', title: 'Visual + text diffs', desc: 'See exactly what changed with highlighted comparisons' },
              { icon: '📬', title: 'Instant alerts', desc: 'Get notified when something important changes' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <h4 className="text-sm font-medium text-white mb-0.5">{item.title}</h4>
                  <p className="text-xs text-white/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
