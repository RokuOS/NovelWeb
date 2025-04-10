import { Link } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500/5 to-secondary-500/5 py-12 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md">
        <h1 className="text-9xl font-extrabold text-primary-600">404</h1>
        
        <h2 className="mt-4 text-3xl font-bold text-gray-900">
          Không tìm thấy trang
        </h2>
        
        <p className="mt-4 text-lg text-gray-600">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Quay về trang chủ
          </Link>
        </div>
        
        <div className="mt-12">
          <p className="text-base text-gray-500">
            Hoặc bạn có thể tìm kiếm truyện yêu thích:
          </p>
          
          <div className="mt-4 flex justify-center space-x-4">
            <Link
              to="/truyen-moi"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Truyện mới
            </Link>
            <Link
              to="/truyen-hot"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Truyện hot
            </Link>
            <Link
              to="/the-loai"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Thể loại
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 