'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState<'customer' | 'engineer'>('customer');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.login({ email, password, role });
            if (response.status === 'success') {
                // Store user info in localStorage for demo
                localStorage.setItem('cyber_user', JSON.stringify(response.user));

                // Redirect based on role
                if (role === 'engineer') {
                    router.push('/engineer');
                } else {
                    router.push('/customer');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2">
                        CYBER<span className="text-indigo-500">CYPHER</span>
                    </h1>
                    <p className="text-slate-400 text-sm tracking-widest uppercase">Autonomous Migration Support</p>
                </div>

                <div className="glass-card rounded-3xl p-8 border-slate-700/50 shadow-2xl">
                    {/* Role Selector */}
                    <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-8 border border-slate-800">
                        <button
                            onClick={() => setRole('customer')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'customer' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            🛍️ Customer
                        </button>
                        <button
                            onClick={() => setRole('engineer')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'engineer' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            ⚙️ Engineer
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={role === 'engineer' ? 'atharvamit... @gmail.com' : 'alex@example.com'}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 p-3 rounded-lg animate-shake">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            disabled={isLoading}
                            type="submit"
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-xl disabled:opacity-50 ${role === 'customer' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'}`}
                        >
                            {isLoading ? 'Authenticating...' : `Sign In as ${role === 'customer' ? 'Customer' : 'Engineer'}`}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2">
                            🔐 Secure Access Point Alpha
                        </p>
                        <div className="flex justify-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Demo Credentials: <br />
                        <span className="text-slate-400">Engineer: atharvamitdeshpande2203@gmail.com | 0809202327</span><br />
                        <span className="text-slate-400">Customer: alex@example.com | pass123</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
