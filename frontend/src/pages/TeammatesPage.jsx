import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillBadge from '../components/SkillBadge';
import EmptyState from '../components/EmptyState';
import {
  Users,
  Search,
  Filter,
  Clock,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function TeammatesPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [proficiency, setProficiency] = useState('');
  const [role, setRole] = useState('');
  const [minAvailability, setMinAvailability] = useState('');
  const [masterSkills, setMasterSkills] = useState([]);

  useEffect(() => {
    api.get('/skills')
      .then(res => {
        if (res.data.success) setMasterSkills(res.data.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchTeammates() {
      try {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (skill) params.skill = skill;
        if (proficiency) params.proficiency = proficiency;
        if (role) params.role = role;
        if (minAvailability) params.min_availability = minAvailability;

        const res = await api.get('/profiles', { params });
        if (res.data.success) {
          setStudents(res.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching teammates:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchTeammates();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, skill, proficiency, role, minAvailability]);

  const resetFilters = () => {
    setSearch('');
    setSkill('');
    setProficiency('');
    setRole('');
    setMinAvailability('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Discover Teammates</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Find student collaborators by specific technical skills, proficiency levels, and availability.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, department, or interests..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Skill Filter</option>
              {masterSkills.slice(0, 30).map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All Proficiencies</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div>
            <select
              value={minAvailability}
              onChange={(e) => setMinAvailability(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Min Availability</option>
              <option value="5">5+ hrs/week</option>
              <option value="10">10+ hrs/week</option>
              <option value="15">15+ hrs/week</option>
              <option value="20">20+ hrs/week</option>
            </select>
          </div>
        </div>

        {(search || skill || proficiency || role || minAvailability) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Found {students.length} matching students
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

      {/* Students Card Grid */}
      {loading ? (
        <LoadingSpinner text="Searching student catalog..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="No students match the selected criteria"
          description="Try broadening your search terms or proficiency filters."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((st) => (
            <div
              key={st.id}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-sm p-6 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {st.name?.charAt(0)}
                    </div>
                    <div>
                      <Link
                        to={`/profile/${st.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-brand-600"
                      >
                        {st.name}
                      </Link>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {st.department || 'Computer Science'} • Year {st.year_of_study || 3}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {st.experience_level || 'Intermediate'}
                  </span>
                </div>

                {st.bio && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {st.bio}
                  </p>
                )}

                <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="text-[11px] text-slate-500">
                    <span className="text-slate-400">Roles:</span> {st.preferred_roles || 'Developer'}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{st.weekly_availability || 10} hours/week available</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Skills ({st.skills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {st.skills?.slice(0, 4).map((s) => (
                      <SkillBadge key={s.name} name={s.name} proficiency={s.proficiency} size="xs" />
                    ))}
                    {(st.skills?.length || 0) > 4 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5 self-center">
                        +{(st.skills?.length || 0) - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Link
                  to={`/profile/${st.id}`}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  View Full Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
