import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          console.error('Error loading user:', err);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token: newToken } = res.data;
      
      // Set token in localStorage and state
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Load user data
      const userRes = await api.get('/auth/me');
      setUser(userRes.data.data);
      
      toast.success('Đăng ký thành công!');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng ký thất bại';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      console.log('Đang gửi yêu cầu đăng nhập đến:', api.defaults.baseURL + '/auth/login');
      console.log('Dữ liệu gửi đi:', { email, password });
      
      const res = await api.post('/auth/login', { email, password });
      
      console.log('Phản hồi nhận được:', res.data);
      
      const { token: newToken, user: userData } = res.data;
      
      // Set token in localStorage and state
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      toast.success('Đăng nhập thành công!');
      return { success: true };
    } catch (err) {
      console.error('Chi tiết lỗi đăng nhập:', err);
      
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
      } else if (err.request) {
        console.error('Không nhận được phản hồi. Yêu cầu:', err.request);
      } else {
        console.error('Lỗi:', err.message);
      }
      
      const message = err.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Error during logout:', err);
    }
    
    // Clear token and user data
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    
    toast.success('Đăng xuất thành công');
    navigate('/');
  };

  // Update user password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.put('/auth/updatepassword', { 
        currentPassword, 
        newPassword 
      });
      
      // Update token
      const { token: newToken } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      toast.success('Cập nhật mật khẩu thành công!');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Cập nhật mật khẩu thất bại';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check if user is an admin
  const isAdmin = user && user.role === 'admin';

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 