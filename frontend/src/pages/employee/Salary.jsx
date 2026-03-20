import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { formatINR } from '../../utils/formatCurrency';

const EmployeeSalary = () => {
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/payroll/my?year=${year}`);
        setPayrollHistory(data);
      } catch (error) {
        toast.error('Failed to load salary history');
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
    document.title = 'My Salary | PayrollPro';
  }, [year]);

  const months = [
    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
  ];

  const latestPayroll = payrollHistory.length > 0 ? payrollHistory[0] : null;

  return (
    <div className="page-enter w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Salary</h1>
          <p className="text-base text-slate-500 mt-1">View your salary breakdown and payment history</p>
        </div>
        <select
          className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm w-auto text-base font-medium"
          value={year} onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Latest Salary Breakdown */}
      {latestPayroll && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-8 rounded-2xl text-white shadow-lg shadow-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl"><Wallet size={24} /></div>
              <span className="text-sm uppercase font-bold tracking-widest text-blue-100">Net Salary</span>
            </div>
            <p className="text-4xl font-black">{formatINR(latestPayroll.net_salary)}</p>
            <p className="text-sm text-blue-200 mt-2">{months[latestPayroll.month - 1]} {latestPayroll.year}</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={24} /></div>
              <span className="text-sm uppercase font-bold tracking-widest text-slate-400">Gross</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{formatINR(latestPayroll.gross_salary)}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-500">
              <div className="flex justify-between"><span>Basic</span><span className="font-semibold text-slate-700">{formatINR(latestPayroll.basic_pay)}</span></div>
              <div className="flex justify-between"><span>HRA</span><span className="font-semibold text-slate-700">{formatINR(latestPayroll.hra)}</span></div>
              <div className="flex justify-between"><span>DA</span><span className="font-semibold text-slate-700">{formatINR(latestPayroll.da)}</span></div>
              <div className="flex justify-between"><span>Special</span><span className="font-semibold text-slate-700">{formatINR(latestPayroll.special_allowance)}</span></div>
              {latestPayroll.overtime_pay > 0 && <div className="flex justify-between"><span>Overtime</span><span className="font-semibold text-orange-600">+{formatINR(latestPayroll.overtime_pay)}</span></div>}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl"><TrendingDown size={24} /></div>
              <span className="text-sm uppercase font-bold tracking-widest text-slate-400">Deductions</span>
            </div>
            <p className="text-3xl font-black text-red-600">{formatINR(latestPayroll.total_deductions)}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-500">
              <div className="flex justify-between"><span>PF (12%)</span><span className="font-semibold text-slate-700">{formatINR(latestPayroll.pf_employee)}</span></div>
              <div className="flex justify-between"><span>ESI</span><span className="font-semibold text-slate-700">{formatINR(latestPayroll.esi_employee)}</span></div>
              <div className="flex justify-between"><span>Prof. Tax</span><span className="font-semibold text-slate-700">{formatINR(latestPayroll.professional_tax)}</span></div>
              <div className="flex justify-between"><span>TDS</span><span className="font-semibold text-slate-700">{formatINR(latestPayroll.tds)}</span></div>
              {latestPayroll.lop_deduction > 0 && <div className="flex justify-between text-red-500"><span>LOP</span><span className="font-semibold">{formatINR(latestPayroll.lop_deduction)}</span></div>}
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            Payment History
          </h3>
        </div>
        {loading ? (
          <div className="p-10 text-center text-slate-400 animate-pulse">Loading history...</div>
        ) : payrollHistory.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm uppercase tracking-wide text-slate-500 bg-slate-50">
                  <th className="px-6 py-4 font-semibold">Month</th>
                  <th className="px-6 py-4 font-semibold text-right">Gross</th>
                  <th className="px-6 py-4 font-semibold text-right">Deductions</th>
                  <th className="px-6 py-4 font-semibold text-right text-green-600">Net Salary</th>
                  <th className="px-6 py-4 font-semibold text-center">Days</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payrollHistory.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-base text-slate-800">
                      {months[p.month - 1]} {p.year}
                    </td>
                    <td className="px-6 py-4 text-right text-base text-slate-600">{formatINR(p.gross_salary)}</td>
                    <td className="px-6 py-4 text-right text-base text-red-500">{formatINR(p.total_deductions)}</td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-green-600">{formatINR(p.net_salary)}</td>
                    <td className="px-6 py-4 text-center text-base text-slate-600">{p.present_days}/{p.working_days}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${
                        p.status === 'Locked' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {p.status === 'Locked' ? 'Paid' : p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-gray-400">No salary records found for {year}.</div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSalary;
