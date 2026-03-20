import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EmployeeLayout from '../components/layout/EmployeeLayout';

const Dashboard = lazy(() => import('../pages/employee/Dashboard'));
const Profile = lazy(() => import('../pages/employee/Profile'));
const Attendance = lazy(() => import('../pages/employee/Attendance'));
const Salary = lazy(() => import('../pages/employee/Salary'));
const Leaves = lazy(() => import('../pages/employee/Leaves'));
const ApplyLeave = lazy(() => import('../pages/employee/ApplyLeave'));
const EmployeePayslips = lazy(() => import('../pages/employee/Payslips'));

const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
      <span className="text-2xl animate-bounce">🚧</span>
    </div>
    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500 max-w-sm">This feature is coming soon to your portal.</p>
  </div>
);

const PageLoader = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 text-sm font-medium">Loading your profile...</p>
    </div>
  </div>
);

const EmployeeRoutes = () => (
  <Routes>
    <Route element={<EmployeeLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
      
      {/* Profile — Module 2 ✅ */}
      <Route path="profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />

      {/* Attendance — Module 3 ✅ */}
      <Route path="attendance" element={<Suspense fallback={<PageLoader />}><Attendance /></Suspense>} />

      {/* Leaves — Module 5 ✅ */}
      <Route path="leaves" element={<Suspense fallback={<PageLoader />}><Leaves /></Suspense>} />
      <Route path="leaves/apply" element={<Suspense fallback={<PageLoader />}><ApplyLeave /></Suspense>} />

      {/* Salary — Module 4 ✅ */}
      <Route path="salary" element={<Suspense fallback={<PageLoader />}><Salary /></Suspense>} />
      <Route path="payslips" element={<Suspense fallback={<PageLoader />}><EmployeePayslips /></Suspense>} />

      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>
  </Routes>
);

export default EmployeeRoutes;
