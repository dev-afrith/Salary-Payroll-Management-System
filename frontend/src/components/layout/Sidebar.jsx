import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, CalendarDays,
  CalendarRange, Clock, DollarSign, PlayCircle, FileText,
  Palmtree, BarChart2, Receipt,
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';

const adminLinks = [
  { section: 'MAIN' },
  { label: 'Dashboard',         path: '/admin/dashboard',           icon: LayoutDashboard },

  { section: 'EMPLOYEES' },
  { label: 'All Employees',     path: '/admin/employees',           icon: Users },
  { label: 'Departments',       path: '/admin/departments',         icon: Building2 },

  { section: 'ATTENDANCE' },
  { label: 'Daily Attendance',  path: '/admin/attendance/daily',    icon: CalendarDays },
  { label: 'Monthly View',      path: '/admin/attendance/monthly',  icon: CalendarRange },
  { label: 'Working Days',      path: '/admin/attendance/settings', icon: Clock },

  { section: 'PAYROLL' },
  { label: 'Salary Structure',  path: '/admin/salary/structure',    icon: DollarSign },
  { label: 'Run Payroll',       path: '/admin/payroll/run',         icon: PlayCircle },
  { label: 'Payroll Summary',   path: '/admin/payroll/summary',     icon: FileText },

  { section: 'LEAVES' },
  { label: 'Leave Requests',    path: '/admin/leaves',              icon: Palmtree },
  { label: 'Leave Balance',     path: '/admin/leaves/balance',      icon: BarChart2 },
  { label: 'Leave Types',       path: '/admin/leaves/types',        icon: Receipt },

  { section: 'REPORTS' },
  { label: 'Payslips',          path: '/admin/payslip/bulk',        icon: FileText },
  { label: 'Monthly Report',    path: '/admin/reports/monthly',     icon: BarChart2 },
  { label: 'Employee Report',   path: '/admin/reports/employee',    icon: Users },
  { label: 'Dept Report',       path: '/admin/reports/department',  icon: Building2 },
];

const employeeLinks = [
  { section: 'MAIN' },
  { label: 'Dashboard',         path: '/employee/dashboard',        icon: LayoutDashboard },
  
  { section: 'MY PROFILE' },
  { label: 'My Profile',        path: '/employee/profile',          icon: Users },
  { label: 'My Attendance',     path: '/employee/attendance',       icon: CalendarDays },
  
  { section: 'LEAVES & PAYROLL' },
  { label: 'My Leaves',         path: '/employee/leaves',           icon: Palmtree },
  { label: 'My Payslips',       path: '/employee/payslips',         icon: Receipt },
];

const Sidebar = ({ role = 'admin', isCollapsed, onToggle, onClose }) => {
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : employeeLinks;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-[#001529] text-[#ffffffa6] font-sans transition-all duration-300">
      {/* Brand */}
      <div className={`h-[64px] flex items-center gap-3 px-6 shrink-0 bg-[#002140] ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 shrink-0 bg-[#1677FF] rounded flex items-center justify-center text-white font-bold text-base shadow-sm">
          P
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="text-white font-semibold text-lg leading-tight truncate tracking-tight">PayrollPro</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-4 pb-4 overflow-y-auto overflow-x-hidden">
        {links.map((item, index) => {
          if (item.section) {
            return !isCollapsed && (
              <p key={index} className="px-6 pt-5 pb-2 text-[11px] uppercase tracking-wider text-[#ffffff45] font-semibold">
                {item.section}
              </p>
            );
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                group relative flex items-center gap-3 mx-2 px-4 py-2.5 rounded transition-all duration-200 text-sm font-medium
                ${isActive
                  ? 'bg-[#1677FF] text-white'
                  : 'text-[#ffffffa6] hover:text-white hover:bg-[#ffffff14]'}
                ${isCollapsed ? 'justify-center mx-1 px-2' : ''}
              `}
            >
              <Icon size={18} strokeWidth={1.8} className="shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 invisible group-hover:visible opacity-0 group-hover:opacity-100 bg-[#002140] text-white text-sm font-medium px-3 py-1.5 rounded whitespace-nowrap z-50 transition-all shadow-dropdown border border-[#ffffff1a]">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="h-11 border-t border-[#ffffff15] flex items-center justify-center hover:bg-[#ffffff14] text-[#ffffffa6] hover:text-white transition-colors shrink-0"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Sign Out */}
      <div className="px-2 pb-4 shrink-0 mt-2">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded text-sm font-medium text-[#ffffffa6] hover:text-white hover:bg-[#ffffff14] transition-colors ${isCollapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut size={18} strokeWidth={1.8} className="shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
