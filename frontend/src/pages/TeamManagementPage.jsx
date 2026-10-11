import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillBadge from '../components/SkillBadge';
import Modal from '../components/Modal';
import {
  Users,
  Check,
  X,
  Trash2,
  Edit,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function TeamManagementPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Role edit modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [savingRole, setSavingRole] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, memRes, reqRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/members`),
        api.get(`/requests/project/${id}`)
      ]);

      if (projRes.data.success) setProject(projRes.data.data);
      if (memRes.data.success) setMembers(memRes.data.data);
      if (reqRes.data.success) setRequests(reqRes.data.data);
    } catch (err) {
      console.error('Error loading team management data:', err);
      setError('Failed to load project management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRespondRequest = async (requestId, action) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/requests/${requestId}/respond`, { action });
      if (res.data.success) {
        setSuccess(`Request has been ${action === 'accept' ? 'accepted' : 'rejected'}.`);
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request.');
    }
  };

  const handleOpenRoleModal = (member) => {
    setSelectedMember(member);
    setNewRole(member.assigned_role || 'Team Member');
    setRoleModalOpen(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    setSavingRole(true);
    try {
      const res = await api.put(`/projects/${id}/members/${selectedMember.user_id}`, {
        assigned_role: newRole
      });
      if (res.data.success) {
        setSuccess('Member role updated successfully.');
        setRoleModalOpen(false);
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setSavingRole(false);
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;
    setError('');
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      if (res.data.success) {
        setSuccess(`${memberName} removed from team.`);
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading team management dashboard..." />;

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Project
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Roster & Application Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review join applications, assign team positions, and manage memberships for{' '}
              <span className="font-semibold text-slate-700">{project?.title}</span>.
            </p>
          </div>
          <div className="px-3.5 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold self-start sm:self-auto">
            {members.length} / {project?.expected_team_size || 4} Members
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

      {/* Pending Join Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Pending Student Applications ({pendingRequests.length})
          </h2>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            No pending join requests at this time.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((reqItem) => (
              <div
                key={reqItem.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${reqItem.user_id}`}
                        className="font-bold text-sm text-slate-900 hover:text-brand-600"
                      >
                        {reqItem.name}
                      </Link>
                      <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        Wants: {reqItem.proposed_role || 'Contributor'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {reqItem.department || 'Computer Science'} • {reqItem.weekly_availability || 10}h/wk available
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRespondRequest(reqItem.id, 'accept')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespondRequest(reqItem.id, 'reject')}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                </div>

                {reqItem.message && (
                  <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/50 leading-relaxed">
                    "{reqItem.message}"
                  </p>
                )}

                <div className="flex flex-wrap gap-1">
                  {reqItem.skills?.map((s) => (
                    <SkillBadge key={s.name} name={s.name} proficiency={s.proficiency} size="xs" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmed Team Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users className="w-4 h-4 text-brand-600" />
          Confirmed Team Members ({members.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2.5">Member</th>
                <th className="pb-2.5">Assigned Role</th>
                <th className="pb-2.5">Availability</th>
                <th className="pb-2.5">Joined Date</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => {
                const isOwner = m.user_id === project?.owner_id;
                return (
                  <tr key={m.membership_id || m.user_id} className="hover:bg-slate-50/50">
                    <td className="py-3">
                      <Link
                        to={`/profile/${m.user_id}`}
                        className="font-bold text-slate-900 hover:text-brand-600 block"
                      >
                        {m.name}
                      </Link>
                      <span className="text-[11px] text-slate-400">{m.email}</span>
                    </td>
                    <td className="py-3 font-semibold text-slate-800">
                      {m.assigned_role}
                      {isOwner && (
                        <span className="ml-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Owner
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-600">{m.weekly_availability || 10} hrs/wk</td>
                    <td className="py-3 text-slate-500">{new Date(m.joined_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenRoleModal(m)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Assign Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!isOwner && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.user_id, m.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={`Assign Role for ${selectedMember?.name}`}
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Role Title
            </label>
            <input
              type="text"
              required
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="e.g. Lead Architect, Frontend Lead, ML Specialist"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRoleModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingRole}
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {savingRole ? 'Updating...' : 'Save Role'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
