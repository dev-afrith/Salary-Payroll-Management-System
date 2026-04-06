import React, { useState, useEffect } from 'react';
import { Users, Filter, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const LeaveRequests = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');
  const [processingId, setProcessingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'Approved' | 'Rejected'
  const [selectedApp, setSelectedApp] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/leaves/applications');
      setApplications(data);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    document.title = 'Leave Requests | AstraX Technologies';
  }, []);

  const openActionModal = (app, action) => {
    setSelectedApp(app);
    setModalAction(action);
    setAdminRemarks('');
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    if (modalAction === 'Rejected' && !adminRemarks.trim()) {
      return toast.error('Rejection reason is required.');
    }
    
    setProcessingId(selectedApp.id);
    try {
      await API.put(`/leaves/applications/${selectedApp.id}/status`, { 
        status: modalAction,
        admin_remarks: adminRemarks 
      });
      toast.success(`Leave request ${modalAction.toLowerCase()}`);
      setIsModalOpen(false);
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update request status');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApps = applications.filter(a => filter === 'All' || a.status === filter);

  return (
    <div className="page-enter w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leave Requests</h1>
          <p className="text-base text-slate-500 mt-1">Review and approve employee leave applications</p>
        </div>

        {/* Filters */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['Pending', 'Approved', 'Rejected', 'All'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-10 text-center text-gray-400 animate-pulse bg-white rounded-2xl border border-gray-100">Loading requests...</div>
        ) : filteredApps.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full transition-all">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-sm uppercase tracking-wide text-slate-500 bg-slate-50">
                    <th className="px-6 py-4 font-semibold">Employee</th>
                    <th className="px-6 py-4 font-semibold">Leave Type</th>
                    <th className="px-6 py-4 font-semibold">Duration & Days</th>
                    <th className="px-6 py-4 font-semibold">Applied On</th>
                    <th className="px-6 py-4 font-semibold">Reason</th>
                    <th className="px-6 py-4 font-semibold text-center">Status / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredApps.map(app => (
                    <tr key={app.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-base">{app.full_name}</span>
                          <span className="text-xs font-mono text-gray-400 mt-1">{app.emp_code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span 
                          className="font-semibold text-sm px-3 py-1.5 rounded-full text-white inline-block"
                          style={{ backgroundColor: app.color }}
                        >
                          {app.leave_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm font-semibold text-slate-800">
                          {new Date(app.from_date).toLocaleDateString('en-IN')} — {new Date(app.to_date).toLocaleDateString('en-IN')}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 font-bold">
                          {app.total_days} Days
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-sm font-medium text-slate-700">
                        {new Date(app.applied_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 align-top">
                        {app.reason ? (
                          <div className="text-sm text-gray-700 italic max-w-xs truncate" title={app.reason}>
                            "{app.reason}"
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-center min-w-[200px]">
                        {app.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            <Button 
                              variant="danger" 
                              onClick={() => openActionModal(app, 'Rejected')}
                              className="text-xs font-bold px-4 py-2"
                            >
                              Reject
                            </Button>
                            <Button 
                              className="bg-green-600 hover:bg-green-700 text-white shadow-green-200 text-xs font-bold px-4 py-2" 
                              icon={CheckCircle2}
                              onClick={() => openActionModal(app, 'Approved')}
                            >
                              Approve
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              app.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {app.status === 'Approved' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                              {app.status}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">All Caught Up!</h3>
            <p className="text-gray-500">No {filter.toLowerCase()} leave requests found.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalAction === 'Approved' ? 'Confirm Approval' : 'Provide Rejection Reason'}
        footer={
          <>
            <Button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              className={modalAction === 'Approved' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
              onClick={confirmAction}
              loading={processingId === selectedApp?.id}
            >
              Confirm {modalAction === 'Approved' ? 'Approval' : 'Rejection'}
            </Button>
          </>
        }
      >
        {modalAction === 'Approved' ? (
          <p className="text-gray-600">Are you sure you want to approve this leave request from <strong className="text-gray-900">{selectedApp?.full_name}</strong> for {selectedApp?.total_days} days?</p>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">You are about to reject the leave request for <strong className="text-gray-900">{selectedApp?.full_name}</strong>. Please provide a mandatory reason:</p>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              rows="4"
              placeholder="Enter rejection reason here..."
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              required
            ></textarea>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default LeaveRequests;
