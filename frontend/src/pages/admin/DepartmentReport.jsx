import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, Users, ArrowDown, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { formatINR } from '../../utils/formatCurrency';

import Table from '../../components/ui/Table';

const DepartmentReport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/reports/departments?month=${month}&year=${year}`);
        setReportData(data);
      } catch (error) {
        toast.error('Failed to load department report');
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
    document.title = 'Department Report | PayrollPro';
  }, [month, year]);

  const totalExpense = reportData.reduce((sum, d) => sum + (Number(d.total_net_salary) || 0), 0);
  const totalEmployees = reportData.reduce((sum, d) => sum + (Number(d.employee_count) || 0), 0);

  return (
    <div className="page-enter w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Department Analytics</h1>
          <p className="text-base text-slate-500 mt-1">Cost breakdown and payroll distribution across all departments</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm font-semibold"
            value={month} onChange={(e) => setMonth(Number(e.target.value))}
          >
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select 
            className="border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm font-semibold"
            value={year} onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 p-7 rounded-2xl text-white shadow-lg shadow-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl"><Building2 size={24} /></div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">Total Depts</span>
          </div>
          <p className="text-4xl font-black">{reportData.length}</p>
        </div>

        <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-blue-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Net Salary</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
          </div>
          <p className="text-3xl font-black text-slate-900">{formatINR(totalExpense)}</p>
        </div>

        <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-red-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Deductions</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><ArrowDown size={20} /></div>
          </div>
          <p className="text-3xl font-black text-red-600">
            {formatINR(reportData.reduce((sum, d) => sum + (Number(d.total_deductions) || 0), 0))}
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-green-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Headcount</span>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Users size={20} /></div>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalEmployees}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600"/>
            Department Cost Comparison
          </h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400 animate-pulse">Loading chart...</div>
          ) : reportData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="department_name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => formatINR(value)}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}/>
                  <Bar dataKey="total_net_salary" name="Net Payout" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="total_deductions" name="Deductions" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">No data for selected month</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-900">Headcount Distribution</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center text-slate-400 py-10">Loading...</div>
            ) : reportData.length > 0 ? (
              <div className="space-y-4">
                {reportData.map((dept, idx) => {
                  const pct = totalEmployees > 0 ? ((dept.employee_count / totalEmployees) * 100).toFixed(1) : 0;
                  return (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 hover:border-blue-100 bg-white transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">{dept.department_name}</span>
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{dept.employee_count} emp</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <p className="text-xs text-right text-slate-400 font-medium">{pct}% of workforce</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-10">No headcount data</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Comprehensive Department Breakdown</h3>
        </div>
        <Table headers={['Department', 'Employees', 'Gross Payroll', 'Total Deductions', 'Net Payout']} loading={loading}>
          {reportData.map((dept, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-bold text-slate-800">{dept.department_name}</td>
              <td className="px-6 py-4 font-semibold text-slate-600">{dept.employee_count}</td>
              <td className="px-6 py-4 font-mono text-slate-600">{formatINR(dept.total_gross_salary)}</td>
              <td className="px-6 py-4 font-mono text-red-500">{formatINR(dept.total_deductions)}</td>
              <td className="px-6 py-4 font-mono text-indigo-600 font-bold text-lg">{formatINR(dept.total_net_salary)}</td>
            </tr>
          ))}
        </Table>
      </div>

    </div>
  );
};

export default DepartmentReport;
