import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    if (error.response) {
      // Xử lý các loại lỗi phản hồi từ server
      const { status, data } = error.response;
      
      // Handle unauthorized error (401)
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Nếu token hết hạn, xóa khỏi localStorage
        if (localStorage.getItem('token')) {
          localStorage.removeItem('token');
          window.location.href = '/login'; // Chuyển hướng về trang đăng nhập
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      } 
      // Xử lý lỗi mã 400 (Bad Request)
      else if (status === 400) {
        console.error('Lỗi dữ liệu không hợp lệ:', data?.message || 'Dữ liệu không hợp lệ');
        if (data?.detail) {
          console.error('Chi tiết lỗi:', data.detail);
        }
      }
      // Xử lý lỗi mã 404 (Not Found)
      else if (status === 404) {
        console.error('Lỗi không tìm thấy:', data?.message || 'Không tìm thấy tài nguyên');
      }
      // Xử lý lỗi mã 500 (Server Error)
      else if (status >= 500) {
        console.error('Lỗi máy chủ:', data?.message || 'Lỗi máy chủ nội bộ');
        toast.error('Máy chủ gặp sự cố. Vui lòng thử lại sau.');
      }
    } else if (error.request) {
      // Lỗi xảy ra khi không nhận được phản hồi từ server
      console.error('Không thể kết nối đến máy chủ:', error.request);
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
    } else {
      // Lỗi cấu hình request
      console.error('Lỗi cấu hình request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 