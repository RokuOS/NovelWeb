import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
  Search as SearchIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      } else {
        setUsers([]);
        console.error('Unexpected API response format:', response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
      setLoading(false);
    }
  };

  const handleChangeRole = async (id, newRole) => {
    if (window.confirm(`Bạn có chắc chắn muốn thay đổi quyền của người dùng này thành ${newRole}?`)) {
      try {
        // Sử dụng endpoint cập nhật người dùng thông thường
        await api.put(`/users/${id}`, { role: newRole });
        
        // Cập nhật state local
        setUsers(users.map(user => 
          user._id === id ? { ...user, role: newRole } : user
        ));
        
        // Đóng dropdown
        setShowRoleDropdown(prev => ({
          ...prev,
          [id]: false
        }));
        
        toast.success('Cập nhật quyền thành công');
      } catch (error) {
        console.error('Error updating user role:', error);
        toast.error('Không thể cập nhật quyền người dùng');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(user => user._id !== id));
        toast.success('Xóa người dùng thành công');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Không thể xóa người dùng');
      }
    }
  };

  const toggleRoleDropdown = (id) => {
    setShowRoleDropdown(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Lọc người dùng theo tên đã tìm kiếm
  const filteredUsers = users.filter(user => 
    user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        
        {/* Thêm ô tìm kiếm */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">
            {searchTerm ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên người dùng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username || 'Không xác định'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative">
                      <button
                        onClick={() => toggleRoleDropdown(user._id)}
                        className="flex items-center px-3 py-1 text-sm font-medium rounded-full focus:outline-none"
                      >
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                        <ArrowDownIcon className="ml-1 h-4 w-4 text-gray-500" />
                      </button>
                      
                      {showRoleDropdown[user._id] && (
                        <div className="absolute z-10 mt-1 w-36 bg-white rounded-md shadow-lg">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              onClick={() => handleChangeRole(user._id, 'user')}
                              className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${user.role === 'user' ? 'bg-gray-100' : ''}`}
                            >
                              Người dùng
                            </button>
                            <button
                              onClick={() => handleChangeRole(user._id, 'admin')}
                              className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${user.role === 'admin' ? 'bg-gray-100' : ''}`}
                            >
                              Quản trị viên
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="flex items-center text-red-600 hover:text-red-900"
                        title="Xóa người dùng"
                      >
                        <DeleteIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Users; 