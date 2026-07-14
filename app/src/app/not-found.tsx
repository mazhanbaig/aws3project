import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-sm animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-6">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold gradient-text mb-2">404</h1>
        <p className="text-gray-500 text-sm mb-8">This page doesn&apos;t exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">Go home</Link>
          <Link href="/projects" className="btn-secondary">Browse projects</Link>
        </div>
      </div>
    </div>
  );
}
