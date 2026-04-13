import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import toast from 'react-hot-toast';
import { Building2, Eye, EyeOff, LogIn, Loader2, ShieldCheck, UserCircle, CheckCircle2, AlertCircle, KeyRound, ArrowLeft, Phone } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('admin');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password State
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmpId, setForgotEmpId] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Dialog State
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  // Real-time Stats State
  const [stats, setStats] = useState({ employees: '...', payslips: '...' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/public/stats');
        setStats({ 
          employees: data.employees !== undefined ? data.employees : '500+', 
          payslips: data.payslips !== undefined ? data.payslips : '2,000+' 
        });
      } catch (err) {
        setStats({ employees: '500+', payslips: '2,000+' });
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;

      if (activeTab === 'admin') {
        response = await axios.post('/auth/admin-login', {
          email,
          password
        });
      } else {
        response = await axios.post('/auth/employee-login', {
          employee_id: employeeId,
          password
        });
      }

      const data = response.data;
      const token = data.token || data.data?.token;
      const role  = data.role  || data.user?.role  || data.data?.role;
      const user  = data.user  || data.data?.user  || {};

      if (!token) {
        setDialog({ isOpen: true, type: 'error', title: 'Login Failed', message: 'No secure token received from server.' });
        return;
      }

      localStorage.setItem('payroll_token', token);
      localStorage.setItem('payroll_role', role);
      localStorage.setItem('payroll_user', JSON.stringify(user));

      setDialog({ isOpen: true, type: 'success', title: 'Login Successful', message: 'Credentials verified. Redirecting to your secure dashboard...' });

      // Delay to show the beautiful success dialog
      setTimeout(() => {
        window.location.href = role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
      }, 1500);

    } catch (err) {
      let message;
      if (!err.response) {
        message = 'Unable to connect to the server. Please check your internet connection or try again later.';
      } else {
        message = err.response?.data?.message ||
                  err.response?.data?.error ||
                  'Invalid credentials. Please verify your details and try again.';
      }

      setError(message);
      setDialog({ isOpen: true, type: 'error', title: 'Authentication Failed', message });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/auth/forgot-password', {
        employee_id: forgotEmpId,
        phone: forgotPhone
      });
      setDialog({ isOpen: true, type: 'success', title: 'Request Submitted', message: data.message });
      // Go back to login after a delay
      setTimeout(() => {
        setForgotMode(false);
        setDialog({ isOpen: false, type: 'info', title: '', message: '' });
      }, 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit request. Please try again.';
      setError(message);
      setDialog({ isOpen: true, type: 'error', title: 'Request Failed', message });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AstraX Technologies</h1>
              <p className="text-blue-200 text-sm">Salary Management System</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Streamline Your<br />
            <span className="text-blue-200">Payroll Management</span>
          </h2>
          <p className="text-blue-100/80 text-lg leading-relaxed max-w-md">
            Complete payroll solution with attendance tracking, leave management,
            salary calculations, and payslip generation — fully compliant with Indian tax regulations.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-sm">
            {[
              { label: 'Employees', value: stats.employees },
              { label: 'Payslips/mo', value: stats.payslips },
              { label: 'Compliance', value: '100%' },
              { label: 'Uptime', value: '99.9%' }
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AstraX Technologies</h1>
              <p className="text-gray-500 text-xs">Salary Management System</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
            <p className="text-gray-500 mb-6">Sign in to access your dashboard</p>

            {/* Tab Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab('admin'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('employee'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'employee'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserCircle className="w-4 h-4" />
                Employee Login
              </button>
            </div>

            {/* Form */}
            {forgotMode ? (
              /* ── Forgot Password Form ── */
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => { setForgotMode(false); setError(''); }} className="text-gray-400 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Forgot Password</h3>
                    <p className="text-xs text-gray-500">Enter your details to request a password reset</p>
                  </div>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee ID</label>
                    <input
                      type="text"
                      value={forgotEmpId}
                      onChange={(e) => setForgotEmpId(e.target.value)}
                      placeholder="EMP001"
                      required
                      className="border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Registered Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value)}
                        placeholder="Enter your mobile number"
                        required
                        className="border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><KeyRound className="w-4 h-4" /> Submit Reset Request</>
                    )}
                  </button>
                </form>

                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-xs text-blue-700">Your request will be sent to the administrator. Once approved, you will receive a new password from admin.</p>
                </div>
              </>
            ) : (
              /* ── Normal Login Form ── */
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {activeTab === 'admin' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@astrax.com"
                        required
                        className="border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee ID</label>
                      <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="EMP001"
                        required
                        className="border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="border border-gray-200 rounded-lg px-3 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full text-gray-900 placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                    ) : (
                      <><LogIn className="w-4 h-4" /> Sign In</>
                    )}
                  </button>
                </form>

                {activeTab === 'employee' && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => { setForgotMode(true); setError(''); }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                {forgotMode
                  ? 'Remember your password? Click the back arrow above.'
                  : activeTab === 'admin'
                  ? 'Admin access only. Contact system administrator for access.'
                  : 'Use your Employee ID provided by HR to login.'}
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} AstraX Technologies. All rights reserved.
          </p>
        </div>
      </div>

      <Modal 
        isOpen={dialog.isOpen} 
        onClose={() => dialog.type !== 'success' && setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        size="sm"
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${dialog.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            {dialog.type === 'success' ? (
              <CheckCircle2 size={32} className="text-green-600" />
            ) : (
              <AlertCircle size={32} className="text-red-600" />
            )}
          </div>
          <p className="text-base text-gray-700 font-medium">{dialog.message}</p>
          
          {dialog.type === 'success' && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-blue-600 animate-pulse">
              <Loader2 size={16} className="animate-spin" /> Redirecting...
            </div>
          )}
        </div>
        
        {dialog.type !== 'success' && (
           <div className="mt-8 flex justify-center w-full">
             <Button onClick={() => setDialog({ ...dialog, isOpen: false })} className="w-full">
               Try Again
             </Button>
           </div>
        )}
      </Modal>

    </div>
  );
};

export default Login;
