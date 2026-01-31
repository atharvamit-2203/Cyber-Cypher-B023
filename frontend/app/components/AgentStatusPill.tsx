import React from 'react';
import { AgentStatus } from '../lib/mock-data';

interface AgentStatusPillProps {
    status: AgentStatus;
}

const AgentStatusPill: React.FC<AgentStatusPillProps> = ({ status }) => {
    const config = {
        observing: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: '👁', label: 'Observing' },
        reasoning: { color: 'text-violet-500 bg-violet-500/10 border-violet-500/20', icon: '🧠', label: 'Reasoning' },
        deciding: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: '🤔', label: 'Deciding' },
        acting: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: '⚡', label: 'Acting' },
        waiting_approval: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: '⏳', label: 'Awaiting Approval' },
        completed: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: '✓', label: 'Completed' }
    };

    const { color, icon, label } = config[status] || config.observing;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border animate-pulse ${color}`}>
            <span>{icon}</span>
            <span>{label}</span>
        </span>
    );
};

export default AgentStatusPill;
