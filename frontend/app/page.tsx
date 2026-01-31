import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col justify-center items-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">

        <div className="space-y-4">
          <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 mb-4 animate-pulse">
            <span className="text-4xl">🛡️</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
            Self-Healing Support System
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Experience the future of SaaS support. An autonomous agentic layer that observes, reasons, and resolves issues before they escalate.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Customer Portal Card */}
          <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
            <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px shadow-2xl  bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="w-16 h-16 rounded-xl bg-indigo-500/10 flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform">
              👥
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Customer Portal</h2>
            <p className="text-slate-400 mb-8 h-12">
              For merchants to submit tickets and view real-time AI resolution progress.
            </p>

            <Link
              href="/customer"
              className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-500/25"
            >
              Enter as Customer &rarr;
            </Link>
          </div>

          {/* Engineer Dashboard Card */}
          <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px shadow-2xl  bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform">
              ⚙️
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Engineer Dashboard</h2>
            <p className="text-slate-400 mb-8 h-12">
              For engineering teams to monitor signals, review reasoning, and approve actions.
            </p>

            <Link
              href="/engineer"
              className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-lg shadow-emerald-500/25"
            >
              Enter as Engineer &rarr;
            </Link>
          </div>
        </div>

        {/* Store Simulation Card */}
        <div className="mt-8 mx-auto max-w-2xl">
          <div className="group relative bg-white border border-slate-200 rounded-2xl p-8 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
            <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px shadow-2xl bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-violet-500/10 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                🛍️
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Live Store Simulation</h2>
                <p className="text-slate-500 mb-4">
                  Experience the "Headless Migration Error". Try to buy a product and see the AI Chatbot intervene in real-time.
                </p>
                <Link
                  href="/store"
                  className="inline-flex items-center justify-center px-6 py-2 text-base font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors shadow-lg shadow-violet-500/25"
                >
                  Launch Store &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 mt-12 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-4">
          <div>
            Designed for <span className="text-slate-300">Agentic AI Coding</span>
          </div>
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Systems Operational
            </span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
