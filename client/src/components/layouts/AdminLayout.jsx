import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Dashboard as DashboardIcon,
  MenuBook as StoriesIcon,
  People as UsersIcon,
  Category as CategoriesIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navItems = [
    { path: '/admin', icon: <DashboardIcon />, text: 'Dashboard' },
    { path: '/admin/stories', icon: <StoriesIcon />, text: 'Truyện' },
    { path: '/admin/users', icon: <UsersIcon />, text: 'Người dùng' },
    { path: '/admin/categories', icon: <CategoriesIcon />, text: 'Thể loại' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transition duration-300 transform md:translate-x-0 md:static md:inset-auto md:h-screen`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">NovelRead Admin</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md md:hidden hover:bg-gray-800"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold">{user?.username?.charAt(0) || 'A'}</span>
            </div>
            <div>
              <div className="font-bold">{user?.username || 'Admin'}</div>
              <div className="text-xs text-gray-400">{user?.email || 'admin@example.com'}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 p-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                  end={item.path === '/admin'}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </NavLink>
              </li>
            ))}
            <li className="pt-4 mt-4 border-t border-gray-800">
              <NavLink
                to="/"
                className="flex items-center space-x-2 p-2 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <HomeIcon />
                <span>Quay lại trang chủ</span>
              </NavLink>
            </li>
            <li>
              <button
                onClick={logout}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-300 hover:bg-gray-800 transition-colors w-full"
              >
                <LogoutIcon />
                <span>Đăng xuất</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md md:hidden hover:bg-gray-100"
            >
              <MenuIcon />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Dashboard Admin</h1>
            <div></div> {/* Spacer for centering */}
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 