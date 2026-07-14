'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

function getToken() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState({ title: '', description: '', tech_stack: '', github_url: '', live_url: '', image_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProject() {
      const token = getToken();
      if (!token) { router.push('/login'); return; }
      try {
        const res = await fetch(`${API}/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        const p = data.project;
        setForm({
          title: p.title || '',
          description: p.description || '',
          tech_stack: (p.tech_stack || []).join(', '),
          github_url: p.github_url || '',
          live_url: p.live_url || '',
          image_url: p.image_url || '',
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
    const token = getToken();
    if (!token) { router.push('/login'); return; }
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
    const token = getToken();
    if (!token) { router.push('/login'); return; }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error && !form.title) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Link href="/dashboard" className="btn-primary">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="btn-ghost flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Dashboard
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            <span className="text-sm font-semibold text-gray-900">Edit project</span>
          </div>
          <button onClick={handleDelete} className="btn-danger text-sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="card p-8 animate-slide-up">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Edit project</h1>
          <p className="text-sm text-gray-500 mb-6">Update your project details</p>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-100 mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Title</label>
              <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input-field min-h-[120px] resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div>
              <label className="label">Tech stack <span className="text-gray-400 font-normal">(comma-separated)</span></label>
              <input className="input-field" value={form.tech_stack} onChange={e => setForm({ ...form, tech_stack: e.target.value })} placeholder="React, Node.js, PostgreSQL" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">GitHub URL</label>
                <input className="input-field" value={form.github_url} onChange={e => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="label">Live URL</label>
                <input className="input-field" value={form.live_url} onChange={e => setForm({ ...form, live_url: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="label">Image URL</label>
              <input className="input-field" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://example.com/screenshot.png" />
              {form.image_url && <img src={form.image_url} alt="preview" className="mt-3 h-32 rounded-xl object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
                ) : 'Save changes'}
              </button>
              <Link href="/dashboard" className="btn-ghost">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
