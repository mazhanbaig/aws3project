'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

function getToken() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          description,
          techStack: techStack.split(',').map(s => s.trim()).filter(Boolean),
          githubUrl,
          liveUrl,
          imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create project'); setLoading(false); return; }
      router.push('/dashboard');
    } catch { setError('Network error'); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">PF</div>
            <span className="font-semibold text-sm text-gray-900">ProjectFolio</span>
          </Link>
          <Link href="/dashboard" className="btn-ghost text-sm">Back</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Add new project</h1>
          <p className="text-sm text-gray-500 mt-1">Showcase your work to the developer community</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. E-commerce Dashboard" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="A brief description of your project" className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tech Stack</label>
            <input type="text" value={techStack} onChange={e => setTechStack(e.target.value)} placeholder="React, Node.js, PostgreSQL (comma separated)" className="input-field" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">GitHub URL</label>
              <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Live URL</label>
              <input type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://..." className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/screenshot.png" className="input-field" />
            {imageUrl && <img src={imageUrl} alt="preview" className="mt-2 h-32 rounded-lg object-cover border border-gray-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
          </div>
          {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2.5 border border-red-100">{error}</div>}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Adding...' : 'Add project'}</button>
            <Link href="/dashboard" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
