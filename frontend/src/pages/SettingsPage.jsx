import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Cpu,
  ShieldCheck,
  Database,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  const weights = [
    { name: 'Technical Skill Overlap', weight: '40%', desc: 'Matches student skills against project required skills taking priority weights into account.' },
    { name: 'Skill Proficiency Ratio', weight: '20%', desc: 'Compares student competence level (Beginner to Expert) against required minimum proficiency.' },
    { name: 'Project Interest Alignment', weight: '15%', desc: 'Analyzes keyword overlap between student interests and project domain/description.' },
    { name: 'Preferred Role Compatibility', weight: '10%', desc: 'Evaluates alignment between student preferred roles and open project positions.' },
    { name: 'Relevant Experience Level', weight: '10%', desc: 'Matches overall student experience tier with project complexity and years of skill usage.' },
    { name: 'Weekly Availability Fit', weight: '5%', desc: 'Ensures student weekly available hours satisfy the project weekly commitment requirement.' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application & Engine Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View matching weights configuration, engine architecture, and account preferences.
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          Authenticated Account
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block font-semibold text-[10px] uppercase">Account Name</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{user?.name}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block font-semibold text-[10px] uppercase">College Email</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">{user?.email}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block font-semibold text-[10px] uppercase">Role Authorization</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block capitalize">{user?.role || 'Student'}</span>
          </div>
        </div>
      </div>

      {/* Matching Weights Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-600" />
              AI Matching Engine Weights Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The engine normalizes all candidate scores into a 0–100 scale using this explainable multi-attribute weight distribution (Total = 100%).
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {weights.map((w) => (
            <div
              key={w.name}
              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between gap-4 text-xs"
            >
              <div>
                <h4 className="font-bold text-slate-800">{w.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{w.desc}</p>
              </div>

              <span className="text-sm font-black text-brand-600 bg-brand-50 px-3 py-1 rounded-lg border border-brand-200 shrink-0">
                {w.weight}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Database & Environment Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-4 h-4 text-brand-600" />
          Persistence & Environment Architecture
        </h2>

        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <p>
            <strong>Dual Database Architecture:</strong> The application natively supports both <strong>Node 24 Embedded SQLite</strong> (with persistent relational integrity and zero configuration) and <strong>MySQL 8.0 Server</strong> (configured via <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">DB_CLIENT=mysql</code>).
          </p>
          <p>
            <strong>Security & Integrity:</strong> All passwords are salted and hashed using bcrypt (10 rounds). Foreign key constraints and team capacity limits are strictly enforced on backend REST routes.
          </p>
        </div>
      </div>
    </div>
  );
}
