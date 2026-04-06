import React, { useState, useEffect } from 'react';
import { Download, Table as TableIcon, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { generatePayslipPDF } from '../../utils/pdfGenerator';
import { formatINR } from '../../utils/formatCurrency';

import Button from '../../components/ui/Button';

const EmployeePayslips = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/payroll/my?year=${year}`);
      setHistory(data);
    } catch (error) {
      toast.error('Failed to load payslip history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    document.title = 'My Payslips | AstraX Technologies';
  }, [year]);

  const handleDownload = async (p) => {
    try {
      const { data } = await API.get(`/payroll/employee/${p.employee_id}?month=${p.month}&year=${p.year}`);
      generatePayslipPDF(data);
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="page-enter w-full mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Payslips</h1>
          <p className="text-base text-slate-500 mt-1">Download your monthly salary statements</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-slate-400" />
          <select
            className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-base font-medium"
            value={year} onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
        {loading ? (
          <div className="p-10 text-center text-slate-400 animate-pulse">Loading history...</div>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 font-semibold">Month / Year</th>
                  <th className="px-6 py-4 font-semibold text-right">Net Salary</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-base text-slate-900">
                      {months[p.month - 1]} {p.year}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-lg text-green-600">
                      {formatINR(p.net_salary)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${
                        p.status === 'Locked' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {p.status === 'Locked' ? 'Released' : p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center w-[120px]">
                      <button 
                        onClick={() => handleDownload(p)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Download PDF"
                        disabled={p.status !== 'Locked'}
                      >
                        <Download size={20} className={p.status !== 'Locked' ? 'opacity-30' : ''} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-400">
            <TableIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No payslips found for {year}.</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
          <TableIcon size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900">Note on Availability</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Payslips are usually available for download once they are 'Released' by the HR department. 
            If your latest salary is still 'Processed', it might be undergo final verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeePayslips;
