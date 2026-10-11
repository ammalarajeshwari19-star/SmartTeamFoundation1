import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillBadge from '../components/SkillBadge';
import {
  FolderPlus,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export default function CreateProjectPage() {
  const navigate = useNavigate();

  const [masterSkills, setMasterSkills] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Project Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('Web Application');
  const [difficultyLevel, setDifficultyLevel] = useState('Intermediate');
  const [expectedTeamSize, setExpectedTeamSize] = useState(4);
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [weeklyCommitmentHours, setWeeklyCommitmentHours] = useState(10);

  // Dynamic Skills & Roles
  const [requiredSkills, setRequiredSkills] = useState([
    { skill_id: '', name: 'React', min_proficiency: 'Intermediate', importance: 'Required', weight: 1.0 },
    { skill_id: '', name: 'Node.js', min_proficiency: 'Intermediate', importance: 'Required', weight: 1.0 }
  ]);

  const [roles, setRoles] = useState([
    { role_name: 'Frontend Developer', count_needed: 1, description: 'UI & State management' },
    { role_name: 'Backend Engineer', count_needed: 1, description: 'REST APIs and Database schema' }
  ]);

  useEffect(() => {
    api.get('/skills')
      .then(res => {
        if (res.data.success) setMasterSkills(res.data.data || []);
      })
      .catch(() => {});
  }, []);

  const handleAddSkillRow = () => {
    setRequiredSkills([
      ...requiredSkills,
      { skill_id: '', name: '', min_proficiency: 'Intermediate', importance: 'Required', weight: 1.0 }
    ]);
  };

  const handleRemoveSkillRow = (index) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index, field, value) => {
    const updated = [...requiredSkills];
    updated[index][field] = value;
    if (field === 'name') {
      const match = masterSkills.find(m => m.name.toLowerCase() === value.toLowerCase());
      if (match) updated[index].skill_id = match.id;
    }
    setRequiredSkills(updated);
  };

  const handleAddRoleRow = () => {
    setRoles([...roles, { role_name: '', count_needed: 1, description: '' }]);
  };

  const handleRemoveRoleRow = (index) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleRoleChange = (index, field, value) => {
    const updated = [...roles];
    updated[index][field] = value;
    setRoles(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    const filteredSkills = requiredSkills.filter(s => s.name && s.name.trim());
    if (filteredSkills.length === 0) {
      setError('Please add at least one required technical skill.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/projects', {
        title: title.trim(),
        description: description.trim(),
        domain,
        difficulty_level: difficultyLevel,
        expected_team_size: parseInt(expectedTeamSize, 10),
        duration_weeks: parseInt(durationWeeks, 10),
        weekly_commitment_hours: parseInt(weeklyCommitmentHours, 10),
        required_skills: filteredSkills,
        roles: roles.filter(r => r.role_name && r.role_name.trim())
      });

      if (res.data.success) {
        navigate(`/projects/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create a New Project</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Define your project requirements, team size, and skill needs to trigger AI teammate matching.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Project Overview
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI-Powered Smart Campus Navigation System"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, architecture, goals, and target deliverables..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Domain / Category
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Web Application">Web Application</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Mobile App">Mobile App</option>
                <option value="IoT / Hardware">IoT / Hardware</option>
                <option value="Fintech">Fintech</option>
                <option value="Edtech">Edtech</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience Level
              </label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Team Size
              </label>
              <input
                type="number"
                min="2"
                max="12"
                value={expectedTeamSize}
                onChange={(e) => setExpectedTeamSize(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (Weeks)
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weekly Commitment (Hours / Week)
              </label>
              <input
                type="number"
                min="2"
                max="40"
                value={weeklyCommitmentHours}
                onChange={(e) => setWeeklyCommitmentHours(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        {/* Required Technical Skills */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Required Technical Skills
              </h2>
              <p className="text-xs text-slate-500">
                Specify what skills candidate teammates must possess to collaborate effectively.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSkillRow}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </div>

          <div className="space-y-3">
            {requiredSkills.map((req, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
              >
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    required
                    value={req.name}
                    onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                    placeholder="e.g. React, Python"
                    list={`skills-list-${idx}`}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                  <datalist id={`skills-list-${idx}`}>
                    {masterSkills.map(s => <option key={s.id} value={s.name} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Min Proficiency
                  </label>
                  <select
                    value={req.min_proficiency}
                    onChange={(e) => handleSkillChange(idx, 'min_proficiency', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Importance
                  </label>
                  <select
                    value={req.importance}
                    onChange={(e) => handleSkillChange(idx, 'importance', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="Required">Required</option>
                    <option value="Preferred">Preferred</option>
                    <option value="Nice to have">Nice to have</option>
                  </select>
                </div>

                <div className="flex items-center justify-end pt-3 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleRemoveSkillRow(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desired Roles */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Required Team Roles</h2>
              <p className="text-xs text-slate-500">
                Specify roles needed for the project so students can align with their preferred positions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRoleRow}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Role
            </button>
          </div>

          <div className="space-y-3">
            {roles.map((r, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
              >
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    required
                    value={r.role_name}
                    onChange={(e) => handleRoleChange(idx, 'role_name', e.target.value)}
                    placeholder="e.g. Backend Lead"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Count Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={r.count_needed}
                    onChange={(e) => handleRoleChange(idx, 'count_needed', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 sm:pt-0">
                  <input
                    type="text"
                    value={r.description}
                    onChange={(e) => handleRoleChange(idx, 'description', e.target.value)}
                    placeholder="Short description..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRoleRow(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <FolderPlus className="w-4 h-4" />
            {submitting ? 'Creating Project...' : 'Publish Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
