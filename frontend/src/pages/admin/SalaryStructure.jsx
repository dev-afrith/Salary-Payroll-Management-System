import React, { useState, useEffect } from 'react';
import { Wallet, Edit, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { formatINR } from '../../utils/formatCurrency';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

const SalaryStructure = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [saving, setSaving] = useState(false);

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/salary');
      setStructures(data);
    } catch (error) {
      toast.error('Failed to load salary structures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
    document.title = 'Salary Structure | AstraX Technologies';
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target);
    const payload = {
      basic_pay: Number(formData.get('basic_pay')),
      hra_percent: Number(formData.get('hra_percent')),
      da_amount: Number(formData.get('da_amount')),
      special_allowance: Number(formData.get('special_allowance')),
      overtime_rate: Number(formData.get('overtime_rate')),
      effective_from: formData.get('effective_from')
    };

    try {
      await API.put(`/salary/${editModal.data.employee_id}`, payload);
      toast.success('Salary structure updated');
      setEditModal({ open: false, data: null });
      fetchStructures();
    } catch (error) {
      toast.error('Failed to update salary structure');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Salary Structures</h1>
        <p className="text-base text-slate-500 mt-1">Configure pay components for each employee</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
        {loading ? (
          <div className="p-10 text-center text-gray-400 animate-pulse">Loading salary data...</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 font-semibold">Employee</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 font-semibold text-right">Basic Pay</th>
                  <th className="px-6 py-4 font-semibold text-right">HRA %</th>
                  <th className="px-6 py-4 font-semibold text-right">DA</th>
                  <th className="px-6 py-4 font-semibold text-right">Special</th>
                  <th className="px-6 py-4 font-semibold text-right">OT Rate</th>
                  <th className="px-6 py-4 font-semibold text-center">Effective</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {structures.map(s => (
                  <tr key={s.employee_id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-base text-slate-900">{s.full_name}</p>
                      <p className="text-sm font-mono text-slate-400">{s.emp_code}</p>
                    </td>
                    <td className="px-6 py-4 text-base text-slate-600">{s.department_name}</td>
                    <td className="px-6 py-4 text-right font-bold text-base text-blue-600">{formatINR(s.basic_pay)}</td>
                    <td className="px-6 py-4 text-right text-base text-slate-600">{s.hra_percent}%</td>
                    <td className="px-6 py-4 text-right text-base text-slate-600">{formatINR(s.da_amount)}</td>
                    <td className="px-6 py-4 text-right text-base text-slate-600">{formatINR(s.special_allowance)}</td>
                    <td className="px-6 py-4 text-right text-base text-slate-600">{formatINR(s.overtime_rate)}/hr</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-500">
                      {s.effective_from ? new Date(s.effective_from).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-6 py-4 text-center w-[100px]">
                      <button 
                        onClick={() => setEditModal({ open: true, data: s })}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {structures.length === 0 && (
              <div className="p-10 text-center text-gray-400">No salary structures configured yet.</div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, data: null })} title={`Edit Salary — ${editModal.data?.full_name || ''}`}>
        {editModal.data && (
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Basic Pay (₹)" name="basic_pay" type="number" defaultValue={editModal.data.basic_pay} required />
            <Input label="HRA Percent (%)" name="hra_percent" type="number" step="0.01" defaultValue={editModal.data.hra_percent} />
            <Input label="DA Amount (₹)" name="da_amount" type="number" defaultValue={editModal.data.da_amount} />
            <Input label="Special Allowance (₹)" name="special_allowance" type="number" defaultValue={editModal.data.special_allowance} />
            <Input label="Overtime Rate (₹/hr)" name="overtime_rate" type="number" defaultValue={editModal.data.overtime_rate} />
            <Input label="Effective From" name="effective_from" type="date" defaultValue={editModal.data.effective_from?.split('T')[0]} />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setEditModal({ open: false, data: null })}>Cancel</Button>
              <Button type="submit" icon={Save} loading={saving}>Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default SalaryStructure;
