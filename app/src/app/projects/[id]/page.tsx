'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/projects/${id}`)
      .then(r => r.json())
      .then(d => { setProject(d.project); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse-subtle text-gray-400 text-sm">Loading...</div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-4">Project not found</p>
        <Link href="/projects" className="btn-ghost text-sm">Back to projects</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">PF</div>
            <span className="font-semibold text-sm text-gray-900">ProjectFolio</span>
          </Link>
          <Link href="/projects" className="btn-ghost text-sm">← Back</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="card overflow-hidden">
          {project.image_url && <div className="w-full h-64 bg-gray-50"><img src={project.image_url} alt={project.title} className="w-full h-full object-cover" /></div>}
          {!project.image_url && <div className="w-full h-48 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center"><span className="text-5xl">📁</span></div>}
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <p className="text-gray-500 text-sm mb-4">{project.description || 'No description provided.'}</p>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {(project.tech_stack || []).map((t: string) => <span key={t} className="tag px-2.5 py-1">{t}</span>)}
            </div>

            {(project.github_url || project.live_url) && (
              <div className="flex flex-wrap gap-3 mb-6">
                {project.github_url && <a href={project.github_url} target="_blank" className="btn-secondary text-sm"><svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>View on GitHub</a>}
                {project.live_url && <a href={project.live_url} target="_blank" className="btn-primary text-sm"><svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>Live demo</a>}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xs font-bold text-indigo-600">{project.display_name?.charAt(0) || '?'}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{project.display_name || 'Anonymous'}</p>
                <p className="text-xs text-gray-400">{new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
