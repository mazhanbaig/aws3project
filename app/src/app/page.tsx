'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

import DarkToggle from '@/components/dark-toggle';

function getToken() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
    fetch(`${API}/projects`)
      .then(r => r.json())
      .then(d => { setProjects(d.projects || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-shadow">PF</div>
            <span className="font-semibold text-gray-900">ProjectFolio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/projects" className="btn-ghost">Explore</Link>
            <DarkToggle />
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary text-sm">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">Sign in</Link>
                <Link href="/signup" className="btn-primary text-sm">Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-200/30 via-purple-200/30 to-pink-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 md:pb-28 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-slow" />
            Showcase your work to the world
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.08] mb-6 animate-slide-up">
            Where developers{' '}
            <span className="gradient-text">showcase</span>
            <br />
            their best work
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Create a stunning portfolio of your projects, discover what others are building,
            and get your work noticed by the right people.
          </p>
          <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/signup" className="btn-primary text-base px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/20">
              Start building your portfolio
            </Link>
            <Link href="/projects" className="btn-secondary text-base px-8 py-3.5 rounded-xl">
              Explore projects
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[
            { num: '500+', label: 'Projects' },
            { num: '50+', label: 'Developers' },
            { num: '10+', label: 'Technologies' },
            { num: '100%', label: 'Free to use' },
          ].map((s, i) => (
            <div key={i} className="stat-card text-center animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-2xl md:text-3xl font-bold gradient-text">{s.num}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Get started in minutes and join a community of developers building in public.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { step: '01', emoji: '🎨', title: 'Create your profile', desc: 'Sign up in seconds and set up your developer profile with your unique portfolio link.' },
            { step: '02', emoji: '📦', title: 'Add your projects', desc: 'Showcase your work with descriptions, tech stacks, GitHub links, and live demos.' },
            { step: '03', emoji: '🌍', title: 'Share & discover', desc: 'Share your portfolio, explore projects by others, and get inspired by the community.' },
          ].map((f, i) => (
            <div key={i} className="card p-7 card-hover relative animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <span className="text-[10px] font-bold text-indigo-400 tracking-widest">{f.step}</span>
              <div className="text-3xl mt-3 mb-4">{f.emoji}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured projects</h2>
            <p className="text-sm text-gray-500 mt-1">Discover what developers are building right now</p>
          </div>
          <Link href="/projects" className="btn-soft">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-48 rounded-none" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <p className="text-gray-400 text-sm mb-4">No projects yet. Be the first to showcase!</p>
            <Link href="/signup" className="btn-primary">Add your project</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {projects.slice(0, 6).map((p: any, i: number) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="card card-hover overflow-hidden group animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="relative">
                  {p.image_url ? (
                    <div className="h-48 bg-gray-100 overflow-hidden">
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                      <span className="text-5xl">📁</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="avatar-xs text-[9px]">{p.display_name?.charAt(0) || '?'}</div>
                    <span className="text-xs text-gray-400 truncate">{p.display_name || 'Anonymous'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{p.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(p.tech_stack || []).slice(0, 3).map((t: string) => <span key={t} className="tag">{t}</span>)}
                    {(p.tech_stack || []).length > 3 && <span className="tag">+{p.tech_stack.length - 3}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-gradient-to-b from-transparent to-indigo-50/30 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to showcase your work?</h2>
            <p className="text-gray-500 leading-relaxed">Join other developers building in public. Create your portfolio in minutes and share your projects with the world.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/signup" className="btn-primary text-base px-8 py-3.5 rounded-xl">Create your portfolio</Link>
            <Link href="/projects" className="btn-secondary text-base px-8 py-3.5 rounded-xl">Browse projects</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold">PF</div>
              <span className="text-sm font-semibold text-gray-900">ProjectFolio</span>
            </div>
            <p className="text-xs text-gray-400">Built with Next.js, Lambda, API Gateway & AWS</p>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <Link href="/projects" className="hover:text-gray-600 transition-colors">Explore</Link>
              <Link href="/login" className="hover:text-gray-600 transition-colors">Sign in</Link>
              <Link href="/signup" className="hover:text-gray-600 transition-colors">Sign up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
