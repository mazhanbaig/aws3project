'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState('');

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (techFilter) params.set('tech', techFilter);
      const res = await fetch(`${API}/projects?${params}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {}
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchProjects();
  }

  const allTechs = [...new Set(projects.flatMap(p => p.tech_stack || []))].sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">PF</div>
            <span className="font-semibold text-sm text-gray-900">ProjectFolio</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm">Join</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Explore projects</h1>
          <p className="text-sm text-gray-500 mt-1">Discover what developers are building</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="input-field max-w-xs" />
          <button type="submit" className="btn-primary">Search</button>
          {allTechs.length > 0 && (
            <select value={techFilter} onChange={e => { setTechFilter(e.target.value); setTimeout(fetchProjects, 0); }} className="input-field max-w-[160px]">
              <option value="">All tech</option>
              {allTechs.map((t: string) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </form>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-5">{[1,2,3,4,5,6].map(i => <div key={i} className="card p-5"><div className="skeleton h-40 rounded-lg mb-3" /><div className="skeleton h-5 w-2/3 mb-2" /><div className="skeleton h-4 w-full" /></div>)}</div>
        ) : projects.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-gray-400 text-sm">No projects found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {projects.map((p, i) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="card card-hover overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                {p.image_url ? <div className="h-40 bg-gray-50 overflow-hidden"><img src={p.image_url} alt={p.title} className="w-full h-full object-cover" /></div>
                  : <div className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center"><span className="text-4xl">📁</span></div>}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{p.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(p.tech_stack || []).slice(0, 3).map((t: string) => <span key={t} className="tag">{t}</span>)}
                    {(p.tech_stack || []).length > 3 && <span className="tag">+{p.tech_stack.length - 3}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
