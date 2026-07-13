'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/projects`)
      .then(r => r.json())
      .then(d => { setProjects(d.projects || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">PF</div>
            <span className="font-semibold text-sm text-gray-900">ProjectFolio</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/projects" className="btn-ghost text-sm">Explore</Link>
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm">Get started</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-subtle" />
          Showcase your work to the world
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-5">
          Where developers{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">showcase</span>
          {' '}their best work
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Create a beautiful portfolio of your projects, discover what others are building,
          and get your work noticed by the right people.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/signup" className="btn-primary text-base px-8 py-3.5 rounded-xl">
            Start building your portfolio
          </Link>
          <Link href="/projects" className="btn-secondary text-base px-8 py-3.5 rounded-xl">
            Explore projects
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { emoji: '🎨', title: 'Beautiful showcase', desc: 'Present your projects with images, tech stack tags, and live demo links.' },
            { emoji: '🔍', title: 'Discover projects', desc: 'Browse projects by tech stack, find inspiration, and connect with creators.' },
            { emoji: '🚀', title: 'Get noticed', desc: 'Share your portfolio link on LinkedIn, GitHub, and resume for maximum visibility.' },
          ].map((f, i) => (
            <div key={i} className="card p-6 card-hover animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-2xl mb-3">{f.emoji}</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Featured projects</h2>
            <Link href="/projects" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View all →</Link>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-5">
              {[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-40 rounded-lg mb-3" /><div className="skeleton h-5 w-2/3 mb-2" /><div className="skeleton h-4 w-full mb-1" /></div>)}
            </div>
          ) : projects.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-400 text-sm">No projects yet. Be the first to showcase!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {projects.slice(0, 6).map((p: any, i: number) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="card card-hover overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  {p.image_url && <div className="h-40 bg-gray-50 overflow-hidden"><img src={p.image_url} alt={p.title} className="w-full h-full object-cover" /></div>}
                  {!p.image_url && <div className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center"><span className="text-4xl">📁</span></div>}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{p.title}</h3>
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
        </div>
      </section>

      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ready to showcase your work?</h2>
            <p className="text-sm text-gray-500 mt-1">Join other developers building in public.</p>
          </div>
          <Link href="/signup" className="btn-primary px-8 py-3 rounded-xl shrink-0">Create your portfolio</Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">ProjectFolio — Built with Next.js, Lambda, API Gateway & AWS</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/projects" className="hover:text-gray-600">Explore</Link>
            <Link href="/login" className="hover:text-gray-600">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
