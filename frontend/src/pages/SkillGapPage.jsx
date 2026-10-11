import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import SkillBadge from '../components/SkillBadge';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Send
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

export default function SkillGapPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGapAnalysis() {
      try {
        setLoading(true);
        const res = await api.get(`/matching/projects/${id}/skill-gap`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Error loading skill gap:', err);
        setError('Failed to load skill gap analysis.');
      } finally {
        setLoading(false);
      }
    }
    loadGapAnalysis();
  }, [id]);

  if (loading) return <LoadingSpinner text="Computing real-time team skill gap analysis..." />;

  const {
    project,
    skillCoveragePercentage = 0,
    totalRequiredSkills = 0,
    coveredSkillsCount = 0,
    partiallyCoveredSkillsCount = 0,
    missingSkillsCount = 0,
    coveredSkills = [],
    partiallyCoveredSkills = [],
    missingSkills = [],
    coverageSummary = '',
    recommendedCandidatesForMissingSkills = []
  } = data || {};

  const chartData = [
    { name: 'Covered', value: coveredSkillsCount, color: '#10b981' },
    { name: 'Partially Covered', value: partiallyCoveredSkillsCount, color: '#f59e0b' },
    { name: 'Missing', value: missingSkillsCount, color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Project
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Skill Gap Analysis</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating skill requirements against the collective capabilities of confirmed team members.
            </p>
          </div>
          <Link
            to={`/projects/${id}/recommendations`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" /> Find Candidates for Gaps
          </Link>
        </div>
      </div>

      {/* Overview Coverage Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-3 md:col-span-2">
            <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              Overall Project Skill Coverage
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {skillCoveragePercentage}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {coverageSummary}
              </span>
            </div>
            <ProgressBar value={skillCoveragePercentage} showPercent={false} color="brand" />
            <p className="text-xs text-slate-500 leading-relaxed pt-1">
              Calculated dynamically from required technical skills, minimum proficiency standards, and combined competencies across current team members.
            </p>
          </div>

          {/* Donut Chart */}
          <div className="h-44 w-full flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No skill requirements defined yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* 3 Categories Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fully Covered Skills */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Covered Skills ({coveredSkillsCount})
            </h3>
          </div>

          {coveredSkills.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No requirements fully met yet.</p>
          ) : (
            <div className="space-y-3">
              {coveredSkills.map((s) => (
                <div key={s.name} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{s.name}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                      Level: {s.currentHighestProficiency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Covered by: {s.coveredBy?.map(m => m.name).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Partially Covered Skills */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Partially Covered ({partiallyCoveredSkillsCount})
            </h3>
          </div>

          {partiallyCoveredSkills.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No proficiency gaps detected.</p>
          ) : (
            <div className="space-y-3">
              {partiallyCoveredSkills.map((s) => (
                <div key={s.name} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{s.name}</span>
                    <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                      Need {s.requiredProficiency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {s.gapNote}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              Missing Skills ({missingSkillsCount})
            </h3>
          </div>

          {missingSkills.length === 0 ? (
            <p className="text-xs text-emerald-600 py-3 text-center font-medium">
              Zero gaps! The team has covered all project requirements.
            </p>
          ) : (
            <div className="space-y-3">
              {missingSkills.map((s) => (
                <div key={s.name} className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{s.name}</span>
                    <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-semibold">
                      {s.importance}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Target minimum level: {s.requiredProficiency}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Candidate Solutions for Missing Skills */}
      {recommendedCandidatesForMissingSkills?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Recommended Students to Fill Missing Gaps
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Eligible students who possess the exact skills missing in your current team.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedCandidatesForMissingSkills.map((cand) => (
              <div
                key={cand.userId}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/profile/${cand.userId}`}
                      className="font-bold text-sm text-slate-900 hover:text-brand-600"
                    >
                      {cand.name}
                    </Link>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Covers {cand.missingSkillsCoveredCount} gaps
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{cand.department}</span>

                  <div className="mt-2.5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Provides:</span>
                    <div className="flex flex-wrap gap-1">
                      {cand.skillsProvided?.map((s) => (
                        <SkillBadge key={s.name} name={s.name} proficiency={s.proficiency} size="xs" />
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/projects/${id}/recommendations`}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 pt-2 border-t border-slate-200/60 justify-end"
                >
                  Invite candidate <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
