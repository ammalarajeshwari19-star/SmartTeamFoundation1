import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillBadge from '../components/SkillBadge';
import {
  Users,
  Clock,
  Mail,
  GraduationCap,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function TeamMembersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        const [projRes, memRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/projects/${id}/members`)
        ]);

        if (projRes.data.success) setProject(projRes.data.data);
        if (memRes.data.success) setMembers(memRes.data.data);
      } catch (err) {
        console.error('Error loading team members:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading project team roster..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to {project?.title || 'Project'}
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Members Roster</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Current members collaborating on <span className="font-semibold text-slate-700">{project?.title}</span>.
            </p>
          </div>
          <div className="px-3.5 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold self-start sm:self-auto">
            {members.length} / {project?.expected_team_size || 4} Confirmed Members
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {members.map((m) => (
          <div
            key={m.membership_id || m.user_id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 hover:border-brand-300 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {m.name?.charAt(0)}
                </div>
                <div>
                  <Link
                    to={`/profile/${m.user_id}`}
                    className="font-bold text-base text-slate-900 hover:text-brand-600"
                  >
                    {m.name}
                  </Link>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    {m.department || 'Computer Science'} • Year {m.year_of_study || 3}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                {m.assigned_role}
              </span>
            </div>

            {m.bio && (
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {m.bio}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Availability</span>
                <span className="font-semibold text-slate-800">{m.weekly_availability || 10} hrs/week</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Joined Team</span>
                <span className="font-semibold text-slate-800">{new Date(m.joined_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Verified Technical Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {m.skills?.map((s) => (
                  <SkillBadge
                    key={s.name}
                    name={s.name}
                    proficiency={s.proficiency}
                    size="xs"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
