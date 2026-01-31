import React from 'react';
import { RiskLevel } from '../lib/mock-data';

interface RiskBadgeProps {
    level: RiskLevel | 'warning';
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
    const config = {
        low: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: '✓', label: 'Low Risk' },
        medium: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: '⚠', label: 'Medium Risk' },
        warning: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: '⚠', label: 'Warning' },
        high: { color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: '⚠', label: 'High Risk' },
        critical: { color: 'text-red-600 bg-red-600/10 border-red-600/20', icon: '⛔', label: 'Critical Risk' }
    };

    const { color, icon, label } = config[level] || config.medium;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${color}`}>
            <span>{icon}</span>
            <span>{label}</span>
        </span>
    );
};

export default RiskBadge;
