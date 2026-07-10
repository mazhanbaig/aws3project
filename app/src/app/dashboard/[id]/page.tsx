'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';

interface Change {
  id: number;
  old_snapshot_id: number | null;
  new_snapshot_id: number;
  added_lines_count: number;
  removed_lines_count: number;
  diff_summary: string;
  detected_at: string;
  old_s3_key: string | null;
  new_s3_key: string;
  old_fetched_at: string | null;
  new_fetched_at: string;
}

interface PageInfo {
  id: number;
  label: string;
  url: string;
  check_interval_hours: number;
  last_checked_at: string | null;
  created_at: string;
}

function PageDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [page, setPage] = useState<PageInfo | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  async function loadData() {
    const [pageRes, changesRes] = await Promise.all([
      fetch(`/api/tracked-pages/${id}`),
      fetch(`/api/tracked-pages/${id}/changes`),
    ]);

    if (pageRes.status === 401) {
      router.push('/login');
      return;
    }

    if (!pageRes.ok || !changesRes.ok) {
      setError('Failed to load data');
      setLoading(false);
      return;
    }

    const pageData = await pageRes.json();
    const changesData = await changesRes.json();
    setPage(pageData.page);
    setChanges(changesData.changes);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleCheckNow() {
    setChecking(true);
    await fetch(`/api/tracked-pages/${id}/check-now`, { method: 'POST' });
    setChecking(false);
    loadData();
  }

  async function handleDelete() {
    if (!confirm('Delete this tracked page and all its history?')) return;
    await fetch(`/api/tracked-pages/${id}`, { method: 'DELETE' });
    router.push('/dashboard');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-accent-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">{error || 'Page not found'}</p>
          <Link href="/dashboard" className="btn-primary">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted hover:text-gray-900 transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <div className="w-px h-5 bg-border" />
            <span className="text-sm font-medium truncate max-w-xs">{page.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCheckNow} disabled={checking} className="btn-primary text-xs">
              {checking ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Checking...
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
            <button onClick={handleDelete} className="btn-danger text-xs">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="card p-6 mb-8 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center text-sm font-semibold shrink-0">
              {page.label.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold tracking-tight">{page.label}</h1>
              <p className="text-sm text-muted mt-0.5 break-all">{page.url}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {page.last_checked_at ? `Last checked ${timeAgo(new Date(page.last_checked_at))}` : 'Never checked'}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Every {page.check_interval_hours}h
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {changes.length} change{changes.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-base font-medium text-gray-900 mb-5">Change history</h2>

          {changes.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-soft mb-4">
                <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-900 font-medium mb-1">No changes recorded yet</p>
              <p className="text-xs text-muted">Click &ldquo;Check now&rdquo; to take the first snapshot</p>
            </div>
          ) : (
            <div className="space-y-3">
              {changes.map((change, index) => (
                <ChangeCard key={change.id} change={change} pageId={id} index={index} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PageDetailPage() {
  return (
    <ErrorBoundary>
      <PageDetailContent />
    </ErrorBoundary>
  );
}

function ChangeCard({ change, pageId, index }: { change: Change; pageId: string; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [diffLines, setDiffLines] = useState<{ type: string; text: string }[] | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  async function loadDiff() {
    if (diffLines || loadingDiff) return;
    if (!change.old_s3_key) {
      setDiffLines([{ type: 'initial', text: 'Initial snapshot — no previous version to compare.' }]);
      return;
    }
    setLoadingDiff(true);
    try {
      const res = await fetch(`/api/tracked-pages/${pageId}/diff-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldS3Key: change.old_s3_key, newS3Key: change.new_s3_key }),
      });
      if (res.ok) {
        const data = await res.json();
        setDiffLines(data.lines);
      }
    } catch { /* fallback */ }
    setLoadingDiff(false);
  }

  function handleToggle() {
    if (!expanded) loadDiff();
    setExpanded(!expanded);
  }

  const date = new Date(change.detected_at);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const hasChanges = change.added_lines_count > 0 || change.removed_lines_count > 0;

  return (
    <div className="card overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
      <button onClick={handleToggle} className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50/50 transition-colors">
        <div className="flex flex-col items-center shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full border-2 ${hasChanges ? 'bg-accent-500 border-accent-500' : 'bg-soft border-border'}`} />
        </div>
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="text-right shrink-0 w-14">
            <div className="text-sm font-medium text-gray-900">{dateStr}</div>
            <div className="text-xs text-muted">{timeStr}</div>
          </div>
          <div className="w-px h-8 bg-border shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              {hasChanges ? (
                <>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    {change.added_lines_count}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                    {change.removed_lines_count}
                  </span>
                </>
              ) : (
                <span className="text-xs font-medium text-muted bg-soft px-2 py-0.5 rounded-full">Initial snapshot</span>
              )}
              <span className="text-sm text-muted truncate">{change.diff_summary}</span>
            </div>
          </div>
        </div>
        <svg className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-border animate-fade-in">
          {loadingDiff ? (
            <div className="p-6 flex items-center justify-center gap-2 text-sm text-muted">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading diff...
            </div>
          ) : diffLines ? (
            <div className="p-4 overflow-x-auto max-h-96 overflow-y-auto">
              <pre className="text-xs leading-relaxed font-mono">
                {diffLines.map((line, i) => (
                  <div key={i} className={`px-3 py-0.5 -mx-3 whitespace-pre-wrap break-all ${
                    line.type === 'added'
                      ? 'bg-emerald-50/70 text-emerald-800 border-l-2 border-emerald-400'
                      : line.type === 'removed'
                      ? 'bg-amber-50/70 text-amber-800 border-l-2 border-amber-400'
                      : 'text-gray-600 border-l-2 border-transparent'
                  }`}>
                    <span className="select-none mr-2 opacity-50">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
                    </span>
                    {line.text}
                  </div>
                ))}
              </pre>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted">Could not load diff content.</div>
          )}
        </div>
      )}
    </div>
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
