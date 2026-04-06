import React, { useState, useEffect } from 'react';
import { Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { formatINR } from '../../utils/formatCurrency';

import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';

const PayrollSummary = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [records, setRecords] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/payroll/summary?month=${month}&year=${year}`);
        setRecords(data.records);
        setTotals(data.totals);
      } catch (error) {
        toast.error('Failed to load payroll summary');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
    document.title = 'Payroll Summary | AstraX Technologies';
  }, [month, year]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Summary</h1>
          <p className="text-sm text-gray-500">Processed payroll overview for {months[month - 1]} {year}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            value={month} onChange={(e) => setMonth(Number(e.target.value))}
          >
            {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <select
            className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            value={year} onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Total Gross</p>
            <p className="text-xl font-black text-gray-900">{formatINR(totals.total_gross)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Total Deductions</p>
            <p className="text-xl font-black text-red-600">{formatINR(totals.total_deductions)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Net Payout</p>
            <p className="text-xl font-black text-green-600">{formatINR(totals.total_net)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Employees</p>
            <p className="text-xl font-black text-blue-600">{records.length}</p>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 animate-pulse">Loading payroll data...</div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500">
                  <th className="px-6 py-4 font-bold">Employee</th>
                  <th className="px-6 py-4 font-bold">Department</th>
                  <th className="px-6 py-4 font-bold text-right">Gross</th>
                  <th className="px-6 py-4 font-bold text-right">PF</th>
                  <th className="px-6 py-4 font-bold text-right">TDS</th>
                  <th className="px-6 py-4 font-bold text-right">LOP Ded.</th>
                  <th className="px-6 py-4 font-bold text-right">Deductions</th>
                  <th className="px-6 py-4 font-bold text-right text-green-600">Net Salary</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{r.full_name}</p>
                      <p className="text-xs font-mono text-gray-400">{r.emp_code}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.department_name}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-800">{formatINR(r.gross_salary)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">{formatINR(r.pf_employee)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">{formatINR(r.tds)}</td>
                    <td className="px-6 py-4 text-right text-sm text-red-500">{formatINR(r.lop_deduction)}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-red-600">{formatINR(r.total_deductions)}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-green-600">{formatINR(r.net_salary)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                        r.status === 'Locked' ? 'bg-red-50 text-red-600' :
                        r.status === 'Processed' ? 'bg-green-50 text-green-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-gray-400">
            No payroll records for {months[month - 1]} {year}. Process payroll first.
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollSummary;
