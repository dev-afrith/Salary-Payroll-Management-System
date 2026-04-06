import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Edit, Trash2, Shield, Info, 
  ChevronRight, LayoutGrid, UserCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  
  // Modals state
  const [deptModal, setDeptModal] = useState({ open: false, mode: 'add', data: null });
  const [desigModal, setDesigModal] = useState({ open: false, mode: 'add', data: null });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/departments');
      setDepartments(data);
      if (data.length > 0 && !selectedDept) setSelectedDept(data[0]);
    } catch (error) { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  };

  const fetchDesignations = async (deptId) => {
    try {
      const { data } = await API.get(`/designations?department_id=${deptId}`);
      setDesignations(data);
    } catch (error) { toast.error('Failed to load designations'); }
  };

  useEffect(() => {
    fetchDepartments();
    document.title = 'Departments | AstraX Technologies';
  }, []);

  useEffect(() => {
    if (selectedDept) fetchDesignations(selectedDept.id);
  }, [selectedDept]);

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    
    try {
      if (deptModal.mode === 'add') {
        await API.post('/departments', payload);
        toast.success('Department created');
      } else {
        await API.put(`/departments/${deptModal.data.id}`, payload);
        toast.success('Department updated');
      }
      setDeptModal({ open: false, mode: 'add', data: null });
      fetchDepartments();
    } catch (error) { toast.error(error.response?.data?.message || 'Error processing request'); }
  };

  const handleDesigSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = { 
      name: formData.get('name'), 
      department_id: selectedDept.id 
    };
    
    try {
      if (desigModal.mode === 'add') {
        await API.post('/designations', payload);
        toast.success('Designation created');
      } else {
        await API.put(`/designations/${desigModal.data.id}`, payload);
        toast.success('Designation updated');
      }
      setDesigModal({ open: false, mode: 'add', data: null });
      fetchDesignations(selectedDept.id);
    } catch (error) { toast.error('Error processing request'); }
  };

  const deleteItem = async (type, id) => {
    const confirmMsg = type === 'department' ? 'Delete this department and all nested designations?' : 'Delete this designation?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await API.delete(`/${type}s/${id}`);
      toast.success('Deleted successfully');
      if (type === 'department') fetchDepartments();
      else fetchDesignations(selectedDept.id);
    } catch (error) { toast.error(error.response?.data?.message || 'Cannot delete: dependencies found'); }
  };

  return (
    <div className="page-enter w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Organizations Structure</h1>
        <p className="text-base text-slate-500 mt-1">Manage company departments and job roles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Department List (Left) */}
        <div className="md:col-span-5 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              Departments
            </h2>
            <button 
              onClick={() => setDeptModal({ open: true, mode: 'add', data: null })}
              className="text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
            {departments.map(dept => (
              <div 
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                className={`p-4 cursor-pointer flex items-center justify-between group transition-all ${
                  selectedDept?.id === dept.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1 shadow-sm h-12 rounded-full ${selectedDept?.id === dept.id ? 'bg-blue-600' : 'bg-transparent'}`} />
                  <div>
                    <h3 className={`text-sm font-bold ${selectedDept?.id === dept.id ? 'text-blue-700' : 'text-gray-900'}`}>{dept.name}</h3>
                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{dept.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeptModal({ open: true, mode: 'edit', data: dept }); }}
                    className="p-1 px-2 text-xs font-semibold text-gray-400 hover:text-blue-600 border border-transparent hover:bg-white rounded"
                  >
                    Edit
                  </button>
                  <ChevronRight size={16} className={selectedDept?.id === dept.id ? 'text-blue-600' : 'text-gray-300'} />
                </div>
              </div>
            ))}
            {departments.length === 0 && !loading && (
              <div className="p-10 text-center text-gray-400 text-sm">No departments yet</div>
            )}
          </div>
        </div>

        {/* Designation List (Right) */}
        <div className="md:col-span-7 lg:col-span-8 space-y-4 w-full">
          {selectedDept ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[60vh] w-full">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Designations in {selectedDept.name}</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage specific roles and their configurations</p>
                </div>
                <Button size="sm" icon={Plus} onClick={() => setDesigModal({ open: true, mode: 'add', data: null })} className="text-sm font-semibold px-5 py-2.5">
                  Add Designation
                </Button>
              </div>

              <div className="p-6 w-full overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-6 py-4 text-left">ID</th>
                      <th className="px-6 py-4 text-left">Role Name</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                  {designations.map((des, index) => (
                    <tr key={des.id} className="hover:bg-blue-50/50 border-b border-slate-50 last:border-0 transition-colors">
                      <td className="px-6 py-4 text-base font-mono text-slate-500">#{index + 1}</td>
                      <td className="px-6 py-4">
                        <span className="text-base font-semibold text-slate-900">{des.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          des.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {des.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 w-[100px]">
                        <div className="flex items-center gap-2 text-slate-400">
                          <button onClick={() => setDesigModal({ open: true, mode: 'edit', data: des })} className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={18} /></button>
                          <button onClick={() => deleteItem('designation', des.id)} className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-[60vh] rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
              <Building2 size={48} className="mb-4 text-gray-200" />
              <p>Select a department to manage designations</p>
            </div>
          )}
        </div>
      </div>

      {/* Dept Modal */}
      <Modal 
        isOpen={deptModal.open} 
        onClose={() => setDeptModal({ open: false, mode: 'add', data: null })}
        title={deptModal.mode === 'add' ? 'New Department' : 'Edit Department'}
      >
        <form onSubmit={handleDeptSubmit} className="space-y-4">
          <Input label="Department Name" name="name" defaultValue={deptModal.data?.name} required />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea 
              name="description" 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 h-24"
              defaultValue={deptModal.data?.description}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setDeptModal({ open: false })}>Cancel</Button>
            <Button type="submit">{deptModal.mode === 'add' ? 'Create' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* Designation Modal */}
      <Modal 
        isOpen={desigModal.open} 
        onClose={() => setDesigModal({ open: false, mode: 'add', data: null })}
        title={desigModal.mode === 'add' ? 'New Designation' : 'Edit Designation'}
      >
        <form onSubmit={handleDesigSubmit} className="space-y-4">
          <Input label="Designation Name" name="name" defaultValue={desigModal.data?.name} required />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setDesigModal({ open: false })}>Cancel</Button>
            <Button type="submit">{desigModal.mode === 'add' ? 'Create' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
