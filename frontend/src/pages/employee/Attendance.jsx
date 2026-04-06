import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, CheckCircle2, History } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { formatDate } from '../../utils/dateHelpers';

import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';

const EmployeeAttendance = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  
  const [history, setHistory] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Live clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/attendance/my?year=${year}&month=${month}`);
      setHistory(data);
      
      // Check if there's a record for today
      const todayLocal = new Date().toLocaleDateString('en-CA'); // Gets YYYY-MM-DD locally natively in most browsers, or just use YYYY-MM-DD via parts
      
      const localYear = new Date().getFullYear();
      const localMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const localDay = String(new Date().getDate()).padStart(2, '0');
      const localTodayStr = `${localYear}-${localMonth}-${localDay}`;

      const todayData = data.find(r => {
        const d = new Date(r.date);
        const rYear = d.getFullYear();
        const rMonth = String(d.getMonth() + 1).padStart(2, '0');
        const rDay = String(d.getDate()).padStart(2, '0');
        return `${rYear}-${rMonth}-${rDay}` === localTodayStr;
      });
      
      setTodayRecord(todayData || null);

    } catch (error) {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    document.title = 'My Attendance | AstraX Technologies';
  }, [month, year]);

  const handlePunch = async () => {
    setActionLoading(true);
    try {
      const { data } = await API.post('/attendance/mark');
      toast.success(data.message);
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to punch time');
    } finally {
      setActionLoading(false);
    }
  };

  const isCheckedIn = todayRecord && todayRecord.check_in && !todayRecord.check_out;
  const isCompleted = todayRecord && todayRecord.check_out;

  return (
    <div className="page-enter w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Attendance Log</h1>
        <p className="text-base text-slate-500 mt-1">Mark your daily attendance and view history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Action Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 border-8 border-blue-100">
              <Clock size={32} className="text-blue-600" />
            </div>

            <h2 className="text-4xl font-black text-slate-800 mb-2 font-mono tracking-tight">
              {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>

            {isCompleted ? (
              <div className="w-full p-4 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center">
                <CheckCircle2 className="text-green-500 mb-2" size={32} />
                <p className="font-bold text-green-800 text-sm">Shift Completed</p>
                <p className="text-xs text-green-600 mt-1 font-semibold">
                  In: {todayRecord.check_in} | Out: {todayRecord.check_out}
                </p>
                {todayRecord.overtime_hours > 0 && (
                  <p className="text-xs font-bold uppercase text-white bg-green-500 px-3 py-1 rounded-full mt-2">
                    +{todayRecord.overtime_hours} hrs OT
                  </p>
                )}
              </div>
            ) : (
              <Button 
                size="lg" 
                className={`w-full py-4 text-lg font-bold shadow-lg transition-transform hover:scale-105 ${isCheckedIn ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                icon={isCheckedIn ? LogOut : LogIn}
                onClick={handlePunch}
                loading={actionLoading}
              >
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </Button>
            )}

            {!isCompleted && todayRecord && (
              <p className="text-xs text-gray-500 mt-4 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Punched in at {todayRecord.check_in}
              </p>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History size={18} className="text-blue-600" />
                Monthly History
              </h3>
              <div className="flex items-center gap-3">
                <select 
                  className="text-sm border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  value={month} onChange={(e) => setMonth(Number(e.target.value))}
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
                <select 
                  className="text-sm border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  value={year} onChange={(e) => setYear(Number(e.target.value))}
                >
                  {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-slate-400">Loading records...</div>
            ) : (
              <Table headers={['Date', 'Status', 'Check In', 'Check Out', 'Overtime']}>
                {history.length > 0 ? history.map(record => (
                  <tr key={record.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 text-base">{formatDate(record.date)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs uppercase tracking-wider font-semibold rounded-full ${
                        record.status === 'Present' ? 'bg-green-50 text-green-700' :
                        record.status === 'Absent' ? 'bg-red-50 text-red-700' :
                        record.status === 'Half-day' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-base font-mono text-slate-600">{record.check_in || '—'}</td>
                    <td className="px-6 py-4 text-base font-mono text-slate-600">{record.check_out || '—'}</td>
                    <td className="px-6 py-4">
                      {record.overtime_hours > 0 ? (
                        <span className="text-sm font-bold text-orange-600">+{record.overtime_hours}h</span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      No attendance records found for this month.
                    </td>
                  </tr>
                )}
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
