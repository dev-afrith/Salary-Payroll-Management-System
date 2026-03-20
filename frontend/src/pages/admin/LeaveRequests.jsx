import React, { useState, useEffect } from 'react';
import { Users, Filter, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Button from '../../components/ui/Button';

const LeaveRequests = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');
  const [processingId, setProcessingId] = useState(null);

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
    document.title = 'Leave Requests | PayrollPro';
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setProcessingId(id);
    try {
      await API.put(`/leaves/applications/${id}/status`, { status });
      toast.success(`Leave request ${status.toLowerCase()}`);
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
          filteredApps.map(app => (
            <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{app.full_name}</h3>
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{app.emp_code}</span>
                  <span 
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: app.color }}
                  >
                    {app.leave_name}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-8 text-sm text-slate-600 mb-4 mt-4">
                  <div>
                    <span className="text-slate-400 text-sm font-semibold block mb-1 uppercase tracking-wider">Duration</span>
                    <span className="text-base font-semibold text-slate-800">
                      {new Date(app.from_date).toLocaleDateString('en-IN')} — {new Date(app.to_date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm font-semibold block mb-1 uppercase tracking-wider">Total Days</span>
                    <span className="text-base font-semibold text-slate-800">{app.total_days} Days</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm font-semibold block mb-1 uppercase tracking-wider">Applied On</span>
                    <span className="text-base font-medium text-slate-700">{new Date(app.applied_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {app.reason && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Reason</p>
                    <p className="text-sm text-gray-700 italic">"{app.reason}"</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 md:border-l md:border-slate-100 md:pl-6">
                {app.status === 'Pending' ? (
                  <>
                    <Button 
                      variant="danger" 
                      onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                      loading={processingId === app.id}
                      disabled={processingId !== null}
                      className="text-sm font-semibold px-6 py-2.5"
                    >
                      Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white shadow-green-200 text-sm font-semibold px-6 py-2.5" 
                      icon={CheckCircle2}
                      onClick={() => handleStatusUpdate(app.id, 'Approved')}
                      loading={processingId === app.id}
                      disabled={processingId !== null}
                    >
                      Approve
                    </Button>
                  </>
                ) : (
                  <div className={`flex flex-col items-center justify-center p-4 rounded-xl min-w-[120px] ${
                    app.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {app.status === 'Approved' ? <CheckCircle2 size={24} className="mb-2" /> : <XCircle size={24} className="mb-2" />}
                    <span className="font-bold text-sm tracking-wide uppercase">{app.status}</span>
                  </div>
                )}
              </div>
            </div>
          ))
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
    </div>
  );
};

export default LeaveRequests;
