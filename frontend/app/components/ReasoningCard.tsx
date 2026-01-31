import React, { useState } from 'react';
import { Reasoning } from '../lib/mock-data';
import ConfidenceMeter from './ConfidenceMeter';
import RiskBadge from './RiskBadge';

interface ReasoningCardProps {
    reasoning: Reasoning;
    defaultExpanded?: boolean;
}

const ReasoningCard: React.FC<ReasoningCardProps> = ({ reasoning, defaultExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 my-6 shadow-lg hover:border-indigo-500/50 transition-colors">
            <div
                className="flex justify-between items-center cursor-pointer border-b border-slate-700/50 pb-4"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    <span>🧠</span> Agent Reasoning
                </h3>
                <button className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    {isExpanded ? '▲' : '▼'}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    <section>
                        <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <span>📊</span> Observations
                        </h4>
                        <ul className="space-y-2">
                            {reasoning.observation.map((obs, idx) => (
                                <li key={idx} className="bg-indigo-500/10 border-l-2 border-indigo-500 p-2 text-sm text-slate-300 rounded-r">
                                    {obs}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <span>🎯</span> Root Cause Analysis
                        </h4>
                        <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4">
                            <p className="font-medium text-slate-200 mb-1">{reasoning.rootCause.primary}</p>
                            <p className="text-sm text-slate-400 mb-3">{reasoning.rootCause.secondary}</p>
                            <ConfidenceMeter score={reasoning.rootCause.confidence} />

                            <details className="mt-4 text-sm">
                                <summary className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-medium">View Evidence</summary>
                                <ul className="mt-2 space-y-1 list-disc list-inside text-slate-400">
                                    {reasoning.rootCause.evidence.map((ev, idx) => (
                                        <li key={idx}>{ev}</li>
                                    ))}
                                </ul>
                            </details>
                        </div>
                    </section>

                    <section>
                        <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <span>⚡</span> Proposed Actions
                        </h4>
                        <div className="space-y-4">
                            {reasoning.proposedActions.map((action) => (
                                <div key={action.id} className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 hover:bg-emerald-500/10 transition-colors">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <span className="font-semibold text-slate-200 capitalize">
                                            {action.type.replace(/_/g, ' ')}
                                        </span>
                                        <RiskBadge level={action.risk} />
                                        <div className="flex-1"></div>
                                        <div className="w-24">
                                            <ConfidenceMeter score={action.confidence} />
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-300 mb-3">{action.description}</p>

                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <span className="font-semibold text-slate-400">Impact:</span> {action.impact}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="font-semibold text-slate-400">Duration:</span> {action.estimatedDuration}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="font-semibold text-slate-400">Affected:</span> {action.affectedMerchants} merchant(s)
                                        </span>
                                    </div>

                                    {action.requiresApproval && (
                                        <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-500 border border-amber-500/20">
                                            <span>⚠</span> Requires Approval
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <span>📋</span> Assumptions
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-400 pl-2">
                            {reasoning.assumptions.map((assumption, idx) => (
                                <li key={idx}>{assumption}</li>
                            ))}
                        </ul>
                    </section>

                    {reasoning.uncertainty && (
                        <section className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-amber-500 mb-1 flex items-center gap-2">
                                <span>❓</span> Uncertainty
                            </h4>
                            <p className="text-sm text-amber-400/80 italic">{reasoning.uncertainty}</p>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReasoningCard;
