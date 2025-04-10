import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Email } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 pt-10 pb-6">
        <div className="flex flex-wrap">
          {/* Logo and About */}
          <div className="w-full md:w-1/4 text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-2xl font-bold mb-4">NovelRead</h2>
            <p className="mb-4 text-gray-400">
              Nền tảng đọc truyện trực tuyến hàng đầu, cung cấp kho truyện phong phú với nhiều thể loại đa dạng.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram />
              </a>
              <a href="mailto:contact@novelread.com" className="text-gray-400 hover:text-white transition-colors">
                <Email />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="w-full md:w-1/4 text-center md:text-left mb-8 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">Điều hướng</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/truyen-moi" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Truyện mới
                </Link>
              </li>
              <li>
                <Link to="/truyen-hot" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Truyện hot
                </Link>
              </li>
              <li>
                <Link to="/the-loai" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Thể loại
                </Link>
              </li>
              <li>
                <Link to="/hoan-thanh" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Hoàn thành
                </Link>
              </li>
            </ul>
          </div>

          {/* Thể loại */}
          <div className="w-full md:w-1/4 text-center md:text-left mb-8 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">Thể loại</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/the-loai/tien-hiep" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Tiên Hiệp
                </Link>
              </li>
              <li>
                <Link to="/the-loai/kiem-hiep" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Kiếm Hiệp
                </Link>
              </li>
              <li>
                <Link to="/the-loai/ngon-tinh" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Ngôn Tình
                </Link>
              </li>
              <li>
                <Link to="/the-loai/do-thi" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Đô Thị
                </Link>
              </li>
              <li>
                <Link to="/the-loai/xuyen-khong" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Xuyên Không
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div className="w-full md:w-1/4 text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-primary-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/dmca" className="text-gray-400 hover:text-primary-500 transition-colors">
                  DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            &copy; {currentYear} NovelRead. Tất cả các quyền được bảo lưu.
          </p>
          <div className="text-sm text-gray-400">
            Thiết kế và phát triển bởi{' '}
            <a
              href="#"
              className="text-primary-500 hover:text-primary-400 transition-colors"
            >
              NovelRead Team
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 