import React, { useState, useEffect } from 'react';
import { Calendar, PlusCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Button from '../../components/ui/Button';

const EmployeeLeaves = () => {
  const currentYear = new Date().getFullYear();
  const [balances, setBalances] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [balRes, appRes] = await Promise.all([
          API.get(`/leaves/balance/my?year=${currentYear}`),
          API.get('/leaves/my-applications')
        ]);
        setBalances(balRes.data);
        setApplications(appRes.data);
      } catch (error) {
        toast.error('Failed to load leave data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    document.title = 'My Leaves | PayrollPro';
  }, [currentYear]);

  return (
    <div className="page-enter w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Leaves</h1>
          <p className="text-base text-slate-500 mt-1">Track your leave balances and request history for {currentYear}</p>
        </div>
        <Button icon={PlusCircle} onClick={() => navigate('/employee/leaves/apply')} className="text-sm font-semibold px-5 py-3">
          Apply for Leave
        </Button>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-2xl"></div>)
        ) : balances.length > 0 ? (
          balances.map(b => (
            <div key={b.id} className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between" style={{ borderTop: `4px solid ${b.color}` }}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-slate-900">{b.leave_name}</h3>
                <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${b.is_paid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {b.is_paid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-slate-900 leading-none tracking-tight">{b.remaining}</span>
                <span className="text-sm font-semibold text-slate-400 mb-1">days left</span>
              </div>
              <div className="flex gap-4 mt-6 text-sm font-semibold text-slate-500">
                <span>Allocated: <strong className="text-slate-900">{b.allocated}</strong></span>
                <span>Used: <strong className="text-slate-900">{b.used}</strong></span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-6 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
            No leave balances configured for {currentYear} yet.
          </div>
        )}
      </div>

      {/* Application History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            Application History
          </h3>
        </div>
        {loading ? (
          <div className="p-10 text-center text-slate-400 animate-pulse">Loading history...</div>
        ) : applications.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm uppercase tracking-wide text-slate-500 bg-slate-50">
                  <th className="px-6 py-4 font-semibold">Leave Type</th>
                  <th className="px-6 py-4 font-semibold">Duration</th>
                  <th className="px-6 py-4 font-semibold text-center">Total Days</th>
                  <th className="px-6 py-4 font-semibold">Applied On</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-base text-slate-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: app.color }}></span>
                        {app.leave_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-base text-slate-600">
                      {new Date(app.from_date).toLocaleDateString('en-IN')} — {new Date(app.to_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-lg text-slate-900">{app.total_days}</td>
                    <td className="px-6 py-4 text-base text-slate-500">{new Date(app.applied_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          app.status === 'Approved' ? 'bg-green-50 text-green-700' :
                          app.status === 'Rejected' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {app.status === 'Approved' ? <CheckCircle2 size={16} /> :
                           app.status === 'Rejected' ? <XCircle size={16} /> :
                           <Clock size={16} />}
                          {app.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Calendar size={32} />
            </div>
            <p className="text-gray-500 font-medium">You haven't applied for any leaves yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeLeaves;
