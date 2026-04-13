import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Info, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [employee, setEmployee] = useState(null);

  const { register, handleSubmit, formState: { errors, isDirty, dirtyFields }, reset, watch, setValue } = useForm();

  // Format date for input[type="date"] (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  // Fetch employee data and departments on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          API.get(`/employees/${id}`),
          API.get('/departments')
        ]);

        const emp = empRes.data;
        setEmployee(emp);
        setDepartments(deptRes.data);

        // Set selected department to trigger designation fetch
        if (emp.department_id) {
          setSelectedDept(String(emp.department_id));
        }

        // Reset form with employee data
        reset({
          full_name: emp.full_name || '',
          email: emp.email || '',
          phone: emp.phone || '',
          date_of_birth: formatDateForInput(emp.date_of_birth),
          gender: emp.gender || 'Male',
          date_of_joining: formatDateForInput(emp.date_of_joining),
          employment_type: emp.employment_type || 'Full-time',
          department_id: emp.department_id ? String(emp.department_id) : '',
          designation_id: emp.designation_id ? String(emp.designation_id) : '',
          basic_pay: emp.basic_pay || 0,
          bank_account_number: emp.bank_account_number || '',
          ifsc_code: emp.ifsc_code || '',
          pan_number: emp.pan_number || '',
          pf_number: emp.pf_number || '',
          uan_number: emp.uan_number || '',
          address: emp.address || '',
        });
      } catch (error) {
        toast.error('Failed to load employee details');
        navigate('/admin/employees');
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
    document.title = 'Edit Employee | AstraX Technologies';
  }, [id, navigate, reset]);

  // Fetch designations when department changes
  useEffect(() => {
    if (selectedDept) {
      const fetchDesignations = async () => {
        try {
          const { data } = await API.get(`/designations?department_id=${selectedDept}`);
          setDesignations(data);
        } catch (error) {
          console.error('Error fetching designations');
        }
      };
      fetchDesignations();
    } else {
      setDesignations([]);
    }
  }, [selectedDept]);

  const onSubmit = async (data) => {
    if (!isDirty) {
      toast('No changes to save', { icon: 'ℹ️' });
      return;
    }

    setSaving(true);
    try {
      // Only send changed fields for cleaner updates
      const changedData = {};
      for (const key of Object.keys(dirtyFields)) {
        changedData[key] = data[key];
      }

      await API.put(`/employees/${id}`, changedData);
      toast.success('Employee updated successfully!');
      navigate(`/admin/employees/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-6 border-b border-border pb-3">
      <h2 className="text-base font-semibold text-text-primary tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
    </div>
  );

  const selectClass = "w-full bg-surface border border-border rounded-input px-3 py-2 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white outline-none transition-all shadow-sm";
  const labelClass = "block text-xs font-semibold text-text-primary mb-1.5 inline-block";

  // Loading skeleton
  if (pageLoading) {
    return (
      <div className="page-enter w-full max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page-enter w-full max-w-5xl mx-auto flex flex-col h-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate(`/admin/employees/${id}`)}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">Edit Employee</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Update details for <span className="font-semibold text-text-primary">{employee?.full_name}</span>
              <span className="ml-2 font-mono text-xs text-text-muted">{employee?.employee_id}</span>
            </p>
          </div>
        </div>
        {employee && (
          <Badge variant={employee.status} className="text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wide">
            {employee.status}
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
        <div className="space-y-6 pb-24">
          
          {/* Personal Details */}
          <div className="bg-surface-card border border-border rounded-card p-6 shadow-enterprise">
            <SectionHeader title="Personal Information" subtitle="Update the employee's personal details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <Input 
                label="Full Name" 
                placeholder="e.g. John Doe"
                {...register('full_name', { required: 'Full name is required' })}
                error={errors.full_name?.message}
              />
              <Input 
                label="Email Address" 
                type="email"
                placeholder="john.doe@company.com"
                {...register('email', { required: 'Email is required' })}
                error={errors.email?.message}
              />
              <Input 
                label="Phone Number" 
                placeholder="+91 XXXXX XXXXX"
                {...register('phone', { required: 'Phone is required' })}
                error={errors.phone?.message}
              />
              <Input 
                label="Date of Birth" 
                type="date"
                {...register('date_of_birth', { required: 'Date of birth is required' })}
                error={errors.date_of_birth?.message}
              />
              <div className="w-full">
                <label className={labelClass}>Gender</label>
                <select className={selectClass} {...register('gender')}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2 w-full">
                <label className={labelClass}>Residential Address</label>
                <textarea 
                  className={selectClass + " min-h-[80px] py-3"}
                  placeholder="Street name, City, State, ZIP..."
                  {...register('address')}
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-surface-card border border-border rounded-card p-6 shadow-enterprise">
            <SectionHeader title="Employment Details" subtitle="Modify job role and department information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <Input 
                label="Joining Date" 
                type="date"
                {...register('date_of_joining', { required: 'Joining date is required' })}
                error={errors.date_of_joining?.message}
              />
              <div className="w-full">
                <label className={labelClass}>Employment Type</label>
                <select className={selectClass} {...register('employment_type')}>
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div className="w-full">
                <label className={labelClass}>Department <span className="text-status-danger-text">*</span></label>
                <select 
                  className={`${selectClass} ${errors.department_id ? 'border-status-danger-text focus:ring-status-danger-text bg-status-danger-bg' : ''}`}
                  {...register('department_id', { required: 'Department is required' })}
                  onChange={(e) => {
                    register('department_id').onChange(e);
                    setSelectedDept(e.target.value);
                    // Reset designation when department changes
                    setValue('designation_id', '', { shouldDirty: true });
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {errors.department_id && <p className="mt-1 text-xs text-status-danger-text font-medium">{errors.department_id.message}</p>}
              </div>
              <div className="w-full">
                <label className={labelClass}>Designation <span className="text-status-danger-text">*</span></label>
                <select 
                  className={`${selectClass} ${errors.designation_id ? 'border-status-danger-text focus:ring-status-danger-text bg-status-danger-bg' : ''}`}
                  {...register('designation_id', { required: 'Designation is required' })}
                  disabled={!selectedDept}
                >
                  <option value="">Select Designation</option>
                  {designations.map(des => (
                    <option key={des.id} value={des.id}>{des.name}</option>
                  ))}
                </select>
                {errors.designation_id && <p className="mt-1 text-xs text-status-danger-text font-medium">{errors.designation_id.message}</p>}
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-surface-card border border-border rounded-card p-6 shadow-enterprise">
            <SectionHeader title="Financial & Statutory" subtitle="Bank and statutory compliance details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <Input 
                label="Monthly Basic Salary" 
                type="number"
                placeholder="0.00"
                {...register('basic_pay', { required: 'Basic pay is required' })}
                error={errors.basic_pay?.message}
              />
              <Input label="Bank Account Number" placeholder="Optional" {...register('bank_account_number')} />
              <Input label="IFSC Code" placeholder="Optional" {...register('ifsc_code')} />
              <Input label="PAN Number" placeholder="Optional" {...register('pan_number')} />
              <Input label="PF Number" placeholder="Optional" {...register('pf_number')} />
              <Input label="UAN Number" placeholder="Optional" {...register('uan_number')} />
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-surface-card border border-border rounded-card p-6 shadow-enterprise mb-8">
            <div className="bg-surface p-4 rounded-card border border-border flex flex-col justify-center">
              <p className="text-xs font-medium text-text-secondary leading-relaxed">
                <span className="font-semibold text-text-primary flex items-center gap-1.5 mb-1"><Info size={14} className="text-primary"/> Database Integrity</span>
                This form uses <span className="font-semibold text-primary">3NF Architecture</span>. Changes to email are automatically updated across identity and authentication tables securely.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 lg:left-[288px] right-0 bg-white border-t border-border p-4 px-6 md:px-8 flex justify-between items-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="hidden sm:block">
            {isDirty ? (
              <span className="text-xs font-medium text-status-warning-text bg-status-warning-bg px-2.5 py-1 rounded-full">
                Unsaved changes
              </span>
            ) : (
              <span className="text-xs font-medium text-text-muted">No changes made</span>
            )}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => navigate(`/admin/employees/${id}`)} className="w-full sm:w-32">Cancel</Button>
            <Button type="submit" loading={saving} icon={Save} disabled={!isDirty} className="w-full sm:w-auto px-6">
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;
