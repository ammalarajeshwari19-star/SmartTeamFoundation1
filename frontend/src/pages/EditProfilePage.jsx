import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillBadge from '../components/SkillBadge';
import {
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [college, setCollege] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('3');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [preferredRoles, setPreferredRoles] = useState('');
  const [weeklyAvailability, setWeeklyAvailability] = useState(10);
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Skills
  const [mySkills, setMySkills] = useState([]);
  const [masterSkills, setMasterSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Frontend');
  const [skillProficiency, setSkillProficiency] = useState('Intermediate');
  const [yearsExperience, setYearsExperience] = useState('1.5');
  const [addingSkill, setAddingSkill] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profRes, skillsRes] = await Promise.all([
          api.get('/profiles/me'),
          api.get('/skills')
        ]);

        if (profRes.data.success) {
          const { user: u, profile: p, skills: s } = profRes.data.data;
          setName(u?.name || '');
          setDepartment(p?.department || '');
          setCollege(p?.college || '');
          setYearOfStudy(String(p?.year_of_study || 3));
          setBio(p?.bio || '');
          setInterests(p?.interests || '');
          setExperienceSummary(p?.experience_summary || '');
          setExperienceLevel(p?.experience_level || 'Intermediate');
          setPreferredRoles(p?.preferred_roles || '');
          setWeeklyAvailability(p?.weekly_availability || 10);
          setGithubUrl(p?.github_url || '');
          setPortfolioUrl(p?.portfolio_url || '');
          setLinkedinUrl(p?.linkedin_url || '');
          setMySkills(s || []);
        }

        if (skillsRes.data.success) {
          setMasterSkills(skillsRes.data.data || []);
        }
      } catch (err) {
        console.error('Error loading profile editor data:', err);
        setErrorMsg('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put('/profiles/me', {
        name,
        department,
        college,
        year_of_study: parseInt(yearOfStudy, 10),
        bio,
        interests,
        experience_summary: experienceSummary,
        experience_level: experienceLevel,
        preferred_roles: preferredRoles,
        weekly_availability: parseInt(weeklyAvailability, 10),
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        linkedin_url: linkedinUrl
      });

      if (res.data.success) {
        setSuccessMsg('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setAddingSkill(true);
    setErrorMsg('');

    try {
      const payload = {
        proficiency: skillProficiency,
        years_experience: parseFloat(yearsExperience) || 1.0
      };

      if (selectedSkillId) {
        payload.skill_id = parseInt(selectedSkillId, 10);
      } else if (customSkillName.trim()) {
        payload.skill_name = customSkillName.trim();
        payload.category = skillCategory;
      } else {
        setErrorMsg('Please select a skill or enter a custom skill name.');
        setAddingSkill(false);
        return;
      }

      const res = await api.post('/skills/my-skills', payload);
      if (res.data.success) {
        setMySkills([...mySkills, res.data.data]);
        setSelectedSkillId('');
        setCustomSkillName('');
        setSuccessMsg('Skill added successfully.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add skill.');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (studentSkillId) => {
    try {
      await api.delete(`/skills/my-skills/${studentSkillId}`);
      setMySkills(mySkills.filter(s => s.id !== studentSkillId));
      setSuccessMsg('Skill removed.');
    } catch (err) {
      setErrorMsg('Failed to remove skill.');
    }
  };

  const handleUpdateSkillProficiency = async (studentSkillId, newProf) => {
    try {
      await api.put(`/skills/my-skills/${studentSkillId}`, { proficiency: newProf });
      setMySkills(mySkills.map(s => s.id === studentSkillId ? { ...s, proficiency: newProf } : s));
      setSuccessMsg('Skill proficiency updated.');
    } catch (err) {
      setErrorMsg('Failed to update proficiency.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile editor..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/profile')}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Profile & Skills</h1>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Computer Science & Engineering"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="Institute of Technology"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year of Study</label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="1">1st Year (Freshman)</option>
                <option value="2">2nd Year (Sophomore)</option>
                <option value="3">3rd Year (Junior)</option>
                <option value="4">4th Year (Senior)</option>
                <option value="5">Postgraduate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal Introduction / Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other students about your passions, projects, and what you love building..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Roles, Interests, and Availability */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Matching Criteria & Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Roles (comma-separated)
              </label>
              <input
                type="text"
                value={preferredRoles}
                onChange={(e) => setPreferredRoles(e.target.value)}
                placeholder="Frontend Developer, Team Lead, UI/UX Designer"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Interests / Domains (comma-separated)
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Web Development, Machine Learning, Cloud"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weekly Availability (Hours / Week)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={weeklyAvailability}
                onChange={(e) => setWeeklyAvailability(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Overall Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Beginner">Beginner (1st/2nd year fundamentals)</option>
                <option value="Intermediate">Intermediate (1-2 completed projects)</option>
                <option value="Advanced">Advanced (Extensive project/hackathon experience)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Previous Project Experience Summary
            </label>
            <textarea
              rows={2}
              value={experienceSummary}
              onChange={(e) => setExperienceSummary(e.target.value)}
              placeholder="List prior hackathons, class capstone projects, or internships..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Portfolio & Repositories
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Profile URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/your-username"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio or Website URL</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.dev"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Skills Management Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Technical Skills Catalog ({mySkills.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Skills are directly matched against project requirements by the recommendation engine.
            </p>
          </div>
        </div>

        {/* Existing Skills Table */}
        {mySkills.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No technical skills added yet. Add your skills below to boost your compatibility score!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2">Skill Name</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Proficiency Level</th>
                  <th className="pb-2">Experience</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mySkills.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-bold text-slate-800">{s.name}</td>
                    <td className="py-2.5 text-slate-500">{s.category || 'General'}</td>
                    <td className="py-2.5">
                      <select
                        value={s.proficiency}
                        onChange={(e) => handleUpdateSkillProficiency(s.id, e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </td>
                    <td className="py-2.5 text-slate-600">{s.years_experience || 1} yrs</td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Remove skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add New Skill Subform */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Add New Skill to Profile
          </h3>

          <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Select from Catalog
              </label>
              <select
                value={selectedSkillId}
                onChange={(e) => {
                  setSelectedSkillId(e.target.value);
                  if (e.target.value) setCustomSkillName('');
                }}
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              >
                <option value="">-- Choose skill --</option>
                {masterSkills
                  .filter(ms => !mySkills.some(mine => mine.skill_id === ms.id))
                  .map(ms => (
                    <option key={ms.id} value={ms.id}>
                      {ms.name} ({ms.category})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Or Type Custom Skill
              </label>
              <input
                type="text"
                value={customSkillName}
                onChange={(e) => {
                  setCustomSkillName(e.target.value);
                  if (e.target.value) setSelectedSkillId('');
                }}
                placeholder="e.g. GraphQL"
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Proficiency Level
              </label>
              <select
                value={skillProficiency}
                onChange={(e) => setSkillProficiency(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={addingSkill}
                className="w-full py-2 px-3 bg-navy-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {addingSkill ? 'Adding...' : 'Add Skill'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
