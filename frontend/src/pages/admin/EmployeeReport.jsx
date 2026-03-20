import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, DollarSign, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { formatINR } from '../../utils/formatCurrency';

const EmployeeReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const fetchData = async () => {
    setLoading(true);
    try {
      // For simplicity, we use existing employee and payroll endpoints
      const [empRes, histRes] = await Promise.all([
        API.get(`/employees/${id}`),
        API.get(`/reports/employee/${id}`) // This would be a new specific endpoint, or we can filter backend
      ]);
      setEmployee(empRes.data);
      setHistory(histRes.data);
    } catch (error) {
      // Fallback if specific report endpoint not ready, just show empty
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Note: The specific backend endpoint for employee history might need registration
    // I'll add a simple query in report.controller for this
    fetchData();
  }, [id]);

  return (
    <div className="page-enter w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-full border border-slate-100 hover:shadow-md transition-all">
            <ArrowLeft size={24} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financial History</h1>
            <p className="text-base font-medium text-slate-500 mt-1">{employee?.full_name || 'Loading Employee...'}</p>
          </div>
        </div>
        {employee && (
          <div className="px-5 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100">
            {employee.employee_id}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center font-bold text-3xl text-blue-600 mb-4 border-4 border-white shadow-sm">
            {employee?.full_name?.charAt(0) || <User />}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{employee?.full_name || '—'}</h2>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">{employee?.designation_name || '—'}</p>
          <div className="w-full mt-8 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Department</span>
              <span className="font-bold text-slate-800">{employee?.department_name || '—'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Joined On</span>
              <span className="font-bold text-slate-800">{employee?.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : '—'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Current CTC</span>
              <span className="font-bold text-blue-600 tracking-wider font-mono">{formatINR((employee?.basic_pay || 0) * 12)}/yr</span>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" /> Pay Progression (Last 6 Months)
          </h3>
          {loading ? (
             <div className="h-64 flex items-center justify-center text-slate-400 animate-pulse">Loading Chart...</div>
          ) : history.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...history].reverse().slice(-6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tickFormatter={(val) => months[val - 1]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => formatINR(value)}
                    labelFormatter={(val) => months[val - 1]}
                  />
                  <Area type="monotone" name="Net Salary" dataKey="net_salary" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
                  <Area type="monotone" name="Gross Salary" dataKey="gross_salary" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <DollarSign size={32} className="text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No payroll history generated yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Payroll Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-slate-500" />
            Complete Payment History
          </h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-sm uppercase tracking-wide text-slate-500 bg-slate-50">
                <th className="px-6 py-4 font-semibold">Period</th>
                <th className="px-6 py-4 font-semibold text-right">Gross Pay</th>
                <th className="px-6 py-4 font-semibold text-right">Deductions</th>
                <th className="px-6 py-4 font-semibold text-right">Net Payout</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading records...</td>
                </tr>
              ) : history.length > 0 ? (
                history.map((record) => (
                  <tr key={record.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-base text-slate-800">
                      {months[record.month - 1]} {record.year}
                    </td>
                    <td className="px-6 py-4 font-mono text-base text-slate-600 text-right">{formatINR(record.gross_salary)}</td>
                    <td className="px-6 py-4 font-mono text-base text-red-500 text-right">{formatINR(record.total_deductions)}</td>
                    <td className="px-6 py-4 font-mono text-lg font-bold text-indigo-600 text-right">{formatINR(record.net_salary)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${
                        record.status === 'Locked' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {record.status === 'Locked' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReport;
