import React, { useState, useEffect } from 'react';
import { Download, CalendarDays, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';

const MonthlyAttendance = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [year, setYear] = useState(currentDate.getFullYear());
  const [summary, setSummary] = useState([]);
  const [workingDays, setWorkingDays] = useState(26);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/attendance/monthly-summary?month=${month}&year=${year}`);
        setSummary(data.summary);
        setWorkingDays(data.total_working_days);
      } catch (error) {
        toast.error('Failed to load monthly summary');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
    document.title = 'Monthly Attendance | AstraX Technologies';
  }, [month, year]);

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, 
    { value: 3, label: 'March' }, { value: 4, label: 'April' }, 
    { value: 5, label: 'May' }, { value: 6, label: 'June' }, 
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, 
    { value: 9, label: 'September' }, { value: 10, label: 'October' }, 
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  return (
    <div className="page-enter w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Monthly Attendance Report</h1>
          <p className="text-base text-slate-500 mt-1">Overview of aggregated attendance for payroll processing</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-base"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select 
            className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-base"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button icon={Download} variant="outline" className="text-sm font-semibold px-5 py-3">Export CSV</Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
         <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 w-full min-h-[140px]">
           <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><CalendarDays size={28} /></div>
           <div>
             <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Configured Working Days</p>
             <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{workingDays} Days</h3>
           </div>
         </div>
         <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 w-full min-h-[140px]">
           <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Calculator size={28} /></div>
           <div>
             <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Employees</p>
             <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{summary.length}</h3>
           </div>
         </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
        {loading ? (
           <div className="p-10 text-center text-blue-500 animate-pulse font-medium">Aggregating records...</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 font-semibold">Employee</th>
                  <th className="px-6 py-4 font-semibold text-center border-l border-slate-100">Present (P)</th>
                  <th className="px-6 py-4 font-semibold text-center">Absent (A)</th>
                  <th className="px-6 py-4 font-semibold text-center">Half-day (HD)</th>
                  <th className="px-6 py-4 font-semibold text-center">Leave (L)</th>
                  <th className="px-6 py-4 font-semibold text-center text-red-500">LOP</th>
                  <th className="px-6 py-4 font-semibold text-center text-blue-600 bg-blue-50/50">Payable Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {summary.map((emp) => {
                  const lops = Number(emp.lop_days) || 0;
                  const absents = Number(emp.absent_days) || 0;
                  const halfDays = Number(emp.half_days) || 0; 
                  
                  const payableDays = Math.max(0, workingDays - absents - lops - halfDays);

                  return (
                    <tr key={emp.employee_id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-base text-slate-900">{emp.full_name}</p>
                        <p className="text-sm font-mono text-slate-400">{emp.employee_id}</p>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-base text-green-600 border-l border-slate-50">{emp.present_days || 0}</td>
                      <td className="px-6 py-4 text-center font-bold text-base text-slate-600">{emp.absent_days || 0}</td>
                      <td className="px-6 py-4 text-center font-bold text-base text-amber-600">{Number(emp.half_days || 0) * 2}</td>
                      <td className="px-6 py-4 text-center font-bold text-base text-purple-600">{emp.leave_days || 0}</td>
                      <td className="px-6 py-4 text-center font-bold text-base text-red-500">{emp.lop_days || 0}</td>
                      <td className="px-6 py-4 text-center font-bold text-base text-blue-700 bg-blue-50/30">
                        {payableDays}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {summary.length === 0 && (
              <div className="p-10 text-center text-gray-500">No attendance data found for this month.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyAttendance;
