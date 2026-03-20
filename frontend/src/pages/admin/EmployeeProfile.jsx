import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, CheckCircle, XCircle, 
  User, Briefcase, Landmark, Calendar, Mail, Phone, MapPin 
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { formatDate } from '../../utils/dateHelpers';
import { formatINR } from '../../utils/formatCurrency';

import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data } = await API.get(`/employees/${id}`);
        setEmployee(data);
      } catch (error) {
        toast.error('Failed to load employee details');
        navigate('/admin/employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, navigate]);

  const handleStatusChange = async (action) => {
    try {
      await API.put(`/employees/${id}/${action}`);
      toast.success(`Employee ${action === 'approve' ? 'Approved' : 'Rejected'} successfully`);
      const { data } = await API.get(`/employees/${id}`);
      setEmployee(data);
    } catch (error) {
      toast.error(`Failed to ${action} employee`);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
      </div>
    </div>
  );

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'job', label: 'Job Information', icon: Briefcase },
    { id: 'financial', label: 'Financial & Statutory', icon: Landmark },
  ];

  return (
    <div className="page-enter w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/employees')}
            className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{employee.full_name}</h1>
            <p className="text-base text-slate-500 mt-1">Employee Profile • {employee.employee_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={Edit} onClick={() => navigate(`/admin/employees/${id}/edit`)} className="text-sm font-semibold px-5 py-2.5">Edit</Button>
          <Button variant="danger" icon={Trash2} onClick={() => setDeleteModal(true)} className="text-sm font-semibold px-5 py-2.5">Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
              {employee.full_name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{employee.full_name}</h2>
            <p className="text-blue-600 font-medium text-sm mb-2">{employee.designation_name}</p>
            <Badge variant={employee.status}>{employee.status}</Badge>
            
            <div className="w-full mt-6 pt-6 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={16} className="text-gray-400" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={16} className="text-gray-400" />
                <span>{employee.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>Joined {formatDate(employee.date_of_joining)}</span>
              </div>
            </div>
          </div>

          {/* Action Center (Approval) */}
          {employee.status === 'Pending' && (
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="text-blue-900 font-bold mb-2">Pending Approval</h3>
              <p className="text-blue-700 text-xs mb-4 leading-relaxed">
                This employee record is currently pending. Review the details below and take action.
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="primary" icon={CheckCircle} onClick={() => handleStatusChange('approve')} className="w-full">
                  Approve Employee
                </Button>
                <Button variant="danger" icon={XCircle} onClick={() => handleStatusChange('reject')} className="w-full">
                  Reject Profile
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-100 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === tab.id 
                      ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div className="p-8">
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailItem label="Full Name" value={employee.full_name} />
                  <DetailItem label="Email Address" value={employee.email} />
                  <DetailItem label="Phone Number" value={employee.phone} />
                  <DetailItem label="Gender" value={employee.gender} />
                  <DetailItem label="Date of Birth" value={formatDate(employee.date_of_birth)} />
                  <DetailItem label="Address" value="CIT Campus, Gubbi, Karnataka" />
                </div>
              )}

              {activeTab === 'job' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailItem label="Employee ID" value={employee.employee_id} />
                  <DetailItem label="Department" value={employee.department_name} />
                  <DetailItem label="Designation" value={employee.designation_name} />
                  <DetailItem label="Employment Type" value={employee.employment_type} />
                  <DetailItem label="Joining Date" value={formatDate(employee.date_of_joining)} />
                </div>
              )}

              {activeTab === 'financial' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailItem label="Basic Salary" value={formatINR(employee.basic_pay)} customClass="text-blue-600 font-bold" />
                  <DetailItem label="Bank Account" value={employee.bank_account_number || 'Not provided'} />
                  <DetailItem label="IFSC Code" value={employee.ifsc_code || 'Not provided'} />
                  <DetailItem label="PAN Number" value={employee.pan_number || 'Not provided'} />
                  <DetailItem label="PF Number" value={employee.pf_number || 'Not provided'} />
                  <DetailItem label="UAN Number" value={employee.uan_number || 'Not provided'} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Confirm Delete"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={async () => {
              try {
                await API.delete(`/employees/${id}`);
                toast.success('Employee deleted');
                navigate('/admin/employees');
              } catch (e) { toast.error('Delete failed'); }
            }}>
              Yes, Delete
            </Button>
          </>
        }
      >
        <p className="text-gray-600">Are you sure you want to delete this employee? This will also remove their user account.</p>
      </Modal>
    </div>
  );
};

const DetailItem = ({ label, value, customClass = '' }) => (
  <div className="mb-2 w-full">
    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">{label}</p>
    <p className={`text-base text-slate-800 ${customClass}`}>{value || '—'}</p>
  </div>
);

export default EmployeeProfile;
