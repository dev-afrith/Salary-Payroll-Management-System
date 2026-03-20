import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage so layouts pass auth checks after redirect
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('payroll_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('payroll_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('payroll_user', JSON.stringify(res.data.user));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (type, credentials) => {
    const endpoint = type === 'admin' ? '/auth/admin-login' : '/auth/employee-login';
    const res = await API.post(endpoint, credentials);
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem('payroll_token', newToken);
    localStorage.setItem('payroll_user', JSON.stringify(userData));
    localStorage.setItem('payroll_role', userData.role);
    setToken(newToken);
    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem('payroll_token');
    localStorage.removeItem('payroll_user');
    localStorage.removeItem('payroll_role');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee',
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
