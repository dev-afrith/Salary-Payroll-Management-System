import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, Landmark, Mail, Phone, Calendar, MapPin, 
  ShieldCheck, CreditCard, Award 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/axios';
import { formatDate } from '../../utils/dateHelpers';
import { formatINR } from '../../utils/formatCurrency';

import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const Profile = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/auth/me');
        if (data.user && data.user.employee) {
          setEmployee(data.user.employee);
        } else {
          toast.error('Employee profile not found.');
        }
      } catch (error) {
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
    document.title = 'My Profile | PayrollPro';
  }, [user]);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
      </div>
    </div>
  );

  if (!employee) return (
    <div className="p-10 text-center text-slate-500">
      Failed to load profile data. Please contact HR.
    </div>
  );

  return (
    <div className="page-enter w-full space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-base text-slate-500 mt-1">View your personal and professional information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400" />
            <div className="px-8 pb-8">
              <div className="relative -mt-12 mb-5">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                    {employee.full_name.charAt(0)}
                  </div>
                </div>
                <div className="absolute bottom-0 left-16 p-1.5 bg-green-500 border-4 border-white rounded-full" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{employee.full_name}</h2>
              <p className="text-blue-600 font-semibold text-base mb-4">{employee.designation_name}</p>
              <Badge variant="active">Active Employee</Badge>
              
              <div className="mt-8 pt-8 border-t border-slate-100 space-y-5">
                <ContactInfo icon={Mail} label="Email Address" value={employee.email} />
                <ContactInfo icon={Phone} label="Contact Number" value={employee.phone} />
                <ContactInfo icon={ShieldCheck} label="Employee ID" value={employee.employee_id} />
                <ContactInfo icon={Award} label="Department" value={employee.department_name} />
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg shadow-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-xl">
                <CreditCard size={24} />
              </div>
              <h3 className="font-bold text-lg">Salary Information</h3>
            </div>
            <p className="text-blue-100 text-sm mb-2 uppercase tracking-widest font-semibold">Basic Monthly Pay</p>
            <h4 className="text-4xl font-black tracking-tight mb-6">{formatINR(employee.basic_pay)}</h4>
            <div className="pt-6 border-t border-white/20">
              <p className="text-xs text-blue-200 uppercase font-bold tracking-wider mb-1">Bank Account Number</p>
              <p className="text-base font-medium tracking-widest">•••• •••• {employee.bank_account_number?.slice(-4) || 'XXXX'}</p>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <User size={20} className="text-blue-600" />
                Personal Information
              </h3>
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <InfoItem label="Full Name" value={employee.full_name} />
              <InfoItem label="Date of Birth" value={formatDate(employee.date_of_birth)} />
              <InfoItem label="Gender" value={employee.gender} />
              <InfoItem label="Phone Number" value={employee.phone} />
              <InfoItem label="Email" value={employee.email} />
              <InfoItem label="Address" value="CIT Campus, Gubbi, Tumkur, Karnataka - 572216" />
            </div>
          </section>

          {/* Job Info */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <Briefcase size={20} className="text-blue-600" />
                Employment Details
              </h3>
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <InfoItem label="Designation" value={employee.designation_name} />
              <InfoItem label="Department" value={employee.department_name} />
              <InfoItem label="Employee Code" value={employee.employee_id} />
              <InfoItem label="Joining Date" value={formatDate(employee.date_of_joining)} />
              <InfoItem label="Employment Type" value={employee.employment_type} />
              <InfoItem label="Work Location" value="Corporate Office" />
            </div>
          </section>

          {/* Statutory Info */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck size={20} className="text-blue-600" />
                Statutory & KYC Info
              </h3>
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <InfoItem label="PAN Number" value={employee.pan_number || 'NA'} />
              <InfoItem label="PF Number" value={employee.pf_number || 'NA'} />
              <InfoItem label="UAN Number" value={employee.uan_number || 'NA'} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ContactInfo = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs uppercase font-semibold tracking-wider text-slate-500 leading-none mb-1.5">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value || '—'}</p>
    </div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase font-semibold tracking-wide text-slate-400 mb-1.5">{label}</p>
    <p className="text-base font-bold text-slate-900">{value || '—'}</p>
  </div>
);

export default Profile;
