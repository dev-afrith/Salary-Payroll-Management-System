import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';

// Lazy-loaded admin pages
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Employees = lazy(() => import('../pages/admin/Employees'));
const AddEmployee = lazy(() => import('../pages/admin/AddEmployee'));
const EmployeeProfile = lazy(() => import('../pages/admin/EmployeeProfile'));
const Departments = lazy(() => import('../pages/admin/Departments'));

// Module 3
const DailyAttendance = lazy(() => import('../pages/admin/DailyAttendance'));
const MonthlyAttendance = lazy(() => import('../pages/admin/MonthlyAttendance'));
const AttendanceSettings = lazy(() => import('../pages/admin/AttendanceSettings'));

// Module 4
const SalaryStructure = lazy(() => import('../pages/admin/SalaryStructure'));
const RunPayroll = lazy(() => import('../pages/admin/RunPayroll'));
const PayrollSummary = lazy(() => import('../pages/admin/PayrollSummary'));

// Module 5
const LeaveRequests = lazy(() => import('../pages/admin/LeaveRequests'));
const LeaveBalances = lazy(() => import('../pages/admin/LeaveBalances'));
const LeaveTypes = lazy(() => import('../pages/admin/LeaveTypes'));

// Module 6
const BulkPayslips = lazy(() => import('../pages/admin/BulkPayslips'));
const MonthlyReport = lazy(() => import('../pages/admin/MonthlyReport'));
const EmployeeReportList = lazy(() => import('../pages/admin/EmployeeReportList'));
const EmployeeReport = lazy(() => import('../pages/admin/EmployeeReport'));
const DepartmentReport = lazy(() => import('../pages/admin/DepartmentReport'));

// Placeholder component for pages not yet built
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
      <span className="text-2xl animate-bounce">🚧</span>
    </div>
    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500 max-w-sm">This module is under development and will be available in the next phase of the project.</p>
  </div>
);

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 text-sm font-medium">Preparing your workspace...</p>
    </div>
  </div>
);

const AdminRoutes = () => (
  <Routes>
    <Route element={<AdminLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
      
      {/* Employee Management — Module 2 ✅ */}
      <Route path="employees" element={<Suspense fallback={<PageLoader />}><Employees /></Suspense>} />
      <Route path="employees/add" element={<Suspense fallback={<PageLoader />}><AddEmployee /></Suspense>} />
      <Route path="employees/:id" element={<Suspense fallback={<PageLoader />}><EmployeeProfile /></Suspense>} />
      <Route path="employees/:id/edit" element={<Suspense fallback={<PageLoader />}><ComingSoon title="Edit Employee Profile" /></Suspense>} />
      <Route path="departments" element={<Suspense fallback={<PageLoader />}><Departments /></Suspense>} />

      {/* Attendance — Module 3 ✅ */}
      <Route path="attendance/daily" element={<Suspense fallback={<PageLoader />}><DailyAttendance /></Suspense>} />
      <Route path="attendance/monthly" element={<Suspense fallback={<PageLoader />}><MonthlyAttendance /></Suspense>} />
      <Route path="attendance/settings" element={<Suspense fallback={<PageLoader />}><AttendanceSettings /></Suspense>} />

      {/* Payroll — Module 4 ✅ */}
      <Route path="salary/structure" element={<Suspense fallback={<PageLoader />}><SalaryStructure /></Suspense>} />
      <Route path="payroll/run" element={<Suspense fallback={<PageLoader />}><RunPayroll /></Suspense>} />
      <Route path="payroll/summary" element={<Suspense fallback={<PageLoader />}><PayrollSummary /></Suspense>} />

      {/* Leaves — Module 5 ✅ */}
      <Route path="leaves" element={<Suspense fallback={<PageLoader />}><LeaveRequests /></Suspense>} />
      <Route path="leaves/balance" element={<Suspense fallback={<PageLoader />}><LeaveBalances /></Suspense>} />
      <Route path="leaves/types" element={<Suspense fallback={<PageLoader />}><LeaveTypes /></Suspense>} />

      {/* Reports — Module 6 ✅ */}
      <Route path="payslip/bulk" element={<Suspense fallback={<PageLoader />}><BulkPayslips /></Suspense>} />
      <Route path="reports/monthly" element={<Suspense fallback={<PageLoader />}><MonthlyReport /></Suspense>} />
      <Route path="reports/employee/:id" element={<Suspense fallback={<PageLoader />}><EmployeeReport /></Suspense>} />
      <Route path="reports/employee" element={<Suspense fallback={<PageLoader />}><EmployeeReportList /></Suspense>} />
      <Route path="reports/department" element={<Suspense fallback={<PageLoader />}><DepartmentReport /></Suspense>} />
      <Route path="payslip" element={<ComingSoon title="Employee Payslip View" />} />

      {/* Settings */}
      <Route path="settings" element={<ComingSoon title="Company Core Settings" />} />

      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>
  </Routes>
);

export default AdminRoutes;
