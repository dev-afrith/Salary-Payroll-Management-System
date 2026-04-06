import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileBarChart, PieChart as PieIcon, TrendingUp, TrendingDown, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { formatINR } from '../../utils/formatCurrency';

const MonthlyReport = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [report, setReport] = useState(null);
  const [deptReport, setDeptReport] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repRes, deptRes, trendsRes] = await Promise.all([
        API.get(`/reports/monthly?month=${month}&year=${year}`),
        API.get(`/reports/departments?month=${month}&year=${year}`),
        API.get('/reports/trends')
      ]);
      setReport(repRes.data);
      setDeptReport(deptRes.data);
      setTrends(trendsRes.data);
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    document.title = 'Financial Reports | AstraX Technologies';
  }, [month, year]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="page-enter w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financial Reports</h1>
          <p className="text-base text-slate-500 mt-1">Analyze salary payouts and cost distribution</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-base"
            value={month} onChange={(e) => setMonth(Number(e.target.value))}
          >
            {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <select
            className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-base"
            value={year} onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 min-h-[140px]">
            <p className="text-sm uppercase font-semibold text-slate-500 tracking-wider mb-2">Total Gross Payout</p>
            <p className="text-4xl font-bold text-slate-900 tracking-tight mt-2">{formatINR(report.total_gross || 0)}</p>
          </div>
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 min-h-[140px]">
            <p className="text-sm uppercase font-semibold text-slate-500 tracking-wider mb-2">Total Net Payout</p>
            <p className="text-4xl font-bold text-green-600 tracking-tight mt-2">{formatINR(report.total_net || 0)}</p>
          </div>
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 min-h-[140px]">
            <p className="text-sm uppercase font-semibold text-slate-500 tracking-wider mb-2">Deductions (PF/Tax)</p>
            <p className="text-4xl font-bold text-red-500 tracking-tight mt-2">{formatINR(report.total_deductions || 0)}</p>
          </div>
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 min-h-[140px]">
            <p className="text-sm uppercase font-semibold text-slate-500 tracking-wider mb-2">Employee Count</p>
            <p className="text-4xl font-bold text-blue-600 tracking-tight mt-2">{report.employee_count || 0}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payout Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[320px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
            <h3 className="text-lg font-semibold text-slate-900">Monthly Payout Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{fontSize: 10}} tickFormatter={(m) => months[m-1].substring(0,3)} />
                <YAxis tick={{fontSize: 10}} tickFormatter={(v) => `₹${v/100000}L`} />
                <Tooltip formatter={(v) => formatINR(v)} />
                <Bar dataKey="total_net" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Net Payout" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[320px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><PieIcon size={20} /></div>
            <h3 className="text-lg font-semibold text-slate-900">Department-wise Cost</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptReport}
                  dataKey="total_cost"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({name}) => name}
                >
                  {deptReport.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatINR(v)} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
