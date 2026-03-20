import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [typeId, setTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  // Derived State
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const { data } = await API.get('/leaves/types');
        setTypes(data);
        if (data.length > 0) setTypeId(data[0].id.toString());
      } catch (error) {
        toast.error('Failed to load leave types');
      }
    };
    fetchTypes();
    document.title = 'Apply Leave | PayrollPro';
  }, []);

  // Calculate days difference
  useEffect(() => {
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        setTotalDays(diffDays);
      } else {
        setTotalDays(0);
      }
    } else {
      setTotalDays(0);
    }
  }, [fromDate, toDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalDays <= 0) return toast.error('Check your date range');

    setSubmitting(true);
    try {
      await API.post('/leaves/apply', {
        leave_type_id: Number(typeId),
        from_date: fromDate,
        to_date: toDate,
        total_days: totalDays,
        reason
      });
      toast.success('Leave application submitted!');
      navigate('/employee/leaves');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter w-full space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/employee/leaves')} className="p-3 bg-white rounded-full text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Apply for Leave</h1>
          <p className="text-base text-slate-500 mt-1">Submit an application for processing by administration</p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select 
            label="Leave Type" 
            name="typeId" 
            value={typeId} 
            onChange={(e) => setTypeId(e.target.value)}
            options={types.map(t => ({ value: t.id, label: t.name }))} 
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="From Date" 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required 
              min={new Date().toISOString().split('T')[0]} // restrict past dates roughly
            />
            <Input 
              label="To Date" 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required 
              min={fromDate || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Calendar size={24} /></div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Calculated Duration</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">Total Days Requested</p>
              </div>
            </div>
            <div className="text-4xl font-black text-blue-600 tracking-tight">{totalDays}</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Reason (Optional but recommended)</label>
            <textarea
              className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base shadow-sm transition-colors resize-none"
              rows="4"
              placeholder="Please provide a brief reason for your leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
          </div>

          <div className="pt-6 flex items-center gap-4">
            <Button type="submit" className="w-full md:w-auto px-8 py-4 text-base font-semibold" icon={Send} loading={submitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
