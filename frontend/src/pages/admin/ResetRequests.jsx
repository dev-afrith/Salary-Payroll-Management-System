import React, { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, XCircle, Clock, Eye, EyeOff, Loader2,  Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { formatDate } from '../../utils/dateHelpers';

import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';

const ResetRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, Pending, Approved, Rejected

  // Approval Modal State
  const [approveModal, setApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
    document.title = 'Password Reset Requests | AstraX Technologies';
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/auth/reset-requests');
      setRequests(data);
    } catch (err) {
      toast.error('Failed to load reset requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!newPassword || newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    setActionLoading(true);
    try {
      await API.put(`/auth/reset-requests/${selectedRequest.id}/approve`, { new_password: newPassword });
      toast.success('Password reset approved successfully!');
      setApproveModal(false);
      setNewPassword('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this request?')) return;
    try {
      await API.put(`/auth/reset-requests/${id}/reject`);
      toast.success('Request rejected');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const statusIcon = (status) => {
    if (status === 'Pending') return <Clock size={14} className="text-orange-500" />;
    if (status === 'Approved') return <CheckCircle2 size={14} className="text-green-600" />;
    return <XCircle size={14} className="text-red-500" />;
  };

  const statusBadge = (status) => {
    const colors = {
      Pending: 'bg-orange-50 text-orange-700 border-orange-200',
      Approved: 'bg-green-50 text-green-700 border-green-200',
      Rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${colors[status] || 'bg-gray-50 text-gray-600'}`}>
        {statusIcon(status)} {status}
      </span>
    );
  };

  return (
    <div className="page-enter w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="text-blue-600" size={24} />
            Password Reset Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review and approve employee password reset requests</p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'Pending', 'Approved', 'Rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-colors capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock className="text-orange-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{requests.filter(r => r.status === 'Pending').length}</p>
              <p className="text-xs text-slate-500 font-medium">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{requests.filter(r => r.status === 'Approved').length}</p>
              <p className="text-xs text-slate-500 font-medium">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{requests.filter(r => r.status === 'Rejected').length}</p>
              <p className="text-xs text-slate-500 font-medium">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Loading requests...</div>
        ) : (
          <Table headers={['Employee', 'Employee ID', 'Phone', 'Requested', 'Status', 'Actions']}>
            {filteredRequests.length > 0 ? filteredRequests.map(req => (
              <tr key={req.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {(req.full_name || 'U').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{req.full_name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{req.email || ''}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-slate-700">{req.employee_code}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{req.phone}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{formatDate(req.created_at)}</td>
                <td className="px-6 py-4">{statusBadge(req.status)}</td>
                <td className="px-6 py-4">
                  {req.status === 'Pending' ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        onClick={() => { setSelectedRequest(req); setApproveModal(true); }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                        onClick={() => handleReject(req.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Processed</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                  No reset requests found.
                </td>
              </tr>
            )}
          </Table>
        )}
      </div>

      {/* Approve Modal - Admin sets new password */}
      <Modal
        isOpen={approveModal}
        onClose={() => { setApproveModal(false); setNewPassword(''); }}
        title="Set New Password"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              You are resetting the password for <strong>{selectedRequest?.full_name}</strong> ({selectedRequest?.employee_code}).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="border border-gray-200 rounded-lg px-3 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              loading={actionLoading}
              icon={KeyRound}
            >
              Confirm & Reset
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setApproveModal(false); setNewPassword(''); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResetRequests;
