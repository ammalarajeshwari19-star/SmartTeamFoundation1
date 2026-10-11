import React from 'react';

export default function ProgressBar({ value = 0, max = 100, label, color = 'brand', showPercent = true }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorVariants = {
    brand: 'bg-brand-600',
    emerald: 'bg-emerald-600',
    blue: 'bg-blue-600',
    amber: 'bg-amber-500',
    purple: 'bg-purple-600'
  };

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
          {label && <span>{label}</span>}
          {showPercent && <span className="text-slate-700 font-semibold">{percentage}%</span>}
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorVariants[color] || colorVariants.brand}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
