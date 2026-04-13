import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      gender: 'Male',
      employment_type: 'Full-time',
      basic_pay: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get('/departments');
        setDepartments(data);
      } catch (error) {
        toast.error('Failed to load departments');
      }
    };
    fetchData();
    document.title = 'Add Employee | AstraX Technologies';
  }, []);

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
    setLoading(true);
    try {
      await API.post('/employees', data);
      toast.success('Employee added successfully! Pending approval.');
      navigate('/admin/employees');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title }) => (
    <div className="mb-6 border-b border-border pb-3">
      <h2 className="text-base font-semibold text-text-primary tracking-tight">{title}</h2>
    </div>
  );

  const selectClass = "w-full bg-surface border border-border rounded-input px-3 py-2 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white outline-none transition-all shadow-sm";
  const labelClass = "block text-xs font-semibold text-text-primary mb-1.5 inline-block";

  return (
    <div className="page-enter w-full max-w-5xl mx-auto flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          type="button"
          onClick={() => navigate('/admin/employees')}
          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">Add New Employee</h1>
          <p className="text-sm text-text-secondary mt-0.5">Register a new staff member to the organization.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
        <div className="space-y-6 pb-24">
          
          {/* Personal Details */}
          <div className="bg-surface-card border border-border rounded-card p-6 shadow-enterprise">
            <SectionHeader title="Personal Information" />
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
            <SectionHeader title="Employment Details" />
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
            <SectionHeader title="Financial & Statutory" />
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

          {/* Login Security */}
          <div className="bg-surface-card border border-border rounded-card p-6 shadow-enterprise mb-8">
            <SectionHeader title="System Access" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <Input 
                label="System Password" 
                type="password"
                placeholder="Default will be Emp@123"
                {...register('password')}
              />
              <div className="bg-surface p-4 rounded-card border border-border flex flex-col justify-center">
                <p className="text-xs font-medium text-text-secondary leading-relaxed">
                  <span className="font-semibold text-text-primary flex items-center gap-1.5 mb-1"><Info size={14} className="text-primary"/> Approval Process</span>
                  New employees are registered as <span className="px-1 py-0.5 bg-status-warning-bg text-status-warning-text rounded font-semibold text-[10px] uppercase">Pending</span> by default. You must verify and approve them before system login is enabled.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 lg:left-[288px] right-0 bg-white border-t border-border p-4 px-6 md:px-8 flex justify-end gap-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button variant="outline" onClick={() => navigate('/admin/employees')} className="w-full sm:w-32">Cancel</Button>
          <Button type="submit" loading={loading} icon={Save} className="w-full sm:w-auto px-6">
            Register Employee
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
