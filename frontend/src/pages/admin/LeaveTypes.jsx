import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

const LeaveTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/leaves/types');
      setTypes(data);
    } catch (error) {
      toast.error('Failed to load leave types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
    document.title = 'Leave Types | AstraX Technologies';
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      max_days_per_year: Number(formData.get('max_days')),
      is_paid: formData.get('is_paid') === 'on',
      color: formData.get('color') || '#3B82F6'
    };

    try {
      if (editData) {
        await API.put(`/leaves/types/${editData.id}`, payload);
        toast.success('Leave type updated');
      } else {
        await API.post('/leaves/types', payload);
        toast.success('Leave type created');
      }
      setModalOpen(false);
      fetchTypes();
    } catch (error) {
      toast.error('Failed to save leave type');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (t) => {
    setEditData(t);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditData(null);
    setModalOpen(true);
  };

  return (
    <div className="page-enter w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leave Types</h1>
          <p className="text-base text-slate-500 mt-1">Configure company leave policies and quotas</p>
        </div>
        <Button icon={Plus} onClick={openCreate} className="text-sm font-semibold px-5 py-2.5">Add Leave Type</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
        {loading ? (
           <div className="p-10 text-center text-slate-400 animate-pulse">Loading leave types...</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 font-semibold">Leave Name</th>
                  <th className="px-6 py-4 font-semibold text-center">Max Days/Year</th>
                  <th className="px-6 py-4 font-semibold text-center">Type</th>
                  <th className="px-6 py-4 font-semibold text-center">Color Tag</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {types.map(t => (
                  <tr key={t.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-base text-slate-900">{t.name}</td>
                    <td className="px-6 py-4 text-center font-bold text-base text-slate-700">{t.max_days_per_year}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        t.is_paid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {t.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="w-6 h-6 rounded-full mx-auto" style={{ backgroundColor: t.color }}></div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => openEdit(t)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {types.length === 0 && (
              <div className="p-10 text-center text-gray-400">No leave types configured. Please create one.</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Leave Type' : 'Create Leave Type'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Leave Name" name="name" defaultValue={editData?.name} required placeholder="e.g. Sick Leave" />
          <Input label="Max Days Per Year" name="max_days" type="number" defaultValue={editData?.max_days_per_year} required />
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Color Tag</label>
            <input 
              type="color" 
              name="color" 
              defaultValue={editData?.color || '#3B82F6'} 
              className="w-16 h-10 p-1 border border-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors mt-2">
            <input 
              type="checkbox" 
              name="is_paid" 
              className="w-5 h-5 text-blue-600 rounded cursor-pointer" 
              defaultChecked={editData ? editData.is_paid : true} 
            />
            <span className="font-semibold text-gray-700">This is a Paid Leave</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" icon={Save} loading={saving}>Save Leave Type</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveTypes;
