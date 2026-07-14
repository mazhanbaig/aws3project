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

function decodeToken(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    setUser(decodeToken(token));
  }, [router]);

  function handleLogout() {
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md">PF</div>
            <span className="font-semibold text-gray-900">ProjectFolio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
            <button onClick={handleLogout} className="btn-danger text-sm">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="btn-ghost p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences</p>
          </div>
        </div>

        <div className="card p-6 mb-4 animate-slide-up">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input-field" value={user?.email || ''} readOnly disabled />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="label">Display name</label>
              <input className="input-field" value={user?.email?.split('@')[0] || 'Developer'} readOnly disabled />
              <p className="text-xs text-gray-400 mt-1">Update your display name when creating projects</p>
            </div>
          </div>
        </div>

        <div className="card p-6 mb-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Preferences</h2>
          <ThemeToggle />
        </div>

        <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Danger zone</h2>
          <p className="text-xs text-gray-500 mb-4">Sign out of your account on this device.</p>
          <button onClick={handleLogout} className="btn-danger border border-red-200 bg-red-50 px-5 py-2.5 rounded-xl hover:bg-red-100">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  const toggle = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900">Dark mode</p>
        <p className="text-xs text-gray-500 mt-0.5">Toggle dark mode across the app</p>
      </div>
      <button
        onClick={toggle}
        className={`relative w-12 h-6.5 rounded-full transition-colors duration-200 ${mounted && dark ? 'bg-indigo-600' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${mounted && dark ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
