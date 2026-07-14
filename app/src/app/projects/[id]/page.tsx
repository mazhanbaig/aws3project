'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const token = getToken();
    const payload = token ? decodeToken(token) : null;
    Promise.all([
      fetch(`${API}/projects/${id}`).then(r => r.json()),
      fetch(`${API}/projects`).then(r => r.json()),
    ]).then(([pData, allData]) => {
      const proj = pData.project;
      setProject(proj);
      setAllProjects(allData.projects || []);
      if (proj && payload) {
        setIsOwner(proj.user_id === payload.userId);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this project permanently?')) return;
    const token = getToken();
    await fetch(`${API}/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    router.push('/dashboard');
  }

  const relatedProjects = allProjects.filter((p: any) =>
    p.id !== Number(id) && p.user_id === project?.user_id
  ).slice(0, 3);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading project...</p>
      </div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Project not found</h2>
        <p className="text-sm text-gray-500 mb-6">This project doesn&apos;t exist or has been removed.</p>
        <Link href="/projects" className="btn-primary">Browse projects</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-shadow">PF</div>
            <span className="font-semibold text-gray-900">ProjectFolio</span>
          </Link>
          <div className="flex items-center gap-2">
            <DarkToggle />
            <Link href="/projects" className="btn-ghost text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back
            </Link>
            {isOwner && (
              <>
                <Link href={`/dashboard/${project.id}`} className="btn-soft text-sm">Edit</Link>
                <button onClick={handleDelete} className="btn-danger text-sm">Delete</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="card overflow-hidden animate-slide-up">
          {project.image_url ? (
            <div className="w-full h-72 md:h-96 bg-gray-100 relative">
              <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
              <span className="text-6xl">📁</span>
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                <p className="text-gray-500 leading-relaxed">{project.description || 'No description provided.'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {(project.tech_stack || []).map((t: string) => <span key={t} className="tag-indigo">{t}</span>)}
              {(!project.tech_stack || project.tech_stack.length === 0) && (
                <span className="text-xs text-gray-400">No tech stack listed</span>
              )}
            </div>

            {(project.github_url || project.live_url) && (
              <div className="flex flex-wrap gap-3 mb-6">
                {project.github_url && (
                  <a href={project.github_url} target="_blank" className="btn-secondary">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    View on GitHub
                  </a>
                )}
                {project.live_url && (
                  <a href={project.live_url} target="_blank" className="btn-primary">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    Live demo
                  </a>
                )}
              </div>
            )}

            <div className="divider" />

            <div className="pt-6 flex items-center gap-4">
              <div className="avatar-md">{project.display_name?.charAt(0).toUpperCase() || '?'}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{project.display_name || 'Anonymous'}</p>
                <p className="text-xs text-gray-400">
                  {project.created_at && new Date(project.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              {isOwner && (
                <span className="badge-accent ml-auto">Your project</span>
              )}
            </div>
          </div>
        </div>

        {relatedProjects.length > 0 && (
          <section className="mt-10 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">More by {project.display_name || 'this developer'}</h2>
                <p className="text-sm text-gray-500 mt-0.5">Other projects from the same creator</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedProjects.map((p: any, i: number) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="card card-hover p-5 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-center gap-2 mb-2">
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-sm">📁</div>
                    )}
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{p.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{p.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-1">
                    {(p.tech_stack || []).slice(0, 3).map((t: string) => <span key={t} className="tag text-[10px]">{t}</span>)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
