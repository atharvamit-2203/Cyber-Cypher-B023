import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col justify-center items-center p-4 relative overflow-hidden">

      {/* Decorative Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/30 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="max-w-5xl w-full text-center space-y-12 relative z-10">

        <div className="space-y-6 animate-float">
          <div className="inline-block p-4 rounded-2xl glass-panel mb-4">
            <span className="text-5xl drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">🛡️</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-cyan-300 drop-shadow-sm">
            Cyber Cypher
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Autonomous Self-Healing Support Infrastructure
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-16 px-4">
          {/* Customer Portal Card */}
          <div className="group relative glass-card rounded-3xl p-8 hover:-translate-y-2">
            <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-4xl mb-6 mx-auto group-hover:scale-110 transition-transform border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              👥
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">Customer Portal</h2>
            <p className="text-slate-400 mb-8 h-12 leading-relaxed">
              Real-time ticket tracking with empathetic AI assistance and transparent status updates.
            </p>

            <Link
              href="/customer"
              className="inline-flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-500/25 border border-indigo-400/20 group-hover:shadow-indigo-500/50"
            >
              Enter Portal
            </Link>
          </div>

          {/* Engineer Dashboard Card */}
          <div className="group relative glass-card rounded-3xl p-8 hover:-translate-y-2">
            <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-4xl mb-6 mx-auto group-hover:scale-110 transition-transform border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              ⚙️
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">Engineer Console</h2>
            <p className="text-slate-400 mb-8 h-12 leading-relaxed">
              Full observability, signal detection, and human-in-the-loop agent controls.
            </p>

            <Link
              href="/engineer"
              className="inline-flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-all shadow-lg shadow-cyan-500/25 border border-cyan-400/20 group-hover:shadow-cyan-500/50"
            >
              Access Dashboard
            </Link>
          </div>
        </div>

        {/* Store Simulation Card */}
        <div className="mt-8 mx-auto max-w-3xl px-4">
          <div className="group relative glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 hover:bg-slate-800/40">
            <div className="absolute inset-y-0 w-px h-1/2 my-auto -left-px bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="w-24 h-24 rounded-2xl bg-purple-500/20 flex items-center justify-center text-5xl shrink-0 group-hover:rotate-6 transition-transform border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              🛍️
            </div>

            <div className="text-left flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">Live Store Simulation</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest">Interactive Demo</span>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Experience the "Headless Migration" failures firsthand. Trigger API errors, inventory glitches, and watch the AI agent intervene.
              </p>
              <Link
                href="/store"
                className="inline-flex items-center px-8 py-3 text-base font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-lg shadow-purple-500/25 border border-purple-400/20 group-hover:translate-x-2"
              >
                Launch Storefront &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-12 mt-12 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4 uppercase tracking-widest font-mono">
          <div>
            System Status: <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">● ONLINE</span>
          </div>
          <div className="flex gap-6">
            <span>v1.0.0</span>
            <span>BACKEND: {process.env.NODE_ENV === 'development' ? 'LOCAL' : 'REMOTE'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
