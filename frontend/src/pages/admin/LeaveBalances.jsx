import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

const LeaveBalances = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [employeesMap, setEmployeesMap] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [allocating, setAllocating] = useState(false);

  // Fetch both balances and types
  const fetchData = async () => {
    setLoading(true);
    try {
      const [balRes, typesRes] = await Promise.all([
        API.get(`/leaves/balance/all?year=${year}`),
        API.get('/leaves/types')
      ]);
      setEmployeesMap(balRes.data);
      setLeaveTypes(typesRes.data);
    } catch (error) {
      toast.error('Failed to load leave balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    document.title = 'Leave Balances | AstraX Technologies';
  }, [year]);

  const handleAllocate = async (e) => {
    e.preventDefault();
    setAllocating(true);
    const formData = new FormData(e.target);
    const payload = {
      year,
      type_id: Number(formData.get('type_id')),
      days: Number(formData.get('days')),
      employee_id: formData.get('employee_id')
    };

    try {
      await API.post('/leaves/balance/allocate', payload);
      toast.success('Leaves allocated successfully');
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to allocate leaves');
    } finally {
      setAllocating(false);
    }
  };

  return (
    <div className="page-enter w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leave Balances</h1>
          <p className="text-base text-slate-500 mt-1">Manage allocated leave quotas for employees</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base"
            value={year} onChange={(e) => setYear(Number(e.target.value))}
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        <Button icon={Plus} onClick={() => setModalOpen(true)} className="text-sm font-semibold px-5 py-3">Allocate Leaves</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
        {loading ? (
          <div className="p-10 text-center text-slate-400 animate-pulse">Loading balances...</div>
        ) : employeesMap.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 font-semibold">Employee</th>
                  {leaveTypes.map(lt => (
                    <th key={lt.id} className="px-6 py-4 font-semibold text-center">
                      <div className="flex flex-col items-center">
                        <span className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: lt.color }}></span>
                        {lt.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employeesMap.map(emp => (
                  <tr key={emp.employee_id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-base text-slate-900">{emp.full_name}</p>
                      <p className="text-sm font-mono text-slate-400">{emp.emp_code}</p>
                    </td>
                    {leaveTypes.map(lt => {
                      const balance = emp.balances.find(b => b.leave_type_id === lt.id);
                      return (
                        <td key={lt.id} className="px-6 py-4 text-center">
                          {balance ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-xl font-bold text-slate-900">{balance.remaining}</span>
                              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">
                                {balance.used} used / {balance.allocated} alloc
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-gray-400">No approved employees found for this year.</div>
        )}
      </div>

      {/* Allocation Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Allocate Leaves for ${year}`}>
        <form onSubmit={handleAllocate} className="space-y-5">
          <Select 
            label="Target Employee(s)" 
            name="employee_id" 
            options={[
              { value: 'all', label: 'All Approved Employees (Blanket Allocation)' },
              ...employeesMap.map(e => ({ value: e.employee_id, label: `${e.full_name} (${e.emp_code})` }))
            ]} 
          />
          <Select 
            label="Leave Type" 
            name="type_id" 
            options={leaveTypes.map(lt => ({ value: lt.id, label: `${lt.name} (Max: ${lt.max_days_per_year})` }))} 
            required
          />
          <Input 
            label="Number of Days to Allocate" 
            name="days" 
            type="number" 
            step="0.5"
            placeholder="e.g. 12"
            required 
            helperText="This sets the initial allocation. If the employee already used leaves, remaining will be (Allocation - Used)."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" icon={Save} loading={allocating}>Run Allocation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveBalances;
