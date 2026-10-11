import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Layers,
  Users,
  FolderPlus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function MyProjectsPage() {
  const [activeTab, setActiveTab] = useState('owned'); // 'owned' or 'joined'
  const [projectsData, setProjectsData] = useState({ owned: [], joined: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyProjects() {
      try {
        setLoading(true);
        const res = await api.get('/projects/user/my-projects');
        if (res.data.success) {
          setProjectsData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching my projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyProjects();
  }, []);

  if (loading) return <LoadingSpinner text="Loading your projects..." />;

  const { owned, joined } = projectsData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Projects</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage projects you created and track the team projects you participate in.
          </p>
        </div>
        <Link
          to="/projects/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          Create New Project
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('owned')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'owned'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Projects I Lead ({owned?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('joined')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'joined'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Projects I Joined ({joined?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'owned' ? (
        owned?.length === 0 ? (
          <EmptyState
            title="You haven't created any projects yet"
            description="Create your first project to define requirements, find balanced teammates, and lead a development team."
            actionText="Create Project"
            actionLink="/projects/create"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {owned.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-brand-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {p.domain}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {p.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 line-clamp-1 hover:text-brand-600">
                    <Link to={`/projects/${p.id}`}>{p.title}</Link>
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {p.current_member_count}/{p.expected_team_size} Members
                    </span>
                    {p.pending_requests_count > 0 && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {p.pending_requests_count} Requests
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/projects/${p.id}/manage`}
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    Manage Roster
                  </Link>
                  <Link
                    to={`/projects/${p.id}/recommendations`}
                    className="text-xs font-semibold px-3 py-1.5 bg-navy-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-brand-400" />
                    AI Match
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        joined?.length === 0 ? (
          <EmptyState
            title="You haven't joined any team projects yet"
            description="Explore open projects seeking your skills and submit a join request."
            actionText="Explore Open Projects"
            actionLink="/projects"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joined.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {p.domain}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {p.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 line-clamp-1 hover:text-brand-600">
                    <Link to={`/projects/${p.id}`}>{p.title}</Link>
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <div className="text-slate-500">Your Assigned Role:</div>
                    <div className="font-bold text-slate-800">{p.assigned_role}</div>
                    <div className="text-[11px] text-slate-400">
                      Lead by {p.owner_name} • Joined {new Date(p.joined_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Link
                    to={`/projects/${p.id}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    View Project Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
