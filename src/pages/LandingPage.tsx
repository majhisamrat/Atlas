import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Check, ChevronRight, FileText, Globe2, MessageSquare, Play, Search, ShieldCheck, Sparkles, Wand2, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DownloadAppSection } from '@/components/shared/DownloadAppSection';

const proof = ['Private by design', 'Sources included', 'Ready in seconds'];
const trusted = ['NORTHSTAR', 'VANTAGE', 'MOTION', 'VENTURE', 'LUMIN', 'KITE'];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const start = () => navigate(isAuthenticated ? '/dashboard' : '/login');

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen overflow-hidden bg-[#f9fcff] text-[#082c67]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-sky-100/70 bg-white/80 backdrop-blur-xl">
        <div className="relative flex h-24 w-full items-center justify-between px-6 lg:px-12 xl:px-16">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3" aria-label="Atlas home">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#103d88] text-white shadow-lg shadow-blue-950/15"><Brain className="h-5 w-5" /></span>
            <span className="brand-atlas text-4xl leading-none">ATLAS</span>
          </button>
          
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 text-xl font-bold text-[#315281] lg:flex">
            <a href="#product" className="transition hover:text-[#0d46a6]">Product</a>
            <a href="#how-it-works" className="transition hover:text-[#0d46a6]">How it works</a>
            <a href="#security" className="transition hover:text-[#0d46a6]">Security</a>
            <a href="#download-app" className="transition hover:text-[#0d46a6]">Get App</a>
          </nav>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden items-center gap-2 text-xl font-bold text-[#315281] sm:flex"><Globe2 className="h-5 w-5" />English</button>
            <button onClick={() => navigate('/login')} className="hidden sm:block text-sm sm:text-xl font-bold text-[#082c67]">Log in</button>
            <button onClick={start} className="rounded-full bg-[#1246a7] px-4 sm:px-7 py-2 sm:py-4 text-sm sm:text-xl font-bold text-white shadow-lg shadow-blue-800/20 transition hover:-translate-y-0.5 hover:bg-[#0d398a]">Start for free</button>
            
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden ml-2 text-[#082c67]">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-sky-100 bg-white/95 backdrop-blur-lg px-6 py-4 space-y-3">
            <a href="#product" onClick={closeMenu} className="block py-2 text-base font-bold text-[#315281] hover:text-[#0d46a6] transition">Product</a>
            <a href="#how-it-works" onClick={closeMenu} className="block py-2 text-base font-bold text-[#315281] hover:text-[#0d46a6] transition">How it works</a>
            <a href="#security" onClick={closeMenu} className="block py-2 text-base font-bold text-[#315281] hover:text-[#0d46a6] transition">Security</a>
            <a href="#download-app" onClick={closeMenu} className="block py-2 text-base font-bold text-[#1246a7] hover:text-[#0d398a] transition">Get App</a>
          </div>
        )}
      </header>

      <main>
        <section className="relative px-5 pb-20 pt-36 lg:pb-28 lg:pt-44">
          <div className="absolute inset-x-0 top-0 -z-0 h-[620px] bg-[radial-gradient(circle_at_78%_42%,rgba(133,190,255,.34),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(217,195,255,.35),transparent_27%)]" />
          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1.5 text-lg font-bold text-[#2066b7] shadow-sm"><Sparkles className="h-3.5 w-3.5" />Enterprise knowledge, beautifully simple</div>
              <h1 className="font-display max-w-xl text-5xl font-black leading-[.98] text-[#06285f] sm:text-6xl lg:text-7xl">Every answer begins with your <span className="text-[#195bc0]">best knowledge.</span></h1>
              <p className="mt-7 max-w-lg text-lg leading-8 text-[#526b91]">Give your team one calm, capable place to turn trusted documents into clear answers, decisions, and momentum.</p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <button onClick={start} className="group inline-flex items-center gap-2 rounded-full bg-[#1246a7] px-6 py-3.5 font-bold text-white shadow-xl shadow-blue-900/20 transition hover:-translate-y-0.5">Build your workspace <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
                <button onClick={() => document.getElementById('product')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-6 py-3.5 font-bold text-[#123f85] transition hover:border-sky-400"><Play className="h-4 w-4 fill-current" />See how it works</button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#53719c]">{proof.map(item => <span key={item} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#159f7b]" />{item}</span>)}</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8, delay: .12 }} className="relative mx-auto w-full max-w-2xl">
              <div className="aurora-panel absolute -inset-7 -rotate-3 rounded-[3rem] opacity-70 blur-sm" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-3 shadow-[0_35px_80px_-32px_rgba(15,60,130,.55)]">
                <div className="flex items-center gap-1.5 border-b border-sky-100 px-3 py-3"><i className="h-2.5 w-2.5 rounded-full bg-rose-300" /><i className="h-2.5 w-2.5 rounded-full bg-amber-300" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-300" /><span className="ml-3 text-[10px] font-bold tracking-widest text-slate-400">ATLAS WORKSPACE</span></div>
                <div className="grid min-h-[370px] grid-cols-[145px_1fr] gap-4 bg-[#f7fbff] p-4 sm:grid-cols-[165px_1fr]">
                  <div className="rounded-2xl bg-[#103d88] p-4 text-white"><div className="mb-7 flex items-center gap-2 text-xs font-black"><Brain className="h-4 w-4" />ATLAS</div><div className="space-y-2 text-[10px] font-semibold text-blue-100"><p className="rounded-lg bg-white/15 px-2.5 py-2">Overview</p><p className="px-2.5 py-2">Knowledge</p><p className="px-2.5 py-2">Assistant</p><p className="px-2.5 py-2">Analytics</p></div><div className="mt-20 rounded-xl bg-white/10 p-3 text-[9px] leading-4 text-blue-100">Your workspace is ready for its next insight.</div></div>
                  <div className="py-2"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-sky-600">Good morning, Samrat</p><h2 className="mt-1 text-xl font-black text-[#082c67]">What will we make clear?</h2></div><span className="grid h-8 w-8 place-items-center rounded-full bg-pink-200 text-[10px] font-bold text-[#7a3170]">MO</span></div><div className="mt-5 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"><div className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700"><Search className="h-4 w-4" /></span><div><p className="text-xs font-bold text-[#173a72]">Search your company knowledge</p><p className="mt-1 text-[10px] text-slate-400">Ask a question or explore a document</p></div></div><div className="mt-4 h-2 rounded-full bg-sky-100" /><div className="mt-2 h-2 w-3/4 rounded-full bg-sky-50" /></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#dff4ff] p-3"><FileText className="h-4 w-4 text-sky-700" /><p className="mt-5 text-[10px] font-bold text-[#103d88]">146 documents</p><p className="mt-1 text-[9px] text-sky-700">Always in context</p></div><div className="rounded-2xl bg-[#f0e8ff] p-3"><MessageSquare className="h-4 w-4 text-violet-700" /><p className="mt-5 text-[10px] font-bold text-[#50368f]">96% grounded</p><p className="mt-1 text-[9px] text-violet-600">Answers with sources</p></div></div></div>
                </div>
              </div>
              <div className="hero-orb absolute -bottom-9 -right-6 grid h-24 w-24 place-items-center rounded-full border-4 border-white text-white shadow-2xl sm:h-32 sm:w-32"><Wand2 className="h-8 w-8" /></div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-sky-100 bg-[#c9ebff] px-5 py-10"><div className="mx-auto max-w-6xl"><p className="text-center text-xl font-bold uppercase tracking-[.18em] text-[#4979af]">Built for teams that value clear thinking</p><div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xl font-black tracking-tight text-[#082c67] sm:text-2xl">{trusted.map(name => <span key={name}>{name}</span>)}</div></div></section>

        <section id="product" className="mx-auto max-w-7xl px-5 py-24 lg:py-32"><div className="max-w-2xl"><p className="app-kicker">An intelligent system of record</p><h2 className="font-display mt-3 text-4xl font-black leading-tight text-[#06285f] sm:text-5xl">Knowledge that feels less like a library, and more like a superpower.</h2></div><div className="mt-12 grid gap-5 lg:grid-cols-3"><Feature icon={Search} title="Ask with confidence" text="Conversational answers grounded in your actual source material, every time." color="bg-[#dbf5ff] text-sky-700" /><Feature icon={FileText} title="Shape the signal" text="Bring documents, reports and team knowledge into one structured home." color="bg-[#f4e8ff] text-violet-700" /><Feature icon={Sparkles} title="See what matters" text="Turn your workspace activity into patterns your whole team can act on." color="bg-[#ffeaf3] text-rose-700" /></div></section>

        <section id="how-it-works" className="bg-[#082d69] px-5 py-24 text-white lg:py-32"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-bold uppercase tracking-[.17em] text-sky-300">From raw files to real clarity</p><h2 className="font-display mt-4 text-4xl font-black leading-tight sm:text-5xl">Made for the way your team already works.</h2><p className="mt-6 max-w-md text-lg leading-8 text-blue-200">Atlas keeps the path from upload to answer remarkably simple, without sacrificing trust or control.</p><button onClick={start} className="mt-8 inline-flex items-center gap-2 font-bold text-sky-200 hover:text-white">Start your workspace <ChevronRight className="h-4 w-4" /></button></div><div className="grid gap-4 sm:grid-cols-3">{[['01','Connect','Add the material your team trusts.'],['02','Understand','Atlas indexes and organizes every detail.'],['03','Move','Get cited answers, faster decisions.']].map(([n,t,d]) => <div key={n} className="rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur"><p className="text-sm font-black text-pink-300">{n}</p><h3 className="mt-12 text-2xl font-black">{t}</h3><p className="mt-3 text-sm leading-6 text-blue-200">{d}</p></div>)}</div></div></section>

        <section id="security" className="relative overflow-hidden px-5 py-24"><div className="aurora-panel absolute inset-x-0 bottom-0 h-3/4 opacity-60" /><div className="relative mx-auto max-w-5xl rounded-[2rem] border border-white bg-white/80 p-8 text-center shadow-xl shadow-blue-950/5 backdrop-blur sm:p-14"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#dff4ff] text-[#1452a0]"><ShieldCheck className="h-6 w-6" /></div><p className="app-kicker mt-5">Enterprise-ready from day one</p><h2 className="font-display mx-auto mt-3 max-w-2xl text-4xl font-black text-[#06285f] sm:text-5xl">Give your team the confidence to explore freely.</h2><p className="mx-auto mt-5 max-w-xl text-[#526b91]">Role-aware access, secure collaboration, and answerable sources are built into every Atlas workspace.</p><button onClick={start} className="mt-8 rounded-full bg-[#1246a7] px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-900/20">Create your workspace</button></div></section>

        <DownloadAppSection />
      </main>
      <footer className="border-t border-sky-100 bg-white px-5 py-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-lg text-[#6680a6] sm:flex-row"><span className="font-display text-xl font-black text-[#082c67]">ATLAS</span><span>© 2026 Atlas Intelligence. Built for better questions.</span></div></footer>
    </div>
  );
}

function Feature({ icon: Icon, title, text, color }: { icon: typeof Search; title: string; text: string; color: string }) {
  return <article className="editorial-card group p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_55px_-32px_rgba(12,47,93,.45)]"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${color}`}><Icon className="h-5 w-5" /></span><h3 className="mt-12 text-2xl font-black tracking-tight text-[#092e6c]">{title}</h3><p className="mt-3 leading-7 text-[#60769a]">{text}</p><span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#195bc0]">Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></article>;
}
