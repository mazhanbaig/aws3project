'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState({ title: '', description: '', tech_stack: '', github_url: '', live_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProject() {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      try {
        const res = await fetch(`${API}/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setForm({
          title: data.project.title || '',
          description: data.project.description || '',
          tech_stack: (data.project.tech_stack || []).join(', '),
          github_url: data.project.github_url || '',
          live_url: data.project.live_url || '',
        });
      } catch {
        setError('Project not found');
      }
      setLoading(false);
    }
    loadProject();
  }, [id, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          tech_stack: form.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      router.push('/dashboard');
    } catch {
      setError('Failed to save project');
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm('Delete this project permanently?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/dashboard');
    } catch {
      setError('Failed to delete');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-accent-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !form.title) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">{error}</p>
          <Link href="/dashboard" className="btn-primary">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted hover:text-gray-900 transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <div className="w-px h-5 bg-border" />
            <span className="text-sm font-medium">Edit project</span>
          </div>
          <button onClick={handleDelete} className="btn-danger text-xs">
            Delete project
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="card p-8">
          <h1 className="text-xl font-semibold tracking-tight mb-6">Edit project</h1>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-[100px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div>
              <label className="label">Tech stack (comma-separated)</label>
              <input className="input" value={form.tech_stack} onChange={e => setForm({ ...form, tech_stack: e.target.value })} placeholder="React, Node.js, PostgreSQL" />
            </div>
            <div>
              <label className="label">GitHub URL</label>
              <input className="input" value={form.github_url} onChange={e => setForm({ ...form, github_url: e.target.value })} />
            </div>
            <div>
              <label className="label">Live URL</label>
              <input className="input" value={form.live_url} onChange={e => setForm({ ...form, live_url: e.target.value })} />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <Link href="/dashboard" className="text-sm text-muted hover:text-gray-900 transition-colors">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
