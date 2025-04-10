import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/forms/LoginForm';

const Login = () => {
  const { isAuthenticated } = useAuth();

  // Nếu đã đăng nhập, chuyển hướng về trang chủ
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-secondary-500/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">NovelRead</h1>
          <p className="mt-2 text-sm text-gray-600">
            Đăng nhập để tiếp tục hành trình khám phá thế giới truyện chữ
          </p>
        </div>
        
        <LoginForm />
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <a href="/terms" className="text-primary-600 hover:text-primary-500">
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a href="/privacy" className="text-primary-600 hover:text-primary-500">
              Chính sách bảo mật
            </a>{' '}
            của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 