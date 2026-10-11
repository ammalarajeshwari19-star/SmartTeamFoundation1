import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Save,
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export default function EditProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('Web Application');
  const [difficultyLevel, setDifficultyLevel] = useState('Intermediate');
  const [expectedTeamSize, setExpectedTeamSize] = useState(4);
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [weeklyCommitmentHours, setWeeklyCommitmentHours] = useState(10);
  const [status, setStatus] = useState('Open');

  const [masterSkills, setMasterSkills] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [projRes, skillsRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get('/skills')
        ]);

        if (projRes.data.success) {
          const p = projRes.data.data;
          setTitle(p.title || '');
          setDescription(p.description || '');
          setDomain(p.domain || 'Web Application');
          setDifficultyLevel(p.difficulty_level || 'Intermediate');
          setExpectedTeamSize(p.expected_team_size || 4);
          setDurationWeeks(p.duration_weeks || 8);
          setWeeklyCommitmentHours(p.weekly_commitment_hours || 10);
          setStatus(p.status || 'Open');

          setRequiredSkills(
            (p.required_skills || []).map(s => ({
              skill_id: s.skill_id,
              name: s.skill_name,
              min_proficiency: s.min_proficiency,
              importance: s.importance,
              weight: s.weight
            }))
          );

          setRoles(
            (p.roles || []).map(r => ({
              role_name: r.role_name,
              count_needed: r.count_needed,
              description: r.description
            }))
          );
        }

        if (skillsRes.data.success) {
          setMasterSkills(skillsRes.data.data || []);
        }
      } catch (err) {
        setError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

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
    setSuccess('');
    setSaving(true);

    try {
      const res = await api.put(`/projects/${id}`, {
        title,
        description,
        domain,
        difficulty_level: difficultyLevel,
        expected_team_size: parseInt(expectedTeamSize, 10),
        duration_weeks: parseInt(durationWeeks, 10),
        weekly_commitment_hours: parseInt(weeklyCommitmentHours, 10),
        status,
        required_skills: requiredSkills.filter(s => s.name && s.name.trim()),
        roles: roles.filter(r => r.role_name && r.role_name.trim())
      });

      if (res.data.success) {
        setSuccess('Project updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading project editor..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Project
        </button>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Project Details</h1>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            General Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Web Application">Web Application</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Mobile App">Mobile App</option>
                <option value="IoT / Hardware">IoT / Hardware</option>
                <option value="Fintech">Fintech</option>
                <option value="Edtech">Edtech</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Team Size</label>
              <input
                type="number"
                min="2"
                max="12"
                value={expectedTeamSize}
                onChange={(e) => setExpectedTeamSize(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Required Skills */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Required Skills</h2>
            <button
              type="button"
              onClick={handleAddSkillRow}
              className="px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 rounded-lg hover:bg-brand-100"
            >
              + Add Skill
            </button>
          </div>

          <div className="space-y-3">
            {requiredSkills.map((req, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                <input
                  type="text"
                  value={req.name}
                  onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                  placeholder="Skill name"
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
                <select
                  value={req.min_proficiency}
                  onChange={(e) => handleSkillChange(idx, 'min_proficiency', e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <select
                  value={req.importance}
                  onChange={(e) => handleSkillChange(idx, 'importance', e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  <option value="Required">Required</option>
                  <option value="Preferred">Preferred</option>
                  <option value="Nice to have">Nice to have</option>
                </select>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveSkillRow(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Project Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
