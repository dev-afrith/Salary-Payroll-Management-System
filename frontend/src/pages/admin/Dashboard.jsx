import { useEffect, useState } from 'react';
import { Users, DollarSign, Clock, AlertTriangle, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import API from '../../utils/axios';
import { formatCurrency, formatINR } from '../../utils/formatCurrency';
import { getCurrentMonthYear, getShortMonthName, formatDate } from '../../utils/dateHelpers';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ employees: 0, payrollCost: 0, pendingLeaves: 0, draftPayrolls: 0 });
  const [trends, setTrends] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Dashboard | AstraX Technologies';
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    const { month, year } = getCurrentMonthYear();

    try {
      const [empRes, payrollRes, leavesRes, trendsRes, deptRes] = await Promise.allSettled([
        API.get('/employees?page=1&limit=1'),
        API.get(`/reports/monthly?month=${month}&year=${year}`),
        API.get('/leaves/applications'),
        API.get('/reports/trends'),
        API.get(`/reports/departments?month=${month}&year=${year}`),
      ]);

      const totalEmployees = empRes.status === 'fulfilled' ? (empRes.value.data?.total ?? 0) : 0;
      const payrollData = payrollRes.status === 'fulfilled' ? payrollRes.value.data : {};
      const payrollCost = Number(payrollData?.total_net ?? 0);
      const allLeaves = leavesRes.status === 'fulfilled' ? (Array.isArray(leavesRes.value.data) ? leavesRes.value.data : []) : [];
      const pendingLeaves = allLeaves.filter(l => l.status === 'Pending').length;
      const draftPayrolls = Number(payrollData?.employee_count ?? 0);

      setStats({ employees: totalEmployees, payrollCost, pendingLeaves, draftPayrolls });

      if (trendsRes.status === 'fulfilled') {
        const trendRows = Array.isArray(trendsRes.value.data) ? trendsRes.value.data : [];
        setTrends(trendRows.map(r => ({
          name: `${getShortMonthName(r.month)} ${r.year}`,
          net: Number(r.total_net ?? 0),
          gross: Number(r.total_gross ?? 0),
        })));
      }

      if (deptRes.status === 'fulfilled') {
        setDeptData(Array.isArray(deptRes.value.data) ? deptRes.value.data : []);
      }

      setRecentLeaves(allLeaves.filter(l => l.status === 'Pending').slice(0, 5));
    } catch (err) {
      setError('Failed to load dashboard data. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Employees', value: stats.employees, icon: Users, subtext: 'Active workforce', trend: '+1.2%' },
    { label: 'Monthly Payroll', value: formatINR(stats.payrollCost), icon: DollarSign, subtext: 'Disbursed YTD', trend: '+4.1%' },
    { label: 'Pending Leaves', value: stats.pendingLeaves, icon: Clock, subtext: 'Requires action', trend: null },
    { label: 'Processed Payouts', value: stats.draftPayrolls, icon: AlertTriangle, subtext: 'Current month batches', trend: null },
  ];

  if (loading) {
    return (
      <div className="page-enter flex flex-col space-y-6">
        <div className="h-8 w-48 bg-border rounded animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[120px] bg-white border border-border rounded-card animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-[360px] bg-white border border-border rounded-card animate-pulse"></div>
          <div className="lg:col-span-4 h-[360px] bg-white border border-border rounded-card animate-pulse"></div>
        </div>
        <div className="h-64 bg-white border border-border rounded-card animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-enter flex flex-col items-center justify-center py-24 bg-white border border-border rounded-card shadow-enterprise">
        <AlertTriangle className="text-text-muted mb-4" size={32} />
        <p className="text-base font-medium text-text-primary mb-1">System Error</p>
        <p className="text-sm text-text-secondary mb-6">{error}</p>
        <button onClick={fetchAll} className="px-4 py-2 bg-white border border-border rounded-btn text-sm font-medium hover:bg-surface transition-colors">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter flex flex-col space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Overview</h1>
        <p className="text-sm text-text-secondary mt-1">Real-time metrics and payroll distributions.</p>
      </div>

      {/* Row 1: Strict Uniform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-surface-card border border-border rounded-card p-5 shadow-enterprise flex flex-col justify-between h-[130px]">
              <div className="flex justify-between items-start">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{card.label}</p>
                <Icon size={16} className="text-text-muted" />
              </div>
              <div>
                <div className="flex items-baseline gap-3">
                  <p className="text-2xl font-bold text-text-primary tracking-tight">{card.value}</p>
                  {card.trend && <span className="text-xs font-medium text-status-success-text bg-status-success-bg px-1.5 py-0.5 rounded">{card.trend}</span>}
                </div>
                <p className="text-xs text-text-muted mt-1">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Charts (12-col layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payroll Trend (8 cols) */}
        <div className="col-span-1 lg:col-span-8 bg-surface-card border border-border rounded-card shadow-enterprise p-6 min-h-[360px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-semibold text-text-primary">Payroll Cost Trends</h2>
            <button className="text-text-muted hover:text-text-primary"><MoreHorizontal size={18} /></button>
          </div>
          <div className="flex-1">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                <LineChart data={trends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '6px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                    itemStyle={{ color: '#111827', fontWeight: 600 }}
                    formatter={(value) => formatINR(value)} 
                  />
                  <Line type="linear" dataKey="net" stroke="#1677FF" strokeWidth={2} dot={{ r: 3, fill: '#1677FF', strokeWidth: 0 }} activeDot={{ r: 5 }} name="Net Salary" />
                  <Line type="linear" dataKey="gross" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Gross Salary" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted">
                <TrendingUp size={24} className="mb-2" />
                <p className="text-sm">Insufficient data points</p>
              </div>
            )}
          </div>
        </div>

        {/* Department Headcount (4 cols) */}
        <div className="col-span-1 lg:col-span-4 bg-surface-card border border-border rounded-card shadow-enterprise p-6 min-h-[360px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-semibold text-text-primary">Headcount by Dept</h2>
            <button className="text-text-muted hover:text-text-primary"><MoreHorizontal size={18} /></button>
          </div>
          <div className="flex-1">
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                  />
                  <Bar dataKey="employee_count" fill="#1677FF" radius={[0, 2, 2, 0]} name="Employees" barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted">
                <Users size={24} className="mb-2" />
                <p className="text-sm">No department data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: High Density Table */}
      <div className="bg-surface-card border border-border rounded-card shadow-enterprise overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="text-base font-semibold text-text-primary">Recent Leave Applications</h2>
          <button className="text-sm font-medium text-primary hover:text-primary-hover">View Register</button>
        </div>
        {recentLeaves.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr>
                  <th className="w-1/4">Employee</th>
                  <th className="w-1/4">Leave Type</th>
                  <th className="w-1/6">Duration</th>
                  <th className="w-1/6">Days</th>
                  <th className="w-1/6">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.map((leave, i) => (
                  <tr key={leave.id || i} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="font-medium">{leave.full_name ?? '—'}</td>
                    <td>{leave.leave_name ?? '—'}</td>
                    <td className="text-text-secondary text-xs">{formatDate(leave.from_date)} - {formatDate(leave.to_date)}</td>
                    <td>{leave.total_days ?? '—'}</td>
                    <td>
                      {leave.status === 'Pending' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-status-warning-bg text-status-warning-text uppercase tracking-wide">
                          Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-text-secondary uppercase tracking-wide">
                          {leave.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
             <Clock size={24} className="mb-2" />
             <p className="text-sm">No pending requests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
