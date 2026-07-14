'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DarkToggle from '@/components/dark-toggle';

const API = process.env.NEXT_PUBLIC_API_URL || '';

function getToken() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

function decodeToken(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [communityProjects, setCommunityProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    const payload = decodeToken(token);
    if (payload) setUser(payload);
    fetchProjects();
    fetchCommunity();
  }, []);

  async function fetchProjects() {
    const token = getToken();
    const payload = decodeToken(token);
    try {
      const res = await fetch(`${API}/projects?userId=${payload.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {}
    setLoading(false);
  }

  async function fetchCommunity() {
    try {
      const res = await fetch(`${API}/projects`);
      const data = await res.json();
      setCommunityProjects(data.projects || []);
    } catch {}
    setCommunityLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this project permanently?')) return;
    const token = getToken();
    await fetch(`${API}/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProjects();
  }

  function handleLogout() {
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    router.push('/');
  }

  const techStack = [...new Set(projects.flatMap(p => p.tech_stack || []))];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-shadow">PF</div>
            <span className="font-semibold text-gray-900">ProjectFolio</span>
          </Link>
          <div className="flex items-center gap-2">
            <DarkToggle />
            <Link href="/projects" className="btn-ghost text-sm">Explore</Link>
            <Link href="/dashboard/new" className="btn-primary text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              New project
            </Link>
            <button onClick={handleLogout} className="btn-ghost text-sm">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {user && (
          <div className="card p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 animate-slide-up">
            <div className="avatar-lg">{user.email?.charAt(0).toUpperCase() || '?'}</div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900">{user.email?.split('@')[0] || 'Developer'}</h2>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{projects.length}</p>
                <p className="text-xs text-gray-500">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{techStack.length}</p>
                <p className="text-xs text-gray-500">Technologies</p>
              </div>
              <Link href="/projects" className="btn-soft ml-2">View public profile →</Link>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My projects</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and showcase your work</p>
            </div>
            <Link href="/dashboard/new" className="btn-primary text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add project
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="card p-5"><div className="skeleton h-5 w-48 mb-2" /><div className="skeleton h-4 w-full" /></div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-5xl mb-4">📁</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Add your first project to start building your portfolio and sharing your work with the community.</p>
              <Link href="/dashboard/new" className="btn-primary">Add your first project</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((p, i) => (
                <div key={p.id} className="card p-5 card-hover animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {p.image_url ? (
                        <Link href={`/projects/${p.id}`}>
                          <img src={p.image_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        </Link>
                      ) : (
                        <Link href={`/projects/${p.id}`} className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-2xl shrink-0">📁</Link>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/projects/${p.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">{p.title}</Link>
                          {p.featured && <span className="badge-accent text-[10px]">Featured</span>}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{p.description || 'No description'}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(p.tech_stack || []).slice(0, 5).map((t: string) => <span key={t} className="tag text-[10px]">{t}</span>)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/dashboard/${p.id}`} className="btn-ghost text-xs p-2" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                      {p.live_url && <a href={p.live_url} target="_blank" className="btn-ghost text-xs p-2" title="Live demo"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>}
                      <button onClick={() => handleDelete(p.id)} className="btn-danger text-xs p-2" title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="divider my-10" />

        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Community projects</h2>
              <p className="text-sm text-gray-500 mt-0.5">Discover what other developers are building</p>
            </div>
            <Link href="/projects" className="btn-soft text-sm">Browse all →</Link>
          </div>

          {communityLoading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-32 rounded-lg mb-3" /><div className="skeleton h-4 w-2/3 mb-2" /><div className="skeleton h-3 w-full" /></div>)}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {communityProjects.filter((cp: any) => !projects.find((mp: any) => mp.id === cp.id)).slice(0, 6).map((p: any, i: number) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="card card-hover p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="avatar-xs text-[9px]">{p.display_name?.charAt(0) || '?'}</div>
                    <span className="text-xs text-gray-500 truncate">{p.display_name || 'Anonymous'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{p.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-1">
                    {(p.tech_stack || []).slice(0, 3).map((t: string) => <span key={t} className="tag text-[10px]">{t}</span>)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
