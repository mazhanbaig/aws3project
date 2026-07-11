'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';

interface TrackedPage {
  id: number;
  label: string;
  url: string;
  check_interval_hours: number;
  screenshot_enabled: boolean;
  last_checked_at: string | null;
  created_at: string;
  changes_count: string;
}

function SkeletonCard() {
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <div className="skeleton h-5 w-48 rounded" />
          <div className="skeleton h-4 w-72 rounded" />
          <div className="skeleton h-3 w-36 rounded" />
        </div>
        <div className="flex gap-2 ml-4">
          <div className="skeleton h-8 w-20 rounded-lg" />
          <div className="skeleton h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [pages, setPages] = useState<TrackedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState(24);
  const [screenshotEnabled, setScreenshotEnabled] = useState(false);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [checkingIds, setCheckingIds] = useState<Set<number>>(new Set());

  async function loadPages() {
    const res = await fetch('/api/tracked-pages');
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    const data = await res.json();
    setPages(data.pages);
    setLoading(false);
  }

  useEffect(() => {
    loadPages();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError('');
    setAdding(true);

    const res = await fetch('/api/tracked-pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label,
        url,
        checkIntervalHours: interval,
        screenshotEnabled,
      }),
    });

    setAdding(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to add page');
      return;
    }

    setShowAdd(false);
    setLabel('');
    setUrl('');
    setInterval(24);
    setScreenshotEnabled(false);
    loadPages();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this tracked page?')) return;
    await fetch(`/api/tracked-pages/${id}`, { method: 'DELETE' });
    loadPages();
  }

  async function handleCheckNow(id: number) {
    setCheckingIds((prev) => new Set(prev).add(id));
    await fetch(`/api/tracked-pages/${id}/check-now`, { method: 'POST' });
    setCheckingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    loadPages();
  }

  async function handleLogout() {
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  }

  // Stats derived from pages
  const totalChanges = pages.reduce((sum, p) => sum + parseInt(p.changes_count || '0'), 0);
  const recentlyChecked = pages.filter(p => p.last_checked_at && Date.now() - new Date(p.last_checked_at).getTime() < 3600000).length;
  const withScreenshots = pages.filter(p => p.screenshot_enabled).length;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-glow">CT</div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
              <p className="text-xs text-muted -mt-0.5">Competitor Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn-ghost text-xs hidden sm:inline-flex">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {showAdd ? 'Cancel' : 'Add page'}
            </button>
            <button onClick={handleLogout} className="btn-ghost text-sm">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats summary bar */}
        {pages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-slide-up">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-none">{pages.length}</p>
                  <p className="text-xs text-muted mt-1">Tracked pages</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-none">{totalChanges}</p>
                  <p className="text-xs text-muted mt-1">Total changes</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-none">{recentlyChecked}</p>
                  <p className="text-xs text-muted mt-1">Checked this hour</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.828 12h8.484M9.828 12l-1.414-1.414M9.828 12l1.414 1.414M12 4v16" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-none">{withScreenshots}</p>
                  <p className="text-xs text-muted mt-1">With screenshots</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAdd && (
          <form onSubmit={handleAdd} className="card p-6 mb-8 animate-slide-up space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-semibold shadow-glow">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-base font-medium">New tracked page</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Label</label>
                <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} required placeholder="e.g. Pricing page" className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">URL</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://example.com/pricing" className="input-field" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Check every</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={interval} onChange={(e) => setInterval(parseInt(e.target.value) || 24)} min={1} max={168} className="input-field w-20 text-center" />
                  <span className="text-sm text-muted">hours</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="screenshot-toggle"
                  checked={screenshotEnabled}
                  onChange={(e) => setScreenshotEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-accent-600 focus:ring-accent-500/20 transition-colors"
                />
                <label htmlFor="screenshot-toggle" className="text-sm text-gray-700 select-none cursor-pointer flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.828 12h8.484M9.828 12l-1.414-1.414M9.828 12l1.414 1.414M12 4v16" />
                  </svg>
                  Enable screenshots
                </label>
              </div>
            </div>
            {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2.5 border border-red-100">{error}</div>}
            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={adding} className="btn-primary">{adding ? 'Saving...' : 'Save page'}</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : pages.length === 0 && !showAdd ? (
          <div className="card p-16 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 mb-6 shadow-inner-soft">
              <svg className="w-8 h-8 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No pages tracked yet</h2>
            <p className="text-sm text-muted mb-8 max-w-md mx-auto leading-relaxed">
              Start monitoring your competitors by adding a URL. We&apos;ll track changes and notify you automatically.
            </p>

            {/* Quick tips */}
            <div className="max-w-sm mx-auto mb-8">
              <div className="space-y-3 text-left">
                {[
                  { icon: '🔗', title: 'Add a competitor URL', desc: 'Pricing pages, feature lists, or changelogs' },
                  { icon: '⏰', title: 'Set check frequency', desc: 'Hourly, daily, or weekly — you decide' },
                  { icon: '📸', title: 'Enable screenshots', desc: 'Visual diffs for pixel-perfect comparison' },
                  { icon: '🔔', title: 'Get notified', desc: 'We alert you when something changes' },
                ].map((tip) => (
                  <div key={tip.title} className="flex items-start gap-3">
                    <span className="text-lg shrink-0">{tip.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tip.title}</p>
                      <p className="text-xs text-muted">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setShowAdd(true)} className="btn-primary">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add your first page
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-gray-900">Tracked pages <span className="text-muted font-normal ml-2">{pages.length}</span></h2>
            </div>
            <div className="space-y-3">
              {pages.map((page, index) => {
                const isChecking = checkingIds.has(page.id);
                return (
                  <div key={page.id} className="card p-5 card-hover animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                            {page.label.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5">
                              <Link href={`/dashboard/${page.id}`} className="font-medium text-gray-900 hover:text-accent-600 transition-colors">{page.label}</Link>
                              {parseInt(page.changes_count) > 0 && <span className="badge-accent">{page.changes_count} change{page.changes_count !== '1' ? 's' : ''}</span>}
                              {!page.last_checked_at && <span className="badge-warning">Pending</span>}
                              {page.screenshot_enabled && (
                                <span className="inline-flex items-center gap-1 text-xs text-accent-600">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.828 12h8.484M9.828 12l-1.414-1.414M9.828 12l1.414 1.414M12 4v16" />
                                  </svg>
                                  SS
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted truncate mt-0.5 max-w-lg">{page.url}</p>
                            <p className="text-xs text-muted mt-1">
                              {page.last_checked_at ? `Checked ${timeAgo(new Date(page.last_checked_at))}` : 'Never checked'}
                              {' · '}Every {page.check_interval_hours}h
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 ml-4 shrink-0">
                        <button onClick={() => handleCheckNow(page.id)} disabled={isChecking} className="btn-ghost text-xs">
                          {isChecking ? (
                            <span className="flex items-center gap-1.5">
                              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Checking
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Check now
                            </span>
                          )}
                        </button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <Link href={`/dashboard/${page.id}`} className="btn-ghost text-xs">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                        <button onClick={() => handleDelete(page.id)} className="btn-danger text-xs">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
