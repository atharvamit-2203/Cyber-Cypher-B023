'use client';

import React, { useState, useEffect } from 'react';
import { mockSignals, mockTickets, mockReasonings, Ticket } from '../lib/mock-data';
import { getSimulationState, initializeSimulation } from '../lib/simulation-store';
import AgentStatusPill from '../components/AgentStatusPill';
import ConfidenceMeter from '../components/ConfidenceMeter';
import RiskBadge from '../components/RiskBadge';
import ReasoningCard from '../components/ReasoningCard';
import Chatbot from '../components/Chatbot';

export default function EngineerDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'signals' | 'migration'>('overview');
    const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
    const [signals, setSignals] = useState(mockSignals);
    const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

    // Poll for simulation updates
    useEffect(() => {
        initializeSimulation();

        // Check for updates every second
        const interval = setInterval(() => {
            const state = getSimulationState();
            if (state.tickets.length > tickets.length || state.signals.length > signals.length) {
                setTickets(state.tickets);
                setSignals(state.signals);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [tickets.length, signals.length]);

    const pendingTickets = tickets.filter(t => t.agentStatus === 'waiting_approval');
    const activeAgents = tickets.filter(t => ['reasoning', 'deciding', 'acting'].includes(t.agentStatus)).length;

    const handleApproveAction = (ticketId: string, actionId: string) => {
        // Simulate approval
        setTickets(prev => prev.map(t => {
            if (t.id === ticketId) {
                return { ...t, agentStatus: 'acting', status: 'resolved' };
            }
            return t;
        }));
        setSelectedActionId(null);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">

            {/* Sidebar Navigation */}
            <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="text-2xl">⚙️</span>
                        <span className="font-bold text-lg tracking-tight">Engineer Console</span>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'overview', label: 'Overview', icon: '📊' },
                            { id: 'actions', label: 'Pending Actions', icon: '⚡', count: pendingTickets.length },
                            { id: 'signals', label: 'System Signals', icon: '📡' },
                            { id: 'migration', label: 'Migration Status', icon: '🔄' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                                    ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/50'
                                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </div>
                                {item.count !== undefined && item.count > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold border border-amber-500/20">
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700">
                            E
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-medium text-white truncate">DevOps Lead</div>
                            <div className="text-xs text-slate-500 truncate">eng@cybercypher.com</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="ml-64 p-8">

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">System Health Overview</h1>
                            <p className="text-slate-400">Real-time monitoring of agent operations and platform signals.</p>
                        </header>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Active Agents', value: activeAgents, trend: '+1 from yesterday', color: 'emerald' },
                                { label: 'Pending Approvals', value: pendingTickets.length, trend: 'Requires attention', color: 'amber' },
                                { label: 'Signals / Hour', value: '47', trend: 'Normal range', color: 'blue' },
                                { label: 'Avg Confidence', value: '89%', trend: 'High stability', color: 'emerald' },
                            ].map((metric, idx) => (
                                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 p-4 opacity-10 text-${metric.color}-500`}>
                                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-slate-400 text-sm font-medium mb-1">{metric.label}</div>
                                        <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                                        <div className={`text-xs font-medium text-${metric.color}-500`}>{metric.trend}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Active Loops */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-white">🔄 Active Agent Loops</h3>
                                <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded border border-blue-500/20">Live</span>
                            </div>
                            <div className="space-y-4">
                                {tickets.map((ticket) => (
                                    <div key={ticket.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${ticket.agentStatus === 'completed' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
                                            <div>
                                                <div className="font-medium text-slate-200">{ticket.title}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">{ticket.id} • {ticket.customerName}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="w-32 hidden sm:block">
                                                <ConfidenceMeter score={ticket.confidence} />
                                            </div>
                                            <AgentStatusPill status={ticket.agentStatus} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Signals Tab */}
                {activeTab === 'signals' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <header className="mb-6">
                            <h1 className="text-3xl font-bold text-white mb-2">System Signals</h1>
                            <p className="text-slate-400">Raw observability data ingested by the agent layer.</p>
                        </header>

                        <div className="grid gap-4">
                            {signals.map((signal) => (
                                <div key={signal.id} className="bg-slate-900 border-l-4 border-slate-800 rounded-r-xl p-6 hover:bg-slate-800/50 transition-colors animate-in slide-in-from-left-2" style={{ borderLeftColor: signal.severity === 'critical' ? '#ef4444' : signal.severity === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm text-slate-500">{signal.id}</span>
                                            <span className="font-semibold text-white capitalize">{signal.type.replace(/_/g, ' ')}</span>
                                            <RiskBadge level={signal.severity as any} />
                                        </div>
                                        <span className="text-sm text-slate-500">{new Date(signal.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-slate-300 font-medium mb-4">{signal.pattern}</p>
                                    <div className="flex gap-8 text-sm text-slate-400">
                                        <div>
                                            <span className="block text-xs uppercase tracking-wider text-slate-500">Count</span>
                                            <span className="text-slate-200 font-mono">{signal.count}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs uppercase tracking-wider text-slate-500">Window</span>
                                            <span className="text-slate-200 font-mono">{signal.timeWindow}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs uppercase tracking-wider text-slate-500">Affected</span>
                                            <span className="text-slate-200 font-mono">{signal.affectedMerchants} merchants</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pending Actions Tab */}
                {activeTab === 'actions' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <header className="mb-6">
                            <h1 className="text-3xl font-bold text-white mb-2">Pending Actions</h1>
                            <p className="text-slate-400">High-risk actions requiring engineering approval.</p>
                        </header>

                        {pendingTickets.length > 0 ? (
                            <div className="grid gap-6">
                                {pendingTickets.map((ticket) => {
                                    const reasoning = mockReasonings[ticket.id];
                                    const criticalActions = reasoning.proposedActions.filter(a => a.requiresApproval);

                                    return (
                                        <div key={ticket.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                                            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-xl font-bold text-white">{ticket.title}</h3>
                                                            <span className="font-mono text-xs text-slate-500 px-2 py-0.5 bg-slate-800 rounded">{ticket.id}</span>
                                                        </div>
                                                        <p className="text-slate-400 text-sm mt-1">{ticket.description}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Confidence</div>
                                                        <div className="text-2xl font-bold text-emerald-400">{ticket.confidence}%</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-slate-950/30">
                                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Actions Requiring Approval</h4>
                                                <div className="space-y-4">
                                                    {criticalActions.map(action => (
                                                        <div key={action.id} className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-amber-200">{action.type.replace(/_/g, ' ')}</span>
                                                                    <RiskBadge level={action.risk} />
                                                                </div>
                                                                <button
                                                                    onClick={() => handleApproveAction(ticket.id, action.id)}
                                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
                                                                >
                                                                    Approve Action
                                                                </button>
                                                            </div>
                                                            <p className="text-slate-300 text-sm mb-3">{action.description}</p>
                                                            <div className="flex gap-6 text-xs text-slate-400 border-t border-amber-500/10 pt-3">
                                                                <span className="flex items-center gap-1">
                                                                    <span className="text-amber-500/70">Impact:</span> {action.impact}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <span className="text-amber-500/70">Risk:</span> {action.risk}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-4 bg-slate-900 border-t border-slate-800">
                                                <details className="text-sm">
                                                    <summary className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-medium">View Full Reasoning Context</summary>
                                                    <div className="mt-4">
                                                        <ReasoningCard reasoning={reasoning} />
                                                    </div>
                                                </details>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-slate-900/50 border border-slate-800 border-dashed rounded-xl text-slate-500">
                                No pending actions requiring approval.
                            </div>
                        )}
                    </div>
                )}

                {/* Migration (Placeholder for demo) */}
                {activeTab === 'migration' && (
                    <div className="py-20 text-center bg-slate-900/50 border border-slate-800 border-dashed rounded-xl">
                        <div className="text-4xl mb-4">🔄</div>
                        <h3 className="text-lg font-medium text-white mb-2">Migration Dashboard</h3>
                        <p className="text-slate-500">Advanced migration tracking charts would appear here.</p>
                    </div>
                )}

            </main>

            {/* Global AI Assistant for Engineers */}
            <Chatbot role="engineer" />
        </div>
    );
}
