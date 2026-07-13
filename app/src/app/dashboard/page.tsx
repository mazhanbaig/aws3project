'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

function getToken() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch {}
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const token = getToken();
    const payload = JSON.parse(atob(token.split('.')[1]));
    try {
      const res = await fetch(`${API}/projects?userId=${payload.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {}
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this project?')) return;
    const token = getToken();
    await fetch(`${API}/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProjects();
  }

  function handleLogout() {
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">PF</div>
            <span className="font-semibold text-sm text-gray-900">ProjectFolio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/new" className="btn-primary text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              New project
            </Link>
            <button onClick={handleLogout} className="btn-ghost text-sm">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">My projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your project portfolio</p>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-5 w-48 mb-2" /><div className="skeleton h-4 w-full" /></div>)}</div>
        ) : projects.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-4xl mb-4">📁</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h2>
            <p className="text-sm text-gray-500 mb-6">Add your first project to start building your portfolio.</p>
            <Link href="/dashboard/new" className="btn-primary">Add your first project</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((p, i) => (
              <div key={p.id} className="card p-5 card-hover animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    {p.image_url ? <img src={p.image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      : <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-lg shrink-0">📁</div>}
                    <div className="min-w-0">
                      <Link href={`/projects/${p.id}`} className="font-medium text-gray-900 hover:text-indigo-600 transition-colors text-sm">{p.title}</Link>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{p.description || 'No description'}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(p.tech_stack || []).slice(0, 4).map((t: string) => <span key={t} className="tag">{t}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    {p.live_url && <a href={p.live_url} target="_blank" className="btn-ghost text-xs"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>}
                    <button onClick={() => handleDelete(p.id)} className="btn-danger text-xs"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
