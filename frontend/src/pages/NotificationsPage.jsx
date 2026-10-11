import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Bell,
  Check,
  X,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [requestsData, setRequestsData] = useState({ outgoingRequests: [], incomingInvitations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadAll = async () => {
    try {
      setLoading(true);
      const [notifRes, reqRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/requests/my-requests')
      ]);

      if (notifRes.data.success) setNotifications(notifRes.data.data || []);
      if (reqRes.data.success) setRequestsData(reqRes.data.data || { outgoingRequests: [], incomingInvitations: [] });
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      setSuccess('All notifications marked as read.');
    } catch (err) {
      setError('Failed to mark notifications as read.');
    }
  };

  const handleRespondInvitation = async (invitationId, action) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/requests/${invitationId}/respond`, { action });
      if (res.data.success) {
        setSuccess(`Invitation ${action === 'accept' ? 'accepted! You are now part of the project team.' : 'declined.'}`);
        loadAll();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to respond to invitation.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading notifications..." />;

  const { outgoingRequests = [], incomingInvitations = [] } = requestsData;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications & Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your project invitations, active applications, and system updates.
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors self-start sm:self-auto"
          >
            Mark All as Read
          </button>
        )}
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

      {/* Incoming Invitations (Action Required) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Mail className="w-4 h-4 text-brand-600" />
          Team Invitations Received ({incomingInvitations.filter(i => i.status === 'pending').length} pending)
        </h2>

        {incomingInvitations.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No project invitations received yet.</p>
        ) : (
          <div className="space-y-3">
            {incomingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Invitation to join "{inv.project_title}"
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Invited by <span className="font-semibold text-slate-700">{inv.invited_by_name}</span> for role:{' '}
                      <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {inv.proposed_role || 'Team Member'}
                      </span>
                    </p>
                  </div>

                  {inv.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRespondInvitation(inv.id, 'accept')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept Invite
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespondInvitation(inv.id, 'reject')}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded bg-slate-200 text-slate-700">
                      {inv.status}
                    </span>
                  )}
                </div>

                {inv.message && (
                  <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/50">
                    "{inv.message}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Applications Sent by Student */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock className="w-4 h-4 text-amber-600" />
          My Outgoing Join Requests ({outgoingRequests.length})
        </h2>

        {outgoingRequests.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">You have not submitted any join requests.</p>
        ) : (
          <div className="space-y-3">
            {outgoingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs"
              >
                <div>
                  <Link
                    to={`/projects/${req.project_id}`}
                    className="font-bold text-slate-900 hover:text-brand-600"
                  >
                    {req.project_title}
                  </Link>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Proposed Role: {req.proposed_role} • Sent {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    req.status === 'accepted'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : req.status === 'rejected'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Notifications Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="w-4 h-4 text-slate-600" />
          Recent Activity & Notifications ({notifications.length})
        </h2>

        {notifications.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No notifications in your inbox.</p>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                  n.is_read ? 'bg-white border-slate-100 text-slate-600' : 'bg-brand-50/40 border-brand-200 text-slate-900'
                }`}
              >
                <div>
                  <h4 className="font-bold text-slate-900">{n.title}</h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>

                {n.link && (
                  <Link
                    to={n.link}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 shrink-0 self-center"
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
