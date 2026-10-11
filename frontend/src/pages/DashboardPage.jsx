import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ScoreBadge from '../components/ScoreBadge';
import SkillBadge from '../components/SkillBadge';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import {
  Sparkles,
  FolderPlus,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Generating your personalized dashboard..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
        <span>{error}</span>
      </div>
    );
  }

  const {
    metrics,
    profile,
    skills,
    ownedProjects,
    joinedProjects,
    recommendedProjects,
    primaryOwnedProjectSummary,
    skillDevelopmentSuggestions,
    recentActivity
  } = data || {};

  // Chart data: Skill distribution by proficiency
  const proficiencyDistribution = [
    { name: 'Beginner', count: skills?.filter(s => s.proficiency === 'Beginner').length || 0, color: '#10b981' },
    { name: 'Intermediate', count: skills?.filter(s => s.proficiency === 'Intermediate').length || 0, color: '#3b82f6' },
    { name: 'Advanced', count: skills?.filter(s => s.proficiency === 'Advanced').length || 0, color: '#6366f1' },
    { name: 'Expert', count: skills?.filter(s => s.proficiency === 'Expert').length || 0, color: '#a855f7' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Active Session
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            {profile?.department || 'Computer Science'} • {profile?.college || 'Campus'} •{' '}
            {profile?.weekly_availability || 10} hours/week available
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/projects/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            Create Project
          </Link>
          <Link
            to="/teammates"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Users className="w-4 h-4" />
            Discover Teammates
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-xs text-slate-500 font-medium">Profile Completion</div>
          <div className="text-2xl font-bold text-slate-900">{metrics?.profileCompletionPercentage || 0}%</div>
          <ProgressBar value={metrics?.profileCompletionPercentage || 0} showPercent={false} color="brand" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-xs text-slate-500 font-medium">Projects Created</div>
          <div className="text-2xl font-bold text-slate-900">{metrics?.totalProjectsCreated || 0}</div>
          <div className="text-[11px] text-slate-400">Managing project leads</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-xs text-slate-500 font-medium">Teams Joined</div>
          <div className="text-2xl font-bold text-slate-900">{metrics?.totalProjectsJoined || 0}</div>
          <div className="text-[11px] text-slate-400">Collaborating as member</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-xs text-slate-500 font-medium">Pending Requests</div>
          <div className="text-2xl font-bold text-slate-900">{metrics?.pendingRequestsCount || 0}</div>
          <div className="text-[11px] text-slate-400">
            <Link to="/notifications" className="text-brand-600 hover:underline">
              View incoming/outgoing
            </Link>
          </div>
        </div>
      </div>

      {/* Project Owner Section (if user created a project) */}
      {primaryOwnedProjectSummary && (
        <div className="bg-gradient-to-r from-navy-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                Project Lead Control Center
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                {primaryOwnedProjectSummary.project.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/projects/${primaryOwnedProjectSummary.project.id}/manage`}
                className="px-3.5 py-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
              >
                Manage Team Roster
              </Link>
              <Link
                to={`/projects/${primaryOwnedProjectSummary.project.id}/skill-gap`}
                className="px-3.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Skill Gap Analysis
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
              <div className="text-xs text-slate-300">Team Capacity</div>
              <div className="text-xl font-bold text-white">
                {primaryOwnedProjectSummary.project.current_member_count} / {primaryOwnedProjectSummary.project.expected_team_size} Members
              </div>
              <p className="text-[11px] text-slate-400">
                {Math.max(0, primaryOwnedProjectSummary.project.expected_team_size - primaryOwnedProjectSummary.project.current_member_count)} open positions available
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
              <div className="text-xs text-slate-300">Team Skill Coverage</div>
              <div className="text-xl font-bold text-brand-300">
                {primaryOwnedProjectSummary.skillGapAnalysis?.skillCoveragePercentage || 0}%
              </div>
              <ProgressBar
                value={primaryOwnedProjectSummary.skillGapAnalysis?.skillCoveragePercentage || 0}
                showPercent={false}
                color="brand"
              />
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
              <div className="text-xs text-slate-300">Missing Requirements</div>
              <div className="text-xl font-bold text-amber-300">
                {primaryOwnedProjectSummary.skillGapAnalysis?.missingSkillsCount || 0} Skills
              </div>
              <p className="text-[11px] text-slate-400">
                {primaryOwnedProjectSummary.skillGapAnalysis?.missingSkills?.map(s => s.name).join(', ') || 'All requirements satisfied!'}
              </p>
            </div>
          </div>

          {/* Top Candidates for Project */}
          {primaryOwnedProjectSummary.topRecommendedCandidates?.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Algorithmic Candidate Matches for this Project
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {primaryOwnedProjectSummary.topRecommendedCandidates.map((cand) => (
                  <div
                    key={cand.candidate.id}
                    className="bg-white/10 p-3.5 rounded-xl border border-white/10 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white truncate">
                          {cand.candidate.name}
                        </span>
                        <ScoreBadge score={cand.compatibilityScore} size="sm" showLabel={false} />
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                        {cand.suggestedRole}
                      </p>
                    </div>
                    <Link
                      to={`/projects/${primaryOwnedProjectSummary.project.id}/recommendations`}
                      className="text-[11px] text-brand-300 hover:text-white font-medium flex items-center gap-1 mt-2"
                    >
                      View match rationale <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Recommended Projects & Skills Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Projects (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              Recommended Projects for You
            </h2>
            <Link to="/projects" className="text-xs font-semibold text-brand-600 hover:underline">
              Explore All Projects
            </Link>
          </div>

          {recommendedProjects?.length === 0 ? (
            <EmptyState
              title="No open projects match right now"
              description="Explore all open projects or add more skills to your profile to receive tailored recommendations."
              actionText="Add Skills"
              actionLink="/profile/edit"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedProjects?.map((rec) => (
                <div
                  key={rec.project.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {rec.project.domain}
                      </span>
                      <ScoreBadge score={rec.compatibilityScore} size="sm" />
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm hover:text-brand-600 line-clamp-1">
                      <Link to={`/projects/${rec.project.id}`}>{rec.project.title}</Link>
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {rec.project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rec.matchingSkills?.slice(0, 3).map((s) => (
                        <SkillBadge key={s.name} name={s.name} proficiency={s.studentProficiency} size="xs" />
                      ))}
                      {rec.missingSkills?.length > 0 && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Needs {rec.missingSkills[0].name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {rec.project.openPositions} seats open
                    </span>
                    <Link
                      to={`/projects/${rec.project.id}`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      View Project <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Skills Distribution & Suggestions */}
        <div className="space-y-6">
          {/* Skill Proficiency Breakdown Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Your Technical Skills Profile</h3>

            {skills?.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-3">No skills added yet.</p>
                <Link
                  to="/profile/edit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-lg"
                >
                  Add Skills Now
                </Link>
              </div>
            ) : (
              <>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={proficiencyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {proficiencyDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                  {skills?.map((s) => (
                    <SkillBadge key={s.id} name={s.name} proficiency={s.proficiency} size="xs" />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Skill Growth Suggestions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              High-Demand Campus Skills
            </h3>
            <p className="text-xs text-slate-500">
              Skills requested in open projects that aren't yet on your profile:
            </p>
            <div className="space-y-2 pt-1">
              {skillDevelopmentSuggestions?.length === 0 ? (
                <p className="text-xs text-slate-400">You already possess high-demand skills!</p>
              ) : (
                skillDevelopmentSuggestions?.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      <span className="text-[10px] text-slate-400 block">{s.category}</span>
                    </div>
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {s.demand_count} projects
                    </span>
                  </div>
                ))
              )}
            </div>
            <Link
              to="/profile/edit"
              className="text-xs font-semibold text-brand-600 hover:underline block pt-1 text-center"
            >
              Update your skills profile
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              Recent Project Activity
            </h3>
            {recentActivity?.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No recent team activities recorded.</p>
            ) : (
              <div className="space-y-3 pt-1">
                {recentActivity?.map((act) => (
                  <div key={act.id} className="text-xs border-l-2 border-brand-400 pl-3 space-y-0.5">
                    <p className="text-slate-700 font-medium">{act.description}</p>
                    <p className="text-[10px] text-slate-400">{new Date(act.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
