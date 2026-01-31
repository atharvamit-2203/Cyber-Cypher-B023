'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockTickets, mockReasonings, Ticket } from '../lib/mock-data';
import AgentStatusPill from '../components/AgentStatusPill';
import ConfidenceMeter from '../components/ConfidenceMeter';
import RiskBadge from '../components/RiskBadge';
import ReasoningCard from '../components/ReasoningCard';
import Chatbot from '../components/Chatbot';

export default function CustomerPortal() {
    const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
    const [activeTab, setActiveTab] = useState<'all' | 'analyzing' | 'resolved'>('all');
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setTickets(prevTickets =>
                prevTickets.map(ticket => {
                    // Randomly update timestamps for effect
                    if (ticket.status !== 'resolved' && Math.random() > 0.8) {
                        return { ...ticket, updatedAt: new Date().toISOString() };
                    }
                    return ticket;
                })
            );
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredTickets = tickets.filter(ticket => {
        if (activeTab === 'all') return true;
        return ticket.status === activeTab;
    });

    const selectedTicket = tickets.find(t => t.id === selectedTicketId);
    const selectedReasoning = selectedTicketId ? mockReasonings[selectedTicketId] : null;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">

            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🛡️</span>
                            <span className="font-bold text-xl tracking-tight text-white">Support Portal</span>
                        </div>
                        <nav className="flex gap-1">
                            {['My Tickets', 'New Ticket', 'System Status'].map((item) => (
                                <button key={item} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                                    {item}
                                </button>
                            ))}
                        </nav>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-300">Acme Corp</span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
                                A
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 mb-4">
                        Welcome to Your Support Portal
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Our AI agent is actively monitoring your account and resolving issues automatically.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                        {[
                            { label: 'Active AI Agents', value: '3', icon: '🤖' },
                            { label: 'Issues Resolved Today', value: '12', icon: '✓' },
                            { label: 'Avg Response Time', value: '2.3 min', icon: '⚡' },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex items-center gap-4 hover:border-indigo-500/30 transition-colors">
                                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-2xl">
                                    {stat.icon}
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-sm text-slate-400">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tickets Section */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Your Tickets</h2>
                        <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                            {(['all', 'analyzing', 'resolved'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${activeTab === tab
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {filteredTickets.length > 0 ? (
                            filteredTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                    className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm text-slate-400 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                                                {ticket.id}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${ticket.priority === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                ticket.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                }`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <AgentStatusPill status={ticket.agentStatus} />
                                    </div>

                                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                                        {ticket.title}
                                    </h3>
                                    <p className="text-slate-400 mb-6 line-clamp-2">{ticket.description}</p>

                                    <div className="flex items-center gap-6 pt-4 border-t border-slate-700/50">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span>👤</span> {ticket.customerName}
                                        </div>
                                        <div className="w-32">
                                            <ConfidenceMeter score={ticket.confidence} />
                                        </div>
                                        <div className="ml-auto">
                                            <RiskBadge level={ticket.riskLevel} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-800/20 rounded-xl border border-slate-700/50 border-dashed">
                                <div className="text-4xl mb-4">📭</div>
                                <h3 className="text-lg font-medium text-white mb-1">No tickets found</h3>
                                <p className="text-slate-500">You don't have any {activeTab} tickets.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Ticket Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedTicketId(null)}
                    />
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 z-10 flex justify-between items-center p-6 bg-slate-900/95 backdrop-blur border-b border-slate-800">
                            <h2 className="text-xl font-bold text-white">Ticket Details</h2>
                            <button
                                onClick={() => setSelectedTicketId(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 space-y-8">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold text-white">{selectedTicket.id}</h1>
                                        <AgentStatusPill status={selectedTicket.agentStatus} />
                                    </div>
                                    <h3 className="text-xl text-indigo-400 font-medium">{selectedTicket.title}</h3>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <span>Created:</span>
                                        <span className="text-slate-200">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <RiskBadge level={selectedTicket.riskLevel} />
                                </div>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                                <p className="text-slate-200 leading-relaxed">{selectedTicket.description}</p>
                            </div>

                            {selectedReasoning ? (
                                <ReasoningCard reasoning={selectedReasoning} defaultExpanded={true} />
                            ) : (
                                <div className="p-8 text-center bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                                    <p className="text-slate-400 animate-pulse">AI Agent is analyzing this ticket...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
