import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillBadge from '../components/SkillBadge';
import EmptyState from '../components/EmptyState';
import {
  Search,
  Filter,
  Users,
  Clock,
  Compass,
  ArrowRight,
  FolderPlus,
  Sparkles
} from 'lucide-react';

export default function ProjectDiscoveryPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [skill, setSkill] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [masterSkills, setMasterSkills] = useState([]);

  useEffect(() => {
    // Load skills for filter dropdown
    api.get('/skills')
      .then(res => {
        if (res.data.success) setMasterSkills(res.data.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (domain) params.domain = domain;
        if (skill) params.skill = skill;
        if (difficulty) params.difficulty = difficulty;
        if (status) params.status = status;

        const res = await api.get('/projects', { params });
        if (res.data.success) {
          setProjects(res.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, domain, skill, difficulty, status]);

  const resetFilters = () => {
    setSearch('');
    setDomain('');
    setSkill('');
    setDifficulty('');
    setStatus('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Explore Projects</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover student projects looking for collaborators across domains and tech stacks.
          </p>
        </div>
        <Link
          to="/projects/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          Create a Project
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search text */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, or domain..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Domain Filter */}
          <div>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All Domains</option>
              <option value="Web Application">Web Application</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Mobile App">Mobile App</option>
              <option value="IoT / Hardware">IoT / Hardware</option>
              <option value="Fintech">Fintech</option>
              <option value="Edtech">Edtech</option>
            </select>
          </div>

          {/* Skill Filter */}
          <div>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Required Skill</option>
              {masterSkills.slice(0, 25).map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All Experience Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {(search || domain || skill || difficulty || status) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Showing filtered results ({projects.length} matching)
            </span>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Searching projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects match your search criteria"
          description="Try broadening your filters or create a new project to lead your own team."
          actionText="Create a New Project"
          actionLink="/projects/create"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-sm transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                    {proj.domain}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      proj.status === 'Open'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    <Link to={`/projects/${proj.id}`}>{proj.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lead by <span className="text-slate-600 font-medium">{proj.owner_name}</span>
                  </p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                {/* Required Skills Chips */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Required Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.required_skills?.slice(0, 4).map((s) => (
                      <SkillBadge
                        key={s.id || s.skill_name}
                        name={s.skill_name}
                        proficiency={s.min_proficiency}
                        size="xs"
                      />
                    ))}
                    {(proj.required_skills?.length || 0) > 4 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5 self-center">
                        +{(proj.required_skills?.length || 0) - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {proj.current_member_count}/{proj.expected_team_size} Members
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {proj.weekly_commitment_hours}h/wk
                  </span>
                </div>

                <Link
                  to={`/projects/${proj.id}`}
                  className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
