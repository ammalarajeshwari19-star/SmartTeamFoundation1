import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillBadge from '../components/SkillBadge';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import {
  Users,
  Clock,
  Calendar,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Edit,
  UserPlus,
  LogOut,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Join application modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [proposedRole, setProposedRole] = useState('Frontend Developer');
  const [applicationMessage, setApplicationMessage] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  // Leave project modal
  const [leaving, setLeaving] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Project not found or unable to load details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleApplyToJoin = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubmittingApply(true);
    setError('');

    try {
      const res = await api.post(`/requests/project/${id}/join`, {
        proposed_role: proposedRole,
        message: applicationMessage
      });

      if (res.data.success) {
        setSuccess('Your join application has been submitted to the project lead!');
        setIsApplyModalOpen(false);
        fetchProjectDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmittingApply(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!window.confirm('Are you sure you want to leave this project team?')) return;
    setLeaving(true);
    setError('');

    try {
      const res = await api.post(`/projects/${id}/leave`);
      if (res.data.success) {
        setSuccess('You have left the project team.');
        fetchProjectDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave project.');
    } finally {
      setLeaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading project details..." />;

  if (error && !project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-base font-semibold text-slate-800">Error</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Link to="/projects" className="mt-4 inline-block text-xs font-semibold text-brand-600 hover:underline">
          Return to projects catalog
        </Link>
      </div>
    );
  }

  const { is_owner, is_member, pending_request } = project?.user_status || {};
  const currentMembersCount = project.members?.length || 0;
  const isFull = currentMembersCount >= project.expected_team_size;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
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

      {/* Main Project Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                {project.domain}
              </span>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  project.status === 'Open'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {project.status}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {project.difficulty_level} Level
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.title}
            </h1>

            <p className="text-xs text-slate-500">
              Project Lead:{' '}
              <span className="font-semibold text-slate-700">{project.owner_name}</span> ({project.owner_email})
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {is_owner ? (
              <>
                <Link
                  to={`/projects/${id}/manage`}
                  className="px-3.5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition-colors"
                >
                  Manage Team Roster
                </Link>
                <Link
                  to={`/projects/${id}/recommendations`}
                  className="px-3.5 py-2 text-xs font-semibold bg-navy-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  AI Teammates
                </Link>
                <Link
                  to={`/projects/${id}/skill-gap`}
                  className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                >
                  Skill Gap
                </Link>
                <Link
                  to={`/projects/${id}/edit`}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Edit Project"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              </>
            ) : is_member ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Team Member
                </span>
                <button
                  type="button"
                  onClick={handleLeaveProject}
                  disabled={leaving}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Leave Team
                </button>
              </div>
            ) : pending_request ? (
              <span className="px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Application Pending Review
              </span>
            ) : isFull ? (
              <span className="px-3.5 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl">
                Team Full ({currentMembersCount}/{project.expected_team_size})
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(true)}
                className="px-5 py-2.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Apply to Join Team
              </button>
            )}
          </div>
        </div>

        {/* Project Description */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Overview</h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </div>

        {/* Project Parameters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium">Team Composition</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-brand-600" />
              {currentMembersCount} / {project.expected_team_size} Members
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium">Open Positions</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">
              {Math.max(0, project.expected_team_size - currentMembersCount)} Open Seats
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium">Weekly Commitment</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              {project.weekly_commitment_hours} Hours / Week
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium">Project Duration</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              {project.duration_weeks} Weeks
            </div>
          </div>
        </div>
      </div>

      {/* Required Technical Skills & Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Technical Skills */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            Required Technical Skills ({project.required_skills?.length || 0})
          </h2>

          {project.required_skills?.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No specific skill requirements configured yet.</p>
          ) : (
            <div className="space-y-2.5">
              {project.required_skills?.map((s) => (
                <div
                  key={s.id || s.skill_name}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{s.skill_name}</span>
                    <span className="text-[10px] text-slate-400 uppercase">({s.category})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      Min: {s.min_proficiency}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {s.importance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desired Roles */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            Team Roles & Positions ({project.roles?.length || 0})
          </h2>

          {project.roles?.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No specific roles configured yet.</p>
          ) : (
            <div className="space-y-2.5">
              {project.roles?.map((r) => (
                <div
                  key={r.id || r.role_name}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{r.role_name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {r.count_needed} needed
                    </span>
                  </div>
                  {r.description && <p className="text-[11px] text-slate-500">{r.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Team Members */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-600" />
            Current Team Members ({currentMembersCount})
          </h2>
          <Link
            to={`/projects/${id}/team`}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Full Team View
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.members?.map((m) => (
            <div
              key={m.membership_id || m.user_id}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {m.name?.charAt(0)}
                </div>
                <div>
                  <Link
                    to={`/profile/${m.user_id}`}
                    className="font-bold text-xs text-slate-900 hover:text-brand-600"
                  >
                    {m.name}
                  </Link>
                  <span className="block text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 mt-0.5 w-fit">
                    {m.assigned_role}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {m.skills?.slice(0, 3).map((s) => (
                  <SkillBadge key={s.name} name={s.name} proficiency={s.proficiency} size="xs" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply to Join Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply to join ${project.title}`}
      >
        <form onSubmit={handleApplyToJoin} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Submit your application to the project lead. Highlight which skills you can contribute to this project.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proposed Role
            </label>
            <input
              type="text"
              required
              value={proposedRole}
              onChange={(e) => setProposedRole(e.target.value)}
              placeholder="e.g. Frontend Developer, ML Engineer, UI/UX"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Application Note / Motivation Pitch
            </label>
            <textarea
              rows={4}
              required
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              placeholder="Explain how your technical skills and project experience make you a great fit for this team..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingApply}
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submittingApply ? 'Submitting...' : 'Send Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
