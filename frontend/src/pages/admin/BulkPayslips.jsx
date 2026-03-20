import React, { useState, useEffect } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { generatePayslipPDF } from '../../utils/pdfGenerator';

import Button from '../../components/ui/Button';

const BulkPayslips = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/payroll/summary?month=${month}&year=${year}`);
      setRecords(data.records);
    } catch (error) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    document.title = 'Bulk Payslips | PayrollPro';
  }, [month, year]);

  const handleDownload = async (record) => {
    try {
      // Fetch full details for the specific employee payroll
      const { data } = await API.get(`/payroll/employee/${record.employee_id}?month=${month}&year=${year}`);
      generatePayslipPDF(data);
      toast.success(`Downloaded payslip for ${record.full_name}`);
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleBulkDownload = async () => {
    const lockedRecords = records.filter(r => r.status === 'Locked');
    if (lockedRecords.length === 0) {
      return toast.error('No locked payroll records found for this period');
    }

    toast.loading('Generating bulk payslips...', { id: 'bulk-download' });
    
    // For simplicity, we trigger downloads sequentially
    // In a real app, you might want to zip them or use a background worker
    for (const record of lockedRecords) {
      try {
        const { data } = await API.get(`/payroll/employee/${record.employee_id}?month=${month}&year=${year}`);
        generatePayslipPDF(data);
        // Small delay to prevent browser download blocking
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Failed for ${record.full_name}`, err);
      }
    }
    
    toast.success('Bulk download complete!', { id: 'bulk-download' });
  };

  return (
    <div className="page-enter w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bulk Payslips</h1>
          <p className="text-base text-slate-500 mt-1">Download and distribute employee payslips</p>
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
          <Button icon={Download} onClick={handleBulkDownload} variant="primary" className="text-sm font-semibold px-5 py-3">
            Download All (Locked)
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
        {loading ? (
          <div className="p-10 text-center text-slate-400 animate-pulse">Loading payroll records...</div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 font-semibold">Employee</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-base text-slate-900">{r.full_name}</p>
                      <p className="text-sm font-mono text-slate-400">{r.emp_code}</p>
                    </td>
                    <td className="px-6 py-4 text-base text-slate-600">{r.department_name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold uppercase rounded-full ${
                        r.status === 'Locked' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center w-[120px]">
                      <button 
                        onClick={() => handleDownload(r)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Download Payslip"
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-gray-400">
            No payroll records found for this period.
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkPayslips;
