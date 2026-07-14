'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

import DarkToggle from '@/components/dark-toggle';

const PAGE_LIMIT = 12;

function getToken() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [allTechs, setAllTechs] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
    fetchProjects();
  }, []);

  async function fetchProjects(searchTerm?: string, tech?: string, append?: boolean) {
    const p = append ? page : 1;
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm || search) params.set('search', searchTerm || search);
      if (tech || techFilter) params.set('tech', tech || techFilter);
      params.set('page', String(p));
      params.set('limit', String(PAGE_LIMIT));
      const res = await fetch(`${API}/projects?${params}`);
      const data = await res.json();
      const list = data.projects || [];
      if (append) {
        setProjects(prev => [...prev, ...list]);
        setPage(p + 1);
      } else {
        setProjects(list);
        setPage(2);
      }
      setHasMore(list.length === PAGE_LIMIT);
      if (!tech && !techFilter && !append) {
        setAllTechs([...new Set(list.flatMap((p: any) => p.tech_stack || []))].sort() as string[]);
      }
    } catch {}
    if (append) setLoadingMore(false); else setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchProjects();
  }

  function handleTechChange(value: string) {
    setTechFilter(value);
    setTimeout(() => fetchProjects(search, value), 0);
  }

  function loadMore() {
    fetchProjects(search, techFilter, true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-shadow">PF</div>
            <span className="font-semibold text-gray-900">ProjectFolio</span>
          </Link>
          <div className="flex items-center gap-2">
            <DarkToggle />
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary text-sm">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link href="/signup" className="btn-primary text-sm">Join</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Explore projects</h1>
          <p className="text-sm text-gray-500 mt-1">Discover what developers are building around the world</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="input-field pl-10" />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>
          {allTechs.length > 0 && (
            <select value={techFilter} onChange={e => handleTechChange(e.target.value)} className="input-field max-w-[180px]">
              <option value="">All technologies</option>
              {allTechs.map((t: string) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          <div className="flex items-center bg-white border border-gray-300 rounded-xl p-1 gap-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        {loading ? (
          viewMode === 'grid' ? (
            <div className="grid md:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton h-48 rounded-none" />
                  <div className="p-5 space-y-3"><div className="skeleton h-4 w-2/3" /><div className="skeleton h-3 w-full" /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="card p-5"><div className="skeleton h-5 w-48 mb-2" /><div className="skeleton h-4 w-full" /></div>)}
            </div>
          )
        ) : projects.length === 0 ? (
          <div className="card p-16 text-center animate-fade-in">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h2>
            <p className="text-sm text-gray-500 mb-6">No projects match your search. Try different keywords or filters.</p>
            <button onClick={() => { setSearch(''); setTechFilter(''); fetchProjects('', ''); }} className="btn-secondary">Clear filters</button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-3 gap-5">
            {projects.map((p, i) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="card card-hover overflow-hidden group animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="relative">
                  {p.image_url ? (
                    <div className="h-44 bg-gray-100 overflow-hidden">
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                      <span className="text-4xl">📁</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="avatar-xs text-[9px]">{p.display_name?.charAt(0) || '?'}</div>
                    <span className="text-xs text-gray-400 truncate">{p.display_name || 'Anonymous'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors truncate">{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{p.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(p.tech_stack || []).slice(0, 3).map((t: string) => <span key={t} className="tag">{t}</span>)}
                    {(p.tech_stack || []).length > 3 && <span className="tag">+{p.tech_stack.length - 3}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p, i) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="card card-hover p-4 flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xl shrink-0">📁</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{p.title}</h3>
                    <span className="avatar-xs text-[9px] shrink-0">{p.display_name?.charAt(0) || '?'}</span>
                    <span className="text-xs text-gray-400 truncate">{p.display_name || 'Anonymous'}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{p.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(p.tech_stack || []).slice(0, 4).map((t: string) => <span key={t} className="tag text-[10px]">{t}</span>)}
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        )}

        {projects.length > 0 && hasMore && !loading && (
          <div className="text-center mt-10 animate-fade-in">
            <button onClick={loadMore} disabled={loadingMore} className="btn-secondary px-8 py-2.5 rounded-xl text-sm">
              {loadingMore ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />Loading...</span>
              ) : (
                'Load more projects'
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
