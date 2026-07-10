'use client';

import { useState, useEffect, useRef } from 'react';

interface VisualDiffViewProps {
  changeId: number;
  pageId: string;
  hasScreenshots: boolean;
  diffPercent: number | null;
}

export function VisualDiffView({ changeId, pageId, hasScreenshots, diffPercent: initialDiffPct }: VisualDiffViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loadedPct, setLoadedPct] = useState<number | null>(initialDiffPct);
  const loadedRef = useRef(false);

  useEffect(() => {
    return () => {
      // Cleanup object URL on unmount
      if (imgSrc) URL.revokeObjectURL(imgSrc);
    };
  }, [imgSrc]);

  async function loadImage() {
    if (loading || loadedRef.current) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/tracked-pages/${pageId}/visual-diff?changeId=${changeId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to load visual comparison');
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setImgSrc(objectUrl);

      // Read diff metadata from response headers
      const pct = res.headers.get('X-Diff-Percent');
      if (pct) setLoadedPct(parseFloat(pct));

      loadedRef.current = true;
    } catch {
      setError('Failed to load visual comparison');
    }

    setLoading(false);
  }

  const pct = loadedPct !== null ? loadedPct : 0;

  if (!hasScreenshots) {
    return (
      <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2.5 border border-amber-100 flex items-start gap-2">
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <span>Screenshots are only available when &quot;Enable screenshots&quot; is turned on for this tracked page. <button onClick={loadImage} className="underline hover:text-amber-800">Try loading anyway</button></span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Diff summary */}
      {pct > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-accent-600 bg-accent-50 px-2.5 py-1 rounded-lg">
            {pct}% visual change detected
          </span>
          <span className="text-xs text-muted">(pixel-level comparison)</span>
        </div>
      )}

      {/* Image display */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-soft/50 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-accent-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-muted">Loading visual comparison...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12 bg-soft/50 rounded-xl">
          <div className="text-center">
            <svg className="w-8 h-8 text-muted mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-muted">{error}</p>
            <button onClick={loadImage} className="text-xs text-accent-600 hover:text-accent-700 mt-2 underline">
              Try again
            </button>
          </div>
        </div>
      ) : imgSrc ? (
        <div className="rounded-xl overflow-hidden border border-border bg-white">
          <div className="relative">
            <img
              src={imgSrc}
              alt="Visual diff showing page changes (red = changed pixels)"
              className="w-full h-auto"
              style={{ maxHeight: '600px', objectFit: 'contain' }}
            />
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs text-gray-600 border border-border shadow-sm">
              Diff overlay · red = changed pixels
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 bg-soft/50 rounded-xl">
          <button
            onClick={loadImage}
            className="flex flex-col items-center gap-2 text-muted hover:text-accent-600 transition-colors group"
          >
            <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium">View visual comparison</span>
            <span className="text-xs text-muted">Shows changed pixels highlighted in red</span>
          </button>
        </div>
      )}
    </div>
  );
}
