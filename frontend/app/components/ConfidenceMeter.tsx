import React from 'react';

interface ConfidenceMeterProps {
    score: number;
}

const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ score }) => {
    const getColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="w-full max-w-xs">
            <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
                <span>Confidence</span>
                <span className="font-semibold text-slate-200">{score}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${getColor(score)}`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
};

export default ConfidenceMeter;
