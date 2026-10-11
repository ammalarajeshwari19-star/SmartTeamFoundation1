import React from 'react';

export default function SkillBadge({ name, proficiency, onRemove, size = 'sm' }) {
  const profLower = String(proficiency || '').toLowerCase();

  const profColors = {
    beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    intermediate: 'bg-blue-50 text-blue-700 border-blue-200',
    advanced: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    expert: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  const badgeColor = profColors[profLower] || 'bg-slate-100 text-slate-700 border-slate-200';

  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${badgeColor} ${sizeClasses[size] || sizeClasses.sm} transition-all`}
    >
      <span>{name}</span>
      {proficiency && (
        <span className="opacity-75 text-[10px] uppercase tracking-wider font-semibold">
          • {proficiency}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 -mr-1 hover:bg-black/10 rounded p-0.5 transition-colors"
          title="Remove skill"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
