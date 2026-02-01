'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockTickets, mockReasonings, Ticket } from '../lib/mock-data';
import { api } from '../lib/api';
import AgentStatusPill from '../components/AgentStatusPill';
import ConfidenceMeter from '../components/ConfidenceMeter';
import RiskBadge from '../components/RiskBadge';
import ReasoningCard from '../components/ReasoningCard';
import Chatbot from '../components/Chatbot';
import StorefrontComponent from '../components/Storefront';

export default function CustomerPortal() {
    const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
    const [activeTab, setActiveTab] = useState<'all' | 'analyzing' | 'resolved'>('all');
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<'shop' | 'support'>('shop');
    const [user, setUser] = useState<any>(null);

    // Load user from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('cyber_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // 1. Fetch real backend data + Simulation
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch real tickets from Python Backend
                const realTickets = await api.getTickets() || [];
                const mappedTickets: Ticket[] = realTickets.map((t: any) => ({
                    id: t.id,
                    customerId: t.merchant_id || 'unknown',
                    customerName: t.merchant_name || 'Acme Corp',
                    title: t.title,
                    description: t.description,
                    category: 'automatic_detection',
                    status: t.status === 'resolved' ? 'resolved' : 'analyzing',
                    priority: t.priority as any,
                    agentStatus: t.status === 'resolved' ? 'completed' : 'reasoning',
                    confidence: 0.85,
                    riskLevel: t.priority === 'critical' ? 'high' : 'medium',
                    createdAt: t.created_at,
                    updatedAt: t.created_at
                }) as Ticket);

                // Merge with mocks if needed, or just use real for the demo
                if (mappedTickets.length > 0) {
                    setTickets(mappedTickets);
                }
            } catch (e) {
                console.warn("Backend tickets not reachable, using mocks.");
            }
        };

        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const filteredTickets = tickets.filter(ticket => {
        if (activeTab === 'all') return true;
        return ticket.status === activeTab;
    });

    const selectedTicket = tickets.find(t => t.id === selectedTicketId);
    const selectedReasoning = selectedTicketId ? mockReasonings[selectedTicketId] : null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">

            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">🛡️</div>
                            <div className="text-2xl font-black italic tracking-tighter text-white">CYBER<span className="text-indigo-500">PORTAL</span></div>
                        </div>

                        <nav className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
                            {[
                                { id: 'shop', label: '🛍️ Storefront' },
                                { id: 'support', label: '🤖 My Support' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id as any)}
                                    className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${activeSection === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-white">{user?.name || 'Guest User'}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest">Premium Member</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-indigo-500/20 border border-white/10">
                                {user?.name?.[0] || 'G'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {activeSection === 'shop' ? (
                    <div>
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-white mb-2 italic">EXCLUSIVE <span className="text-indigo-500">CATALOG</span></h2>
                            <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-xs">Curated for the future of commerce</p>
                        </div>
                        <StorefrontComponent />
                    </div>
                ) : (
                    <>
                        {/* Support Hero */}
                        <div className="text-center mb-16 bg-gradient-to-b from-indigo-500/5 to-transparent p-12 rounded-[3rem] border border-indigo-500/10">
                            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">
                                AI-POWERED <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">SUPPORT</span>
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
                                Our autonomous agents are migrating your account data in real-time.
                                <span className="block mt-2 text-indigo-400/80">Every issue is detected and resolved before you notice.</span>
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                                {[
                                    { label: 'Network Shards', value: '7 Active', icon: '🌐' },
                                    { label: 'Auto-Fixes Today', value: '142', icon: '⚡' },
                                    { label: 'System Health', value: '99.9%', icon: '🛡️' },
                                ].map((stat, idx) => (
                                    <div key={idx} className="glass-card rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-indigo-500/30 transition-all group">
                                        <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{stat.icon}</div>
                                        <div className="text-2xl font-black text-white">{stat.value}</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tickets Section */}
                        <section className="animate-in fade-in duration-700">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Investigation Logs</h2>
                                    <p className="text-slate-500 text-xs font-bold tracking-widest">REAL-TIME AGENT TRACING</p>
                                </div>
                                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-inner">
                                    {(['all', 'analyzing', 'resolved'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${activeTab === tab
                                                ? 'bg-indigo-600 text-white shadow-lg'
                                                : 'text-slate-500 hover:text-white'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-6">
                                {filteredTickets.length > 0 ? (
                                    filteredTickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            onClick={() => setSelectedTicketId(ticket.id)}
                                            className="glass-card rounded-3xl p-8 hover:bg-slate-900/40 border-slate-800 transitions-all duration-300 cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -z-10 group-hover:bg-indigo-600/10" />

                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="font-mono text-[10px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 uppercase">
                                                        Case {ticket.id}
                                                    </div>
                                                    <RiskBadge level={ticket.riskLevel} />
                                                </div>
                                                <AgentStatusPill status={ticket.agentStatus} />
                                            </div>

                                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors tracking-tight">
                                                {ticket.title}
                                            </h3>
                                            <p className="text-slate-400 mb-8 line-clamp-2 text-sm leading-relaxed font-medium">{ticket.description}</p>

                                            <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs">👤</div>
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Merchant</div>
                                                        <div className="text-xs font-bold text-white uppercase">{ticket.customerName}</div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-[150px]">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Agent Confidence</div>
                                                    <ConfidenceMeter score={ticket.confidence} />
                                                </div>
                                                <button className="bg-slate-800 text-white p-3 rounded-xl hover:bg-indigo-600 transition-colors">
                                                    🔎
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-24 glass-card rounded-[3rem] border border-dashed border-slate-800">
                                        <div className="text-6xl mb-6 grayscale opacity-50">🛡️</div>
                                        <h3 className="text-2xl font-black text-white mb-2 italic">SYSTEM CLEAR</h3>
                                        <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm uppercase tracking-widest">No active anomalies detected in {activeTab} status.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                )}
            </main>

            {/* Ticket Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animation-fade-in">
                    <div
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity"
                        onClick={() => setSelectedTicketId(null)}
                    />
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
                        <div className="sticky top-0 z-10 flex justify-between items-center px-10 py-8 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
                            <div>
                                <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em]">Investigation Detail</h2>
                                <h1 className="text-xl font-bold text-white tracking-tight">CASE ID: {selectedTicket.id}</h1>
                            </div>
                            <button
                                onClick={() => setSelectedTicketId(null)}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-800 hover:bg-red-500/20 hover:text-red-500 text-slate-400 transition-all font-black"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-10 space-y-10">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-800 pb-10">
                                <div className="space-y-4">
                                    <AgentStatusPill status={selectedTicket.agentStatus} />
                                    <h3 className="text-3xl font-black text-white italic tracking-tight">{selectedTicket.title}</h3>
                                    <p className="text-slate-400 text-sm font-medium leading-loose max-w-xl">{selectedTicket.description}</p>
                                </div>
                                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 min-w-[200px]">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Created At</div>
                                            <div className="text-sm font-bold text-white font-mono">{new Date(selectedTicket.createdAt).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Risk Assessment</div>
                                            <RiskBadge level={selectedTicket.riskLevel} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedReasoning ? (
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] px-1">AI Reasoning Engine</h4>
                                    <ReasoningCard reasoning={selectedReasoning} defaultExpanded={true} />
                                </div>
                            ) : (
                                <div className="p-16 text-center bg-slate-950/50 rounded-[2rem] border border-dashed border-slate-800">
                                    <div className="animate-pulse flex flex-col items-center">
                                        <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center mb-4">🤖</div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">AI Agent is generating root-cause analysis...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Global AI Chatbot for Customer */}
            <Chatbot role="customer" activeScenario={'NONE'} />
        </div>
    );
}

