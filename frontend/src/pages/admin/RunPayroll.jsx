import React, { useState } from 'react';
import { Play, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const RunPayroll = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [processing, setProcessing] = useState(false);
  const [locking, setLocking] = useState(false);
  const [result, setResult] = useState(null);
  const [confirmLock, setConfirmLock] = useState(false);

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const handleProcess = async () => {
    setProcessing(true);
    setResult(null);
    try {
      const { data } = await API.post('/payroll/process', { month, year });
      setResult(data);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  const handleLock = async () => {
    setLocking(true);
    try {
      await API.post('/payroll/lock', { month, year });
      toast.success('Payroll locked for the month');
      setConfirmLock(false);
      setResult(prev => prev ? { ...prev, locked: true } : null);
    } catch (error) {
      toast.error('Failed to lock payroll');
    } finally {
      setLocking(false);
    }
  };

  return (
    <div className="page-enter w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Process Monthly Payroll</h1>
        <p className="text-base text-slate-500 mt-1">Run salary calculations based on attendance and salary structures</p>
      </div>

      {/* Selection Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Play size={24} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Select Period</h2>
            <p className="text-xs text-gray-400">Choose the month and year to process payroll for</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Month</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800">Before processing, ensure:</p>
              <ul className="text-xs text-amber-700 list-disc ml-4 mt-1 space-y-0.5">
                <li>Working days are configured for this month</li>
                <li>Daily attendance is marked for all employees</li>
                <li>Salary structures are set for all approved employees</li>
              </ul>
            </div>
          </div>
        </div>

        <Button 
          className="w-full py-4 text-base font-bold shadow-lg shadow-blue-200"
          icon={Play}
          loading={processing}
          onClick={handleProcess}
        >
          {processing ? 'Processing...' : `Process Payroll for ${months[month - 1]} ${year}`}
        </Button>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Processing Complete</h2>
              <p className="text-xs text-gray-400">Payroll has been calculated successfully</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
              <p className="text-3xl font-black text-green-700">{result.processed}</p>
              <p className="text-xs font-bold text-green-600 mt-1">Processed</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
              <p className="text-3xl font-black text-yellow-700">{result.skipped}</p>
              <p className="text-xs font-bold text-yellow-600 mt-1">Skipped (Locked)</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
              <p className="text-3xl font-black text-blue-700">{result.total}</p>
              <p className="text-xs font-bold text-blue-600 mt-1">Total Employees</p>
            </div>
          </div>

          {!result.locked && (
            <Button 
              variant="danger" 
              icon={Lock}
              className="w-full"
              onClick={() => setConfirmLock(true)}
            >
              Lock Payroll for {months[month - 1]} {year}
            </Button>
          )}
        </div>
      )}

      {/* Lock Confirmation Modal */}
      <Modal isOpen={confirmLock} onClose={() => setConfirmLock(false)} title="Confirm Payroll Lock">
        <p className="text-gray-600 mb-6">
          Locking payroll for <strong>{months[month - 1]} {year}</strong> will prevent any further modifications. 
          This action is typically done before generating payslips.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmLock(false)}>Cancel</Button>
          <Button variant="danger" icon={Lock} loading={locking} onClick={handleLock}>
            Yes, Lock Payroll
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RunPayroll;
