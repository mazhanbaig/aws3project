'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Signup failed');
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

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create your account</h1>
          <p className="text-muted text-sm mt-1.5 mb-8">Start monitoring your competitors in minutes.</p>

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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className="input-field"
                />
                <p className="text-xs text-muted mt-1.5">Must be at least 6 characters</p>
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
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>

              <p className="text-xs text-center text-muted">
                By creating an account, you agree to our Terms and Privacy Policy.
              </p>
            </form>
          </div>

          <p className="text-sm text-muted mt-6 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-600 font-medium hover:text-accent-700 transition-colors">
              Sign in
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
            Free forever — no credit card needed
          </div>
          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
            What you get when you sign up
          </h2>

          <div className="space-y-5 text-left">
            {[
              { emoji: '🆓', title: 'Free tier included', desc: 'Track up to 5 pages with 24h intervals — no credit card required' },
              { emoji: '🤖', title: 'Automated monitoring', desc: 'Set it and forget it. We check your pages on schedule automatically' },
              { emoji: '📊', title: 'Rich change reports', desc: 'See added, removed, and changed content with visual diffs' },
              { emoji: '🔒', title: 'Secure by default', desc: 'JWT auth, encrypted storage, and HTTPS-ready architecture' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                <span className="text-xl">{item.emoji}</span>
                <div>
                  <h4 className="text-sm font-medium text-white mb-0.5">{item.title}</h4>
                  <p className="text-xs text-white/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-indigo-700 flex items-center justify-center text-[10px] font-bold text-white">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-xs text-white/60">Join early adopters</p>
          </div>
        </div>
      </div>
    </div>
  );
}
