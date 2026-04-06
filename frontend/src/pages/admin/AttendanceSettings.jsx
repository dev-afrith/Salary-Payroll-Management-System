import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';

const AttendanceSettings = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [days, setDays] = useState(26);
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const { data } = await API.get('/attendance/settings/working-days');
      setHistory(data);
    } catch (error) {
       console.error("Failed to load settings history");
    }
  };

  useEffect(() => {
    fetchHistory();
    document.title = 'Attendance Settings | AstraX Technologies';
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/attendance/settings/working-days', {
        month: Number(month),
        year: Number(year),
        total_working_days: Number(days)
      });
      toast.success(`Working days for ${month}/${year} saved`);
      fetchHistory();
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter w-full space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Settings size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Attendance Settings</h1>
          <p className="text-base text-slate-500 mt-1">Configure global working days for payroll calculation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 mb-6 tracking-wide uppercase">Configure Month</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Month</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  value={month} onChange={(e) => setMonth(e.target.value)}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
                <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Total Working Days</label>
                <Input type="number" min="1" max="31" value={days} onChange={(e) => setDays(e.target.value)} required />
              </div>
              <Button type="submit" icon={Save} loading={loading} className="w-full mt-4 py-3 text-sm font-semibold">Save Configuration</Button>
            </form>
          </div>
        </div>

        {/* History */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-bold text-gray-900">Configuration History</h2>
            </div>
            <Table headers={['Month / Year', 'Configured Days']}>
              {history.map(item => (
                <tr key={`${item.year}-${item.month}`} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {new Date(0, item.month-1).toLocaleString('en', { month: 'long' })} {item.year}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-50 text-green-700 font-bold rounded-full text-sm border border-green-200">
                      {item.total_working_days} Days
                    </span>
                  </td>
                </tr>
              ))}
            </Table>
            {history.length === 0 && (
              <div className="p-8 text-center text-gray-400">No configurations saved yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSettings;
