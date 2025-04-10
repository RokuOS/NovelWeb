import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import api from '../../utils/api';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

// Component Portal cho Dropdown Menu
const DropdownPortal = ({ children, isOpen }) => {
  return isOpen ? createPortal(children, document.body) : null;
};

function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();
  const dropdownRefs = useRef({});
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    fetchStories();

    // Event listener để đóng dropdown khi click ra ngoài
    const handleClickOutside = (event) => {
      if (activeMenu && !event.target.closest('.dropdown-action-button') && !event.target.closest('.dropdown-menu')) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stories');
      if (response.data && response.data.data) {
        setStories(response.data.data);
      } else {
        setStories([]);
        console.error('Unexpected API response format:', response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error('Không thể tải danh sách truyện');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa truyện này? Tất cả các chương của truyện cũng sẽ bị xóa!')) {
      try {
        await api.delete(`/stories/${id}`);
        setStories(stories.filter(story => story._id !== id));
        toast.success('Xóa truyện thành công');
      } catch (error) {
        console.error('Error deleting story:', error);
        toast.error('Không thể xóa truyện');
      }
    }
  };

  const toggleActionsMenu = (id, e) => {
    if (activeMenu === id) {
      setActiveMenu(null);
      return;
    }
    
    // Tính toán vị trí cho dropdown menu
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        right: window.innerWidth - rect.right - window.scrollX
      });
    }
    
    setActiveMenu(id);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'ongoing':
        return 'Đang tiến hành';
      case 'dropped':
        return 'Đã bỏ dở';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý truyện</h1>
        <Link
          to="/stories/create"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
        >
          <AddIcon className="mr-1" /> Thêm truyện mới
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Chưa có truyện nào</p>
          <Link
            to="/stories/create"
            className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Thêm truyện mới
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số chương</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt xem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stories.map(story => (
                <tr key={story._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={
                          story.coverImage 
                            ? (story.coverImage.startsWith('http') 
                                ? story.coverImage 
                                : `http://localhost:5001/uploads/${story.coverImage}`)
                            : 'https://placehold.co/80x120/e2e8f0/1e293b?text=NovelRead'
                        }
                        alt={story.title}
                        className="h-12 w-8 object-cover mr-3 rounded"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/80x120/e2e8f0/1e293b?text=No+Image';
                          e.target.onerror = null;
                        }}
                      />
                      <div className="text-sm font-medium text-gray-900">{story.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{typeof story.author === 'object' ? story.author.username : story.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(story.status)}`}>
                      {getStatusText(story.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Array.isArray(story.chapters) ? story.chapters.length : 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {story.views?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm relative">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          console.log('Chuyển đến trang chỉnh sửa truyện với ID:', story._id);
                          if (!story._id) {
                            toast.error('ID truyện không xác định');
                            return;
                          }
                          navigate(`/stories/${story._id}/edit`);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Sửa truyện"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                      <button
                        onClick={() => navigate(`/stories/${story._id}/chapters`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Quản lý chương"
                      >
                        <BookIcon fontSize="small" />
                      </button>
                      <button 
                        onClick={() => handleDelete(story._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa truyện"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                      <div className="relative">
                        <button 
                          className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 dropdown-action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActionsMenu(story._id, e);
                          }}
                          ref={el => dropdownRefs.current[story._id] = el}
                        >
                          <MoreIcon fontSize="small" />
                        </button>
                        
                        <DropdownPortal isOpen={activeMenu === story._id}>
                          <div 
                            className="dropdown-menu fixed w-48 bg-white rounded-md shadow-xl z-[1000] py-1 border border-gray-200"
                            style={{
                              top: `${menuPosition.top}px`,
                              left: `${menuPosition.left - 150}px` // Điều chỉnh để menu không bị che bởi nút
                            }}
                          >
                            <Link 
                              to={`/stories/${story._id}`} 
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setActiveMenu(null)}
                            >
                              Xem truyện
                            </Link>
                            <Link 
                              to={`/stories/${story._id}/chapters/create`} 
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setActiveMenu(null)}
                            >
                              Thêm chương mới
                            </Link>
                            <button 
                              onClick={() => {
                                setActiveMenu(null);
                                navigate(`/stories/${story._id}/statistics`);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Xem thống kê
                            </button>
                          </div>
                        </DropdownPortal>
                      </div>
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

export default Stories; 