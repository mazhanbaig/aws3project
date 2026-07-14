'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DarkToggle from '@/components/dark-toggle';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [userRes, projRes] = await Promise.all([
          fetch(`${API}/users/${id}`).then(r => r.json()),
          fetch(`${API}/projects?userId=${id}&limit=50`).then(r => r.json()),
        ]);
        setUser(userRes.user);
        setProjects(projRes.projects || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading profile...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">User not found</h2>
        <p className="text-sm text-gray-500 mb-6">This developer profile doesn&apos;t exist.</p>
        <Link href="/projects" className="btn-primary">Browse projects</Link>
      </div>
    </div>
  );

  const techStack = [...new Set(projects.flatMap(p => p.tech_stack || []))];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md">PF</div>
            <span className="font-semibold text-gray-900">ProjectFolio</span>
          </Link>
          <DarkToggle />
          <Link href="/projects" className="btn-ghost flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="card p-8 mb-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="avatar-lg text-2xl">{user.display_name?.charAt(0).toUpperCase() || '?'}</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{user.display_name || 'Anonymous Developer'}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{user.email || 'No email'}</p>
              {user.created_at && (
                <p className="text-xs text-gray-400 mt-1">
                  Joined {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text">{projects.length}</p>
                <p className="text-xs text-gray-500">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text">{techStack.length}</p>
                <p className="text-xs text-gray-500">Technologies</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''} by {user.display_name || 'this developer'}</p>
        </div>

        {projects.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">📁</div>
            <p className="text-sm text-gray-400">No projects yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {projects.map((p, i) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="card card-hover overflow-hidden group animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                {p.image_url ? (
                  <div className="h-36 bg-gray-100 overflow-hidden">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="h-36 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                    <span className="text-4xl">📁</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors truncate">{p.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-2">{p.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-1">
                    {(p.tech_stack || []).slice(0, 3).map((t: string) => <span key={t} className="tag text-[10px]">{t}</span>)}
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
