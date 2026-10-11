import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ScoreBadge from '../components/ScoreBadge';
import SkillBadge from '../components/SkillBadge';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import {
  Sparkles,
  Users,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function RecommendationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active view tab: 'individual' or 'formation'
  const [activeTab, setActiveTab] = useState('individual');

  // Invitation Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [inviteRole, setInviteRole] = useState('Frontend Developer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/matching/projects/${id}/recommendations`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to calculate teammate recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [id]);

  const handleOpenInvite = (cand) => {
    setSelectedCandidate(cand);
    setInviteRole(cand.suggestedRole || 'Team Member');
    setInviteMessage(`Hi ${cand.candidate.name}, based on your strong match with our project requirements, I'd like to invite you to join our team!`);
    setInviteModalOpen(true);
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setSendingInvite(true);
    setError('');

    try {
      const res = await api.post(`/requests/project/${id}/invite`, {
        candidate_user_id: selectedCandidate.candidate.id,
        proposed_role: inviteRole,
        message: inviteMessage
      });

      if (res.data.success) {
        setSuccess(`Invitation successfully sent to ${selectedCandidate.candidate.name}!`);
        setInviteModalOpen(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setSendingInvite(false);
    }
  };

  if (loading) return <LoadingSpinner text="Running multi-factor matching engine..." />;

  const { project, individualRecommendations = [], teamFormation } = data || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to {project?.title || 'Project'}
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                AI Recommendation Engine
              </span>
              <span className="text-xs text-slate-400">
                Project #{project?.id}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Teammate Recommendations for {project?.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${id}/skill-gap`}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              View Skill Gap Analysis
            </Link>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Algorithmic Estimate Disclaimer */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center gap-2.5 text-xs text-blue-800">
        <Sparkles className="w-4 h-4 shrink-0 text-brand-600" />
        <span>
          <strong>Transparent Scoring:</strong> Compatibility percentages are algorithmic estimates derived from technical skill overlap (40%), proficiency (20%), domain interests (15%), roles (10%), experience (10%), and availability (5%).
        </span>
      </div>

      {/* Tabs: Individual Ranked Candidates vs Greedy Team Formation */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('individual')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'individual'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Ranked Candidates ({individualRecommendations.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('formation')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'formation'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Greedy Balanced Team Composition
        </button>
      </div>

      {activeTab === 'individual' ? (
        individualRecommendations.length === 0 ? (
          <EmptyState
            title="No eligible candidates found"
            description="There are currently no students outside the team who can be matched. Invite peer students to join the platform!"
          />
        ) : (
          <div className="space-y-4">
            {individualRecommendations.map((item, idx) => (
              <div
                key={item.candidate.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-sm p-6 space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-navy-900 text-brand-400 font-bold flex items-center justify-center text-base shadow-sm shrink-0">
                      #{idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/profile/${item.candidate.id}`}
                          className="font-bold text-base text-slate-900 hover:text-brand-600"
                        >
                          {item.candidate.name}
                        </Link>
                        <ScoreBadge score={item.compatibilityScore} />
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.candidate.department || 'Computer Science'} • Year {item.candidate.year || 3} • Suggested Role:{' '}
                        <span className="font-semibold text-slate-800">{item.suggestedRole}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenInvite(item)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Invite Candidate
                  </button>
                </div>

                {/* Algorithmic Breakdown Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Skill Overlap (40%)</span>
                    <span className="font-bold text-slate-800">{item.breakdown?.skillOverlap}/40</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Proficiency (20%)</span>
                    <span className="font-bold text-slate-800">{item.breakdown?.proficiency}/20</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Interests (15%)</span>
                    <span className="font-bold text-slate-800">{item.breakdown?.interests}/15</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Role Fit (10%)</span>
                    <span className="font-bold text-slate-800">{item.breakdown?.roles}/10</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Experience (10%)</span>
                    <span className="font-bold text-slate-800">{item.breakdown?.experience}/10</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Availability (5%)</span>
                    <span className="font-bold text-slate-800">{item.breakdown?.availability}/5</span>
                  </div>
                </div>

                {/* Explanation Rationale */}
                <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-xs text-brand-900 leading-relaxed">
                  <strong>Why Recommended:</strong> {item.rationale}
                </div>

                {/* Skills Summary */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Matching Skills ({item.matchingSkills?.length || 0}):
                    </span>
                    {item.matchingSkills?.map((s) => (
                      <SkillBadge
                        key={s.name}
                        name={s.name}
                        proficiency={s.studentProficiency}
                        size="xs"
                      />
                    ))}
                  </div>

                  {item.contributedSkills?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        ★ Fills Missing Team Skills:
                      </span>
                      {item.contributedSkills.map((s) => (
                        <span
                          key={s.name}
                          className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.missingSkills?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Lacks Requirements:
                      </span>
                      {item.missingSkills.map((s) => (
                        <span key={s.name} className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Greedy Balanced Team Formation View */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-brand-600" />
                  Greedy Complementary Selection Algorithm
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Instead of selecting individual candidates in isolation, this algorithm simulates filling open positions one by one to optimize the team's combined skill coverage and complementary synergy.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-semibold uppercase">Projected Skill Coverage</span>
                <span className="text-2xl font-black text-brand-600">
                  {teamFormation?.projectedCoveragePercentage || 0}%
                </span>
              </div>
            </div>

            <ProgressBar
              value={teamFormation?.projectedCoveragePercentage || 0}
              showPercent={false}
              color="brand"
            />
          </div>

          {teamFormation?.recommendedTeam?.length === 0 ? (
            <EmptyState
              title={teamFormation?.message || 'No recommendations available'}
              description="Team may already be full or no eligible candidates match the uncovered requirements."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamFormation.recommendedTeam.map((rec) => (
                <div
                  key={rec.candidate.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                          #{rec.selectionRank}
                        </span>
                        <div>
                          <Link
                            to={`/profile/${rec.candidate.id}`}
                            className="font-bold text-sm text-slate-900 hover:text-brand-600"
                          >
                            {rec.candidate.name}
                          </Link>
                          <span className="text-[11px] text-slate-400 block">{rec.candidate.department}</span>
                        </div>
                      </div>

                      <ScoreBadge score={rec.matchDetails?.compatibilityScore} size="sm" />
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {rec.rationale}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rec.candidate.skills?.slice(0, 4).map((s) => (
                        <SkillBadge key={s.name} name={s.name} proficiency={s.proficiency} size="xs" />
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Role: {rec.matchDetails?.suggestedRole}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenInvite(rec.matchDetails)}
                      className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> Invite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invitation Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={`Invite ${selectedCandidate?.candidate?.name} to Join Project`}
      >
        <form onSubmit={handleSendInvitation} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Send a formal team invitation. If the candidate accepts, they will automatically be confirmed on your project roster.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proposed Project Role
            </label>
            <input
              type="text"
              required
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              placeholder="e.g. Frontend Developer / UI Specialist"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personalized Invitation Message
            </label>
            <textarea
              rows={4}
              required
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendingInvite}
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {sendingInvite ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
