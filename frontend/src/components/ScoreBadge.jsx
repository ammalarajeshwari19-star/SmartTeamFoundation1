import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ScoreBadge({ score = 0, size = 'md', showLabel = true }) {
  const numScore = Math.round(Number(score) || 0);

  let colorScheme = 'bg-slate-100 text-slate-700 border-slate-200';
  let matchText = 'Moderate Match';

  if (numScore >= 80) {
    colorScheme = 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-500/20';
    matchText = 'Excellent Match';
  } else if (numScore >= 65) {
    colorScheme = 'bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-500/20';
    matchText = 'High Match';
  } else if (numScore >= 45) {
    colorScheme = 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-500/20';
    matchText = 'Moderate Match';
  } else {
    colorScheme = 'bg-slate-100 text-slate-700 border-slate-300';
    matchText = 'Low Match';
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5'
  };

  return (
    <div className="inline-flex items-center gap-1.5" title="Algorithmic Compatibility Estimate">
      <span
        className={`inline-flex items-center font-bold rounded-full border shadow-sm ${colorScheme} ${sizes[size] || sizes.md}`}
      >
        <Sparkles className="w-3.5 h-3.5 mr-1 text-current opacity-80" />
        {numScore}%
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-slate-500 hidden sm:inline">
          {matchText}
        </span>
      )}
    </div>
  );
}
