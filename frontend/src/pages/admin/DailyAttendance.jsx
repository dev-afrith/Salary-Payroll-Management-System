import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { formatDate } from '../../utils/dateHelpers';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';

const DailyAttendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state to track edits before saving
  const [edits, setEdits] = useState({});

  const fetchDailyAttendance = async (selectedDate) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/attendance/daily?date=${selectedDate}`);
      setAttendance(data);
      setEdits({}); // Reset edits on date change
    } catch (error) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyAttendance(date);
    document.title = 'Daily Attendance | AstraX Technologies';
  }, [date]);

  const handleStatusChange = (employeeId, newStatus) => {
    setEdits(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        status: newStatus
      }
    }));
  };

  const handleSaveAll = async () => {
    const changes = Object.keys(edits).filter(id => edits[id] !== undefined);
    if (changes.length === 0) return toast.info('No changes to save');

    setSaving(true);
    let successCount = 0;
    
    // We will save them sequentially for simplicity in this demo,
    // though Promise.all is better for production
    for (const empId of changes) {
      const empData = attendance.find(a => a.employee_id === Number(empId));
      const editData = edits[empId];
      
      const payload = {
        employee_id: empData.employee_id,
        date: date,
        status: editData.status || empData.status || 'Present',
        check_in: empData.check_in,
        check_out: empData.check_out,
        remarks: empData.remarks
      };

      try {
        const idParam = empData.attendance_id || 'new';
        await API.put(`/attendance/${idParam}`, payload);
        successCount++;
      } catch (e) {
        console.error(`Failed to save for ${empData.full_name}`);
      }
    }

    setSaving(false);
    if (successCount === changes.length) {
      toast.success('All changes saved successfully');
    } else {
      toast.error(`Saved ${successCount} out of ${changes.length} changes`);
    }
    
    fetchDailyAttendance(date);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-50 text-green-700 border-green-200';
      case 'Absent': return 'bg-red-50 text-red-700 border-red-200';
      case 'Half-day': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Holiday': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LOP': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'On-Leave': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200'; // Not marked
    }
  };

  return (
    <div className="page-enter w-full space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Daily Attendance</h1>
          <p className="text-base text-slate-500 mt-1">Mark or modify attendance for {formatDate(date)}</p>
        </div>
        <div className="flex items-center gap-4">
          <Input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
          <Button 
            icon={Save} 
            onClick={handleSaveAll} 
            loading={saving}
            disabled={Object.keys(edits).length === 0}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading attendance data...</div>
        ) : (
          <Table headers={['Employee', 'ID', 'Current Status', 'Mark Attendance', 'Time Log']}>
            {attendance.map((record) => {
              // use edit state if exists, else server state, else default 'Not Marked'
              const currentStatus = edits[record.employee_id]?.status || record.status;
              const hasUnsavedChanges = !!edits[record.employee_id];

              return (
                <tr key={record.employee_id} className={`hover:bg-blue-50/50 transition-colors border-b border-slate-50 last:border-0 ${hasUnsavedChanges ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-slate-900">{record.full_name}</span>
                      {hasUnsavedChanges && <span className="text-xs text-blue-600 font-bold mt-1">• Unsaved</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-base text-slate-500 font-mono">
                    {record.emp_code}
                  </td>
                  <td className="px-6 py-4">
                    {currentStatus ? (
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(currentStatus)}`}>
                        {currentStatus}
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-bold rounded-full border bg-gray-50 text-gray-400 border-gray-200 flex items-center gap-1 w-max">
                        <AlertCircle size={12} /> Not Marked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 w-64">
                    <select 
                      className={`w-full text-base font-medium border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all ${hasUnsavedChanges ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
                      value={currentStatus || ''}
                      onChange={(e) => handleStatusChange(record.employee_id, e.target.value)}
                    >
                      <option value="" disabled>Select Status</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Half-day">Half-day</option>
                      <option value="LOP">LOP (Loss of Pay)</option>
                      <option value="On-Leave">On-Leave</option>
                      <option value="Holiday">Holiday</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {record.check_in ? (
                      <div className="flex flex-col gap-1 text-xs font-mono text-gray-600">
                        <div className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> In: {record.check_in}</div>
                        {record.check_out ? (
                           <div className="flex items-center gap-1"><XCircle size={12} className="text-orange-500"/> Out: {record.check_out}</div>
                        ) : (
                           <span className="text-gray-400 ml-4">Waiting checkout</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> No punch record</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>
    </div>
  );
};

export default DailyAttendance;
