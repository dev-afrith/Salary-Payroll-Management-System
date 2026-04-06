import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Briefcase, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Table from '../../components/ui/Table';

const EmployeeReportList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const { data } = await API.get('/employees?limit=1000');
        // Filter to only Approved ones for analytics
        const empList = data.employees || [];
        setEmployees(empList.filter(e => e.status === 'Approved'));
      } catch (error) {
        toast.error('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
    document.title = 'Employee Reports | AstraX Technologies';
  }, []);

  const filtered = employees.filter(e => 
    e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.department_name && e.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-enter w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employee Reports</h1>
          <p className="text-base text-slate-500 mt-1">Select an employee to view their detailed analytics and payroll history</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={20} />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-all font-medium text-slate-800 shadow-sm"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
        <Table headers={['Employee', 'Contact', 'Designation / Dept', 'Action']} loading={loading}>
          {filtered.map(emp => (
             <tr key={emp.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/reports/employee/${emp.id}`)}>
               <td className="px-6 py-4">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                     {emp.full_name.charAt(0)}
                   </div>
                   <div>
                     <p className="font-bold text-slate-900">{emp.full_name}</p>
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{emp.employee_id}</p>
                   </div>
                 </div>
               </td>
               <td className="px-6 py-4">
                 <div className="flex flex-col gap-1">
                   <span className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                     <Mail size={14} className="text-slate-400"/> {emp.email}
                   </span>
                 </div>
               </td>
               <td className="px-6 py-4">
                 <div>
                   <p className="font-semibold text-slate-800">{emp.designation_name}</p>
                   <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                     <Briefcase size={14} className="text-slate-400"/> {emp.department_name}
                   </p>
                 </div>
               </td>
               <td className="px-6 py-4">
                 <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                   View Report <ChevronRight size={18} />
                 </div>
               </td>
             </tr>
          ))}
        </Table>
      </div>

    </div>
  );
};

export default EmployeeReportList;
