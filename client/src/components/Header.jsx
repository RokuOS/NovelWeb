import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Bookmark as BookmarkIcon,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { path: '/new', text: 'Truyện mới' },
    { path: '/trending', text: 'Truyện hot' },
    { path: '/categories', text: 'Thể loại' },
    { path: '/completed', text: 'Hoàn thành' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 ${
        isScrolled
          ? 'bg-white shadow-md text-gray-800'
          : 'bg-blue-900 text-white'
      } transition-all duration-300`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className={`text-2xl font-bold ${isScrolled ? 'text-primary-600' : 'text-white'}`}>
              NovelRead
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `font-medium hover:text-primary-500 transition ${
                    isActive ? 'text-primary-500' : isScrolled ? 'text-gray-700' : 'text-white'
                  }`
                }
              >
                {item.text}
              </NavLink>
            ))}
          </nav>

          {/* Search and User Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm truyện..."
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full w-48 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <SearchIcon fontSize="small" />
              </button>
            </form>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-white font-bold">{user?.username?.charAt(0) || 'U'}</span>
                  </div>
                  <span className={isScrolled ? 'text-gray-800' : 'text-white'}>
                    {user?.username || 'Người dùng'}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-2">
                      <PersonIcon fontSize="small" />
                      <span>Trang cá nhân</span>
                    </div>
                  </Link>
                  <Link
                    to="/bookmarks"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-2">
                      <BookmarkIcon fontSize="small" />
                      <span>Truyện theo dõi</span>
                    </div>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-2">
                        <AdminIcon fontSize="small" />
                        <span>Quản trị</span>
                      </div>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-md ${
                    isScrolled
                      ? 'text-primary-600 hover:bg-gray-100'
                      : 'text-white hover:bg-white/10'
                  } transition`}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-2xl focus:outline-none"
          >
            {isMenuOpen ? (
              <CloseIcon className={isScrolled ? 'text-gray-800' : 'text-white'} />
            ) : (
              <MenuIcon className={isScrolled ? 'text-gray-800' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50" onClick={toggleMenu}>
          <div
            className="absolute top-0 right-0 w-4/5 max-w-sm h-screen bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-white font-bold">{user?.username?.charAt(0) || 'U'}</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{user?.username || 'Người dùng'}</div>
                    <div className="text-sm text-gray-500">{user?.email || 'email@example.com'}</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="w-full px-4 py-2 text-center text-gray-800 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="w-full px-4 py-2 text-center bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-b">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm truyện..."
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <SearchIcon fontSize="small" />
                </button>
              </form>
            </div>

            <nav className="px-6 py-4">
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `block font-medium text-lg ${
                          isActive ? 'text-primary-600' : 'text-gray-800'
                        }`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.text}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {isAuthenticated && (
              <div className="px-6 py-4 border-t">
                <ul className="space-y-4">
                  <li>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 text-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <PersonIcon fontSize="small" />
                      <span>Trang cá nhân</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/bookmarks"
                      className="flex items-center space-x-2 text-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookmarkIcon fontSize="small" />
                      <span>Truyện theo dõi</span>
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 text-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <AdminIcon fontSize="small" />
                        <span>Trang quản trị</span>
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-red-600"
                    >
                      <span>Đăng xuất</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 