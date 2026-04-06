import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Filter, Download, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { formatDate } from '../../utils/dateHelpers';
import useDebounce from '../../hooks/useDebounce';
import usePagination from '../../hooks/usePagination';

import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ department: '', status: '' });
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });

  const debouncedSearch = useDebounce(searchTerm, 300);
  const { 
    currentPage, 
    setCurrentPage, 
    startIndex, 
    endIndex 
  } = usePagination([], 10);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/employees', {
        params: {
          search: debouncedSearch,
          department: filters.department,
          status: filters.status,
          page: currentPage,
          limit: 10
        }
      });
      setEmployees(data.employees);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, currentPage]);

  const fetchDepartments = async () => {
    try {
      const { data } = await API.get('/departments');
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchDepartments();
    document.title = 'Employees | AstraX Technologies';
  }, []);

  const handleDelete = async () => {
    try {
      await API.delete(`/employees/${deleteModal.id}`);
      toast.success('Employee deleted successfully');
      setDeleteModal({ open: false, id: null, name: '' });
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const headers = [
    'Employee', 'Emp ID', 'Dept / Role', 'Type', 'Status', 'Joined Date', 'Actions'
  ];

  return (
    <div className="page-enter w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
            <span className="text-primary cursor-pointer hover:underline" onClick={() => navigate('/admin/dashboard')}>Dashboard</span> <span className="mx-1">/</span> <span>Employees</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Employees Management</h1>
            <Badge variant="active" className="text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wide">{total} Total</Badge>
          </div>
        </div>
        <Button 
          icon={Plus} 
          onClick={() => navigate('/admin/employees/add')}
          className="shadow-sm font-semibold"
        >
          Add Employee
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-surface-card p-4 rounded-card shadow-sm border border-border flex flex-col lg:flex-row gap-4">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search employees by name, ID or email..." 
          className="flex-1 max-w-md"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-muted" />
            <select 
              className="bg-surface border border-border text-text-primary text-sm rounded-input focus:ring-1 focus:ring-primary focus:border-primary block p-2 outline-none shadow-sm cursor-pointer"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <select 
            className="bg-surface border border-border text-text-primary text-sm rounded-input focus:ring-1 focus:ring-primary focus:border-primary block p-2 outline-none shadow-sm cursor-pointer"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <Button variant="outline" icon={Download} size="md">Export</Button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-surface-card rounded-card shadow-sm border border-border overflow-hidden w-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">Showing {employees.length} of {total} results</span>
        </div>
        <Table headers={headers} loading={loading} className="border-0 shadow-none rounded-none !bg-transparent">
          {employees.map((emp) => (
            <tr key={emp.id} className="h-[52px] hover:bg-surface border-b border-border transition-colors last:border-0 hover:shadow-sm">
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {emp.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{emp.full_name}</p>
                    <p className="text-xs text-text-secondary">{emp.email}</p>
                  </div>
                </div>
              </td>
              <td>
                <span className="text-sm font-mono font-medium text-text-secondary">{emp.employee_id}</span>
              </td>
              <td>
                <p className="text-sm font-semibold text-text-primary">{emp.department_name}</p>
                <p className="text-xs text-text-secondary">{emp.designation_name}</p>
              </td>
              <td>
                <span className="text-sm text-text-primary">{emp.employment_type}</span>
              </td>
              <td>
                <Badge variant={emp.status} className="text-xs font-semibold px-2 py-0.5 uppercase tracking-wide">{emp.status}</Badge>
              </td>
              <td className="text-sm text-text-secondary">
                {formatDate(emp.date_of_joining)}
              </td>
              <td className="w-[120px]">
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => navigate(`/admin/employees/${emp.id}`)}
                    className="p-1 text-text-muted hover:text-primary hover:bg-primary/5 rounded transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => navigate(`/admin/employees/${emp.id}/edit`)}
                    className="p-1 text-text-muted hover:text-status-warning-text hover:bg-status-warning-bg/10 rounded transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDeleteModal({ open: true, id: emp.id, name: emp.full_name })}
                    className="p-1 text-text-muted hover:text-status-danger-text hover:bg-status-danger-bg rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
        
        <div className="border-t border-border">
          <Pagination 
            currentPage={currentPage}
            totalPages={Math.ceil(total / 10)}
            onPageChange={setCurrentPage}
            totalItems={total}
            startIndex={startIndex}
            endIndex={Math.min(endIndex, total)}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, name: '' })}
        title="Confirm Delete"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal({ open: false, id: null, name: '' })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Employee
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete <span className="font-semibold text-text-primary">{deleteModal.name}</span>? 
          This action will permanently remove the employee record and their user account. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Employees;
