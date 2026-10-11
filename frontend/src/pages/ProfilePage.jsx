import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillBadge from '../components/SkillBadge';
import {
  User,
  Mail,
  GraduationCap,
  Clock,
  Briefcase,
  Github,
  Globe,
  Edit,
  Sparkles,
  Layers,
  FolderGit2
} from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !id || parseInt(id, 10) === authUser?.id;

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const endpoint = isOwnProfile ? '/profiles/me' : `/profiles/${id}`;
        const res = await api.get(endpoint);
        if (res.data.success) {
          setProfileData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id, isOwnProfile]);

  if (loading) {
    return <LoadingSpinner text="Loading student profile..." />;
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-base font-semibold text-slate-800">Profile not found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested student profile does not exist.</p>
        <Link to="/teammates" className="mt-4 inline-block text-xs font-semibold text-brand-600 hover:underline">
          Return to teammate discovery
        </Link>
      </div>
    );
  }

  const { user, profile, skills = [], projects = [] } = profileData;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center text-2xl font-black shadow-md">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.name}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                {profile?.department || 'Computer Science'} • Year {profile?.year_of_study || 3}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isOwnProfile ? (
              <Link
                to="/profile/edit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Profile & Skills
              </Link>
            ) : null}
          </div>
        </div>

        {/* Quick Attributes Badge Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium">Weekly Availability</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              {profile?.weekly_availability || 10} hrs/week
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium">Experience Level</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">
              {profile?.experience_level || 'Intermediate'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium">College / University</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5 truncate">
              {profile?.college || 'Institute of Technology'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-[11px] text-slate-400 font-medium">Portfolio Links</div>
            <div className="flex items-center gap-2 mt-1">
              {profile?.github_url ? (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-black transition-colors"
                  title="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
              ) : null}
              {profile?.portfolio_url ? (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-brand-600 transition-colors"
                  title="Portfolio Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              ) : null}
              {!profile?.github_url && !profile?.portfolio_url && (
                <span className="text-slate-400 text-xs">None listed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About & Bio */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900">About Me</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {profile?.bio || 'This student has not written a personal introduction yet.'}
        </p>
      </div>

      {/* Technical Skills */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            Verified Technical Skills ({skills.length})
          </h2>
          {isOwnProfile && (
            <Link to="/profile/edit" className="text-xs font-semibold text-brand-600 hover:underline">
              Add Skills
            </Link>
          )}
        </div>

        {skills.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <SkillBadge
                key={s.id || s.name}
                name={s.name}
                proficiency={s.proficiency}
                size="md"
              />
            ))}
          </div>
        )}
      </div>

      {/* Interests & Preferred Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Project Interests</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {profile?.interests || 'No specific domains specified.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Preferred Roles</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {profile?.preferred_roles || 'Open to all collaborative roles.'}
          </p>
        </div>
      </div>

      {/* Previous Experience */}
      {profile?.experience_summary && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Previous Project Experience</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {profile.experience_summary}
          </p>
        </div>
      )}

      {/* Projects Participated */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600" />
          Active Team Projects ({projects.length})
        </h2>

        {projects.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">Not currently participating in any team projects.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60"
              >
                <div>
                  <Link
                    to={`/projects/${p.id}`}
                    className="font-bold text-xs sm:text-sm text-slate-900 hover:text-brand-600"
                  >
                    {p.title}
                  </Link>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {p.domain} • Role: <span className="text-slate-600 font-medium">{p.assigned_role}</span>
                  </p>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
