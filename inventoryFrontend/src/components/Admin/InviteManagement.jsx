import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import api from '../../api/client';

const InviteManagement = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchInvites = async () => {
    try {
      const response = await api.get('/invites');
      setInvites(response.data.invites);
    } catch (error) {
      console.error('Error fetching invites:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load invitations';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleSendInvite = async (e) => {
    e.preventDefault();

    if (!newInviteEmail) {
      enqueueSnackbar('Email is required', { variant: 'warning' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newInviteEmail)) {
      enqueueSnackbar('Invalid email format', { variant: 'warning' });
      return;
    }

    setSendingInvite(true);

    try {
      await api.post('/invites', { email: newInviteEmail });
      enqueueSnackbar('Invitation sent successfully', { variant: 'success' });
      setNewInviteEmail('');
      fetchInvites();
    } catch (error) {
      console.error('Error sending invite:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send invitation';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) {
      return;
    }

    try {
      await api.delete(`/invites/${inviteId}`);
      enqueueSnackbar('Invitation revoked successfully', { variant: 'success' });
      fetchInvites();
    } catch (error) {
      console.error('Error revoking invite:', error);
      const errorMessage = error.response?.data?.message || 'Failed to revoke invitation';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      used: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusStyles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="usd-panel rounded-lg p-8">
        <p className="text-center usd-muted">Loading invitations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="usd-panel rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 usd-text-green">Send Invitation</h2>
        <form onSubmit={handleSendInvite} className="flex gap-4">
          <input
            type="email"
            value={newInviteEmail}
            onChange={(e) => setNewInviteEmail(e.target.value)}
            className="flex-1 border-2 border-gray-500 px-4 py-2 rounded usd-input"
            placeholder="user@example.com"
            disabled={sendingInvite}
          />
          <button
            type="submit"
            className="px-6 py-2 usd-btn-green rounded hover:opacity-90 font-semibold"
            disabled={sendingInvite}
          >
            {sendingInvite ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>

      <div className="usd-panel rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 usd-text-green">Invitations</h2>
        {invites.length === 0 ? (
          <p className="text-center usd-muted py-8">No invitations sent yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 usd-border-green">
                  <th className="text-left py-3 px-4 font-semibold usd-text-green">Email</th>
                  <th className="text-left py-3 px-4 font-semibold usd-text-green">Status</th>
                  <th className="text-left py-3 px-4 font-semibold usd-text-green">Sent By</th>
                  <th className="text-left py-3 px-4 font-semibold usd-text-green">Created</th>
                  <th className="text-left py-3 px-4 font-semibold usd-text-green">Expires</th>
                  <th className="text-left py-3 px-4 font-semibold usd-text-green">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-b usd-border">
                    <td className="py-3 px-4">{invite.email}</td>
                    <td className="py-3 px-4">{getStatusBadge(invite.status)}</td>
                    <td className="py-3 px-4 usd-muted">{invite.created_by}</td>
                    <td className="py-3 px-4 usd-muted text-sm">{formatDate(invite.created_at)}</td>
                    <td className="py-3 px-4 usd-muted text-sm">{formatDate(invite.expires_at)}</td>
                    <td className="py-3 px-4">
                      {invite.status === 'pending' && (
                        <button
                          onClick={() => handleRevokeInvite(invite.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold"
                        >
                          Revoke
                        </button>
                      )}
                      {invite.status === 'used' && (
                        <span className="text-sm usd-muted">Used by {invite.used_by}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteManagement;
