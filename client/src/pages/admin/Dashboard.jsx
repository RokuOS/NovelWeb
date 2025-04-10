import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
  Book as BookIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStories: 0,
    totalUsers: 0,
    totalChapters: 0,
    totalViews: 0
  });
  
  const [recentStories, setRecentStories] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Lấy thống kê tổng quan
        const statsResponse = await api.get('/admin/stats');
        if (statsResponse.data && statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }
        
        // Lấy danh sách truyện gần đây
        const storiesResponse = await api.get('/admin/stories/recent');
        if (storiesResponse.data && storiesResponse.data.success) {
          setRecentStories(storiesResponse.data.data);
        }
        
        // Lấy danh sách người dùng gần đây
        const usersResponse = await api.get('/admin/users/recent');
        if (usersResponse.data && usersResponse.data.success) {
          setRecentUsers(usersResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tổng quan</h1>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-full">
              <BookIcon className="text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Tổng số truyện</h3>
              <p className="text-2xl font-semibold">{stats.totalStories}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <PeopleIcon className="text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Tổng số người dùng</h3>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <ArticleIcon className="text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Tổng số chương</h3>
              <p className="text-2xl font-semibold">{stats.totalChapters}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <ViewIcon className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Tổng lượt xem</h3>
              <p className="text-2xl font-semibold">{stats.totalViews}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Truyện gần đây */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Truyện gần đây</h2>
            <Link to="/admin/stories" className="text-primary-600 hover:text-primary-700">
              Xem tất cả
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentStories.map(story => (
              <div key={story._id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">{story.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(story.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link to={`/admin/stories/${story._id}/edit`} className="text-blue-600 hover:text-blue-700">
                    <EditIcon fontSize="small" />
                  </Link>
                  <Link to={`/admin/stories/${story._id}/chapters`} className="text-green-600 hover:text-green-700">
                    <ArticleIcon fontSize="small" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Người dùng gần đây */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Người dùng gần đây</h2>
            <Link to="/admin/users" className="text-primary-600 hover:text-primary-700">
              Xem tất cả
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentUsers.map(user => (
              <div key={user._id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">{user.username}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex space-x-2">
                  <Link to={`/admin/users/${user._id}/edit`} className="text-blue-600 hover:text-blue-700">
                    <EditIcon fontSize="small" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Các nút tác vụ nhanh */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/stories/create"
          className="flex items-center justify-center p-4 bg-white rounded-lg shadow-md hover:bg-gray-50"
        >
          <AddIcon className="mr-2" />
          <span>Thêm truyện mới</span>
        </Link>
        
        <Link
          to="/admin/categories"
          className="flex items-center justify-center p-4 bg-white rounded-lg shadow-md hover:bg-gray-50"
        >
          <AddIcon className="mr-2" />
          <span>Quản lý thể loại</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard; 