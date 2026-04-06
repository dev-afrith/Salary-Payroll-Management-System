import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, CalendarDays, Palmtree, BarChart3, AlertTriangle } from 'lucide-react';
import { getGreeting, getTodayFormatted, getCurrentMonthYear } from '../../utils/dateHelpers';
import { formatINR } from '../../utils/formatCurrency';
import API from '../../utils/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [netSalary, setNetSalary] = useState(null);
  const [attendancePct, setAttendancePct] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState(0);

  useEffect(() => {
    document.title = 'My Dashboard | AstraX Technologies';
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { month, year } = getCurrentMonthYear();

    try {
      const [balanceRes, payrollRes, attendanceRes, myLeavesRes] = await Promise.allSettled([
        API.get(`/leaves/balance/my?year=${year}`),
        API.get(`/payroll/my?month=${month}&year=${year}`),
        API.get(`/attendance/my?month=${month}&year=${year}`),
        API.get('/leaves/my-applications'),
      ]);

      // Leave balance
      if (balanceRes.status === 'fulfilled') {
        setLeaveBalance(Array.isArray(balanceRes.value.data) ? balanceRes.value.data : []);
      }

      // Net salary
      if (payrollRes.status === 'fulfilled') {
        const pData = payrollRes.value.data;
        if (Array.isArray(pData) && pData.length > 0) {
          setNetSalary(pData[0]?.net_salary ?? null);
        } else if (pData?.net_salary) {
          setNetSalary(pData.net_salary);
        }
      }

      // Attendance %
      if (attendanceRes.status === 'fulfilled') {
        const aData = attendanceRes.value.data;
        if (Array.isArray(aData)) {
          const present = aData.filter(a => a.status === 'Present' || a.status === 'Half-day').length;
          const total = aData.length;
          setAttendancePct(total > 0 ? Math.round((present / total) * 100) : null);
        }
      }

      // Pending leaves
      if (myLeavesRes.status === 'fulfilled') {
        const leaves = Array.isArray(myLeavesRes.value.data) ? myLeavesRes.value.data : [];
        setPendingLeaves(leaves.filter(l => l.status === 'Pending').length);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const totalBalance = leaveBalance.reduce((sum, l) => sum + Number(l.remaining || 0), 0);

  const cards = [
    { label: 'Net Salary', value: netSalary !== null ? formatINR(netSalary) : '—', icon: DollarSign, lightBg: 'bg-emerald-50', textColor: 'text-emerald-600', color: 'bg-emerald-500' },
    { label: 'Attendance', value: attendancePct !== null ? `${attendancePct}%` : '—', icon: CalendarDays, lightBg: 'bg-blue-50', textColor: 'text-blue-600', color: 'bg-blue-500' },
    { label: 'Pending Leaves', value: String(pendingLeaves), icon: Palmtree, lightBg: 'bg-amber-50', textColor: 'text-amber-600', color: 'bg-amber-500' },
    { label: 'Leave Balance', value: String(totalBalance), icon: BarChart3, lightBg: 'bg-violet-50', textColor: 'text-violet-600', color: 'bg-violet-500' },
  ];

  if (loading) {
    return (
      <div className="page-enter space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse"></div>)}
        </div>
        <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <section className="page-enter w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.employee?.full_name || user?.full_name || 'Employee'} 👋
          </h1>
          <p className="text-base text-slate-500 mt-1">
            {user?.employee?.employee_id || user?.employee_id} • {getTodayFormatted()}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="group relative bg-white rounded-2xl p-7 border border-slate-100 shadow-sm overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-50 hover:border-blue-100 min-h-[140px]">
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${stat.color}`}></div>
              <div className="relative">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.lightBg} ${stat.textColor} mb-3`}>
                  <Icon size={28} />
                </div>
                <p className="text-4xl font-bold text-slate-900 mt-4 mb-1 tracking-tight">{stat.value}</p>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave Balance Overview */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 w-full">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Leave Balance Overview</h2>
        {leaveBalance.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {leaveBalance.map((leave) => (
              <div key={leave.leave_type_id || leave.leave_name} 
                className="relative overflow-hidden bg-white/40 backdrop-blur-md rounded-2xl p-7 text-center border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[140px] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: leave.color || '#3B82F6' }}></div>
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl" style={{ backgroundColor: leave.color || '#3B82F6' }}></div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-1 relative z-10">{leave.leave_name}</p>
                <p className="text-5xl font-black tracking-tight text-slate-900 mt-4 mb-2 relative z-10">{leave.remaining ?? 0}</p>
                <p className="text-sm font-medium text-slate-500 relative z-10">of {leave.allocated ?? 0} days</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <BarChart3 className="text-slate-300" size={28} />
            </div>
            <p className="text-base font-semibold text-slate-700 mb-2">No Leave Data</p>
            <p className="text-sm text-slate-400 text-center max-w-xs">Your leave balance will appear here once configured by HR.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
