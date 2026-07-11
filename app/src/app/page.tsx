'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4v16h18V4H3zm2 2h14v2H5V6zm0 4h14v8H5v-8z" />
        </svg>
      ),
      title: 'Automated Monitoring',
      description: 'Track competitor web pages on a schedule you define — hourly, daily, or weekly. Set it and forget it.',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Smart Diff Engine',
      description: 'Detect exactly what changed — added lines, removed lines, and visual differences — with a clean unified diff view.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.828 12h8.484M9.828 12l-1.414-1.414M9.828 12l1.414 1.414M12 4v16" />
        </svg>
      ),
      title: 'Visual Screenshots',
      description: 'Capture full-page screenshots of competitor sites and compare them side-by-side with pixel-level visual diffing.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Change History',
      description: 'Every detected change is recorded with a full timeline — review, compare, and analyze the evolution of any page.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      title: 'Real-time Notifications',
      description: 'Get notified the moment a competitor changes their pricing, features, or content — never miss an update.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Enterprise Security',
      description: 'JWT authentication, encrypted storage, and isolated environments. Your competitive intelligence stays private.',
      color: 'from-violet-500 to-indigo-500',
    },
  ];

  const steps = [
    { number: '01', title: 'Add a URL', description: 'Enter the competitor page you want to monitor — pricing page, feature list, changelog, or any public URL.' },
    { number: '02', title: 'Set your schedule', description: 'Choose how often to check: every hour, daily, weekly — whatever keeps you ahead.' },
    { number: '03', title: 'Enable screenshots', description: 'Toggle visual monitoring to capture full-page screenshots for pixel-perfect comparison.' },
    { number: '04', title: 'Track changes', description: 'Sit back as we monitor automatically. Get notified when something changes, with a detailed diff report.' },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '< 60s', label: 'Detection Time' },
    { value: 'Auto', label: 'Scalable Infra' },
    { value: 'Open', label: 'Source Code' },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for side projects and casual monitoring.',
      features: ['Up to 5 tracked pages', '24h check intervals', 'Text diff only', '7-day history', 'Community support'],
      cta: 'Get started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$12',
      period: '/month',
      description: 'For businesses that need serious competitor intel.',
      features: ['Up to 50 tracked pages', '1h check intervals', 'Text + visual diff', '90-day history', 'Email notifications', 'Priority support'],
      cta: 'Start free trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: '$49',
      period: '/month',
      description: 'For teams monitoring at scale.',
      features: ['Unlimited pages', '15min check intervals', 'All diff types', 'Unlimited history', 'Webhook integrations', 'SSO & API access', 'Dedicated support'],
      cta: 'Contact sales',
      highlighted: false,
    },
  ];

  const faqs = [
    { q: 'How does the diff engine work?', a: 'Our engine fetches the raw HTML of your target pages, extracts the visible text content, and computes a line-by-line unified diff. Added and removed lines are highlighted in green and red respectively. For visual diffs, we capture full-page screenshots using Puppeteer/Chromium and compare them pixel-by-pixel using pixelmatch.' },
    { q: 'Is my data secure?', a: 'Absolutely. All data is encrypted in transit (TLS) and at rest. We use JWT-based authentication with HttpOnly cookies. Your monitoring data is stored in your own isolated database. Source code is open for audit.' },
    { q: 'Can I monitor pages behind login?', a: 'Currently, we monitor public-facing pages. For authenticated pages, you would need to provide session tokens — this is on our roadmap.' },
    { q: 'What infrastructure does this run on?', a: 'The app is deployed on AWS using Terraform. It uses EC2 (Auto Scaling Group) behind an Application Load Balancer, RDS PostgreSQL for storage, S3 for screenshots, and CloudWatch for monitoring. The setup is fully infrastructure-as-code.' },
    { q: 'Can I self-host this?', a: 'Yes! The entire infrastructure is defined as Terraform code and the app is open source. You can deploy your own instance with a single terraform apply. Check the GitHub repo for instructions.' },
    { q: 'How are screenshots captured?', a: 'We use Puppeteer with headless Chromium to capture full-page screenshots. Screenshots are stored in S3 and compared using pixelmatch for pixel-level visual diffing. Chromium is installed automatically on the EC2 instances.' },
  ];

  const techStack = [
    { name: 'Next.js 14', category: 'Frontend', color: 'bg-white text-gray-900 border-gray-200' },
    { name: 'TypeScript', category: 'Language', color: 'bg-white text-gray-900 border-gray-200' },
    { name: 'Tailwind CSS', category: 'Styling', color: 'bg-white text-gray-900 border-gray-200' },
    { name: 'PostgreSQL', category: 'Database', color: 'bg-white text-gray-900 border-gray-200' },
    { name: 'Terraform', category: 'Infrastructure', color: 'bg-white text-gray-900 border-gray-200' },
    { name: 'AWS EC2 + ASG', category: 'Compute', color: 'bg-white text-gray-900 border-gray-200' },
    { name: 'AWS ALB', category: 'Networking', color: 'bg-white text-gray-900 border-gray-200' },
    { name: 'AWS RDS', category: 'Database', color: 'bg-white text-gray-900 border-gray-200' },
    { name: 'AWS S3', category: 'Storage', color: 'bg-white text-gray-900 border-gray-200' },
    { name: 'Docker', category: 'Containerization', color: 'bg-white text-gray-900 border-gray-200' },
    { name: 'Puppeteer', category: 'Browser Automation', color: 'bg-white text-gray-900 border-gray-200' },
    { name: 'PM2', category: 'Process Manager', color: 'bg-white text-gray-900 border-gray-200' },
  ];

  return (
    <div className="min-h-screen">
      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-glow">CT</div>
            <span className={`font-semibold text-sm tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>CompetitorTracker</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>Features</a>
            <a href="#how-it-works" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>How it works</a>
            <a href="#pricing" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>Pricing</a>
            <a href="#faq" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm !px-5 !py-2">Get started</Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            <svg className={`w-5 h-5 ${scrolled ? 'text-gray-900' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-border px-6 py-4 space-y-3 animate-slide-down">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-gray-900">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-gray-900">How it works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-gray-900">FAQ</a>
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
              <Link href="/signup" className="btn-primary text-sm">Get started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="section-hero hero-grid min-h-screen flex items-center relative">
        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Open source competitor monitoring
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6 animate-slide-up">
              Never miss a{' '}
              <span className="gradient-text-glow">competitor move</span>
              {' '}again
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
              Automatically monitor competitor pricing pages, feature lists, and changelogs. 
              Get notified the instant something changes — with detailed text and visual diffs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link href="/signup" className="btn-primary text-base !px-8 !py-3.5 !rounded-xl shadow-glow-lg">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start tracking for free
              </Link>
              <a href="#how-it-works" className="btn-outline-light text-base !px-8 !py-3.5 !rounded-xl">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                See how it works
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-2xl mx-auto">
              {stats.map((stat, i) => (
                <div key={stat.label} className="text-center animate-fade-in" style={{ animationDelay: `${300 + i * 100}ms` }}>
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Tech stack bar */}
            <div className="mt-16 animate-fade-in" style={{ animationDelay: '600ms' }}>
              <p className="text-xs text-white/40 mb-4 tracking-widest uppercase">Built with modern technology</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {['Next.js', 'TypeScript', 'PostgreSQL', 'Terraform', 'AWS', 'Docker'].map((tech) => (
                  <span key={tech} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-white/50 text-xs font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-gentle">
          <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="section-gradient py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-50 border border-accent-100 text-accent-700 text-xs font-medium mb-4">
              Everything you need
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Powerful features,{' '}
              <span className="gradient-text">zero effort</span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Monitor competitor changes automatically with a suite of intelligent tools designed for modern teams.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, i) => (
              <div key={feature.title} className="group relative">
                <div className="card p-7 card-hover h-full animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-5 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-50 border border-accent-100 text-accent-700 text-xs font-medium mb-4">
              Simple workflow
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Get started in{' '}
              <span className="gradient-text">4 simple steps</span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              From setup to your first change detection in under 2 minutes.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line (desktop) */}
            <div className="hidden md:block timeline-line" />

            <div className="space-y-12 md:space-y-0 relative">
              {steps.map((step, i) => (
                <div key={step.number} className={`md:flex items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} animate-fade-in`} style={{ animationDelay: `${i * 150}ms` }}>
                  <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className={`card p-6 inline-block ${i % 2 === 0 ? '' : ''}`}>
                      <span className="text-3xl font-bold gradient-text">{step.number}</span>
                      <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-2">{step.title}</h3>
                      <p className="text-sm text-muted">{step.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-8 shrink-0">
                    <div className="w-4 h-4 rounded-full bg-accent-500 border-4 border-accent-100 shadow-glow" />
                  </div>
                  <div className="md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="section-dark py-24 relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium mb-4">
              Full-stack architecture
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Built with{' '}
              <span className="gradient-text-glow">industry-standard</span> tech
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Every component chosen for reliability, scalability, and developer experience.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <div key={tech.name} className={`px-4 py-2 rounded-lg border ${tech.color} flex items-center gap-2 text-sm font-medium shadow-sm animate-fade-in`}>
                <span className="w-2 h-2 rounded-full bg-accent-400" />
                {tech.name}
                <span className="text-xs text-gray-400 ml-1">{tech.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 section-gradient">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-50 border border-accent-100 text-accent-700 text-xs font-medium mb-4">
              Simple pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Plans for every{' '}
              <span className="gradient-text">scale</span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Free tier included. No credit card required to start.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div key={plan.name} className={`relative rounded-xl animate-slide-up ${plan.highlighted ? 'md:-mt-4 md:mb-4' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-full shadow-glow">
                    Most popular
                  </div>
                )}
                <div className={`card p-8 h-full flex flex-col ${plan.highlighted ? 'ring-2 ring-accent-500 shadow-elegant-lg' : ''}`}>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <div className="mt-4 mb-2">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-muted text-sm ml-1">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto">
                    <Link href="/signup" className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-all ${
                      plan.highlighted 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}>
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-50 border border-accent-100 text-accent-700 text-xs font-medium mb-4">
              Questions?
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Frequently asked{' '}
              <span className="gradient-text">questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 pr-4">{faq.q}</span>
                  <svg className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5 animate-slide-down">
                    <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section-dark py-24 relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Ready to track your{' '}
            <span className="gradient-text-glow">competitors</span>?
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Start monitoring in minutes. No credit card required.
          </p>
          <Link href="/signup" className="btn-primary text-base !px-10 !py-4 !rounded-xl shadow-glow-lg animate-bounce-gentle">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Get started free
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-950 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">CT</div>
                <span className="font-semibold text-sm text-white">CompetitorTracker</span>
              </div>
              <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                Open-source competitor monitoring platform. Track pricing, features, and content changes 
                across competitor websites with automated text and visual diffing.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Product</h4>
              <div className="space-y-3">
                <a href="#features" className="block text-sm text-gray-500 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="block text-sm text-gray-500 hover:text-white transition-colors">Pricing</a>
                <a href="#how-it-works" className="block text-sm text-gray-500 hover:text-white transition-colors">How it works</a>
                <Link href="/dashboard" className="block text-sm text-gray-500 hover:text-white transition-colors">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Company</h4>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-gray-500 hover:text-white transition-colors">GitHub</a>
                <a href="#" className="block text-sm text-gray-500 hover:text-white transition-colors">Documentation</a>
                <a href="#" className="block text-sm text-gray-500 hover:text-white transition-colors">API</a>
                <Link href="/login" className="block text-sm text-gray-500 hover:text-white transition-colors">Sign in</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              Built with Next.js, TypeScript, Terraform & AWS. Open source.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
