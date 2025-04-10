import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VisibilityOff as HideIcon,
  Visibility as ShowIcon,
  ArrowUpward as SortUpIcon,
  ArrowDownward as SortDownIcon,
  Sort as SortIcon
} from '@mui/icons-material';

const StoryChapters = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortAscending, setSortAscending] = useState(true);

  useEffect(() => {
    const fetchStoryAndChapters = async () => {
      try {
        setLoading(true);
        const storyResponse = await api.get(`/stories/${storyId}`);
        const chaptersResponse = await api.get(`/stories/${storyId}/chapters`);
        
        if (storyResponse.data && storyResponse.data.data) {
          setStory(storyResponse.data.data);
        }
        
        if (chaptersResponse.data && chaptersResponse.data.data) {
          // Sort chapters by chapter number
          const sortedChapters = chaptersResponse.data.data.sort((a, b) => 
            sortAscending ? a.chapter_number - b.chapter_number : b.chapter_number - a.chapter_number
          );
          setChapters(sortedChapters);
        }
      } catch (error) {
        console.error('Error fetching story and chapters:', error);
        toast.error('Không thể tải thông tin truyện và danh sách chương');
      } finally {
        setLoading(false);
      }
    };

    fetchStoryAndChapters();
  }, [storyId, sortAscending]);

  const handleDelete = async (chapterId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chương này?')) {
      try {
        await api.delete(`/chapters/${chapterId}`);
        setChapters(chapters.filter(chapter => chapter._id !== chapterId));
        toast.success('Xóa chương thành công');
      } catch (error) {
        console.error('Error deleting chapter:', error);
        toast.error('Không thể xóa chương');
      }
    }
  };

  const handleToggleVisibility = async (chapterId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await api.put(`/chapters/${chapterId}`, { status: newStatus });
      
      setChapters(chapters.map(chapter => 
        chapter._id === chapterId 
          ? { ...chapter, status: newStatus } 
          : chapter
      ));
      
      toast.success(`Chương đã được ${newStatus === 'published' ? 'công khai' : 'ẩn'}`);
    } catch (error) {
      console.error('Error toggling chapter visibility:', error);
      toast.error('Không thể thay đổi trạng thái chương');
    }
  };

  const handleUpdateChapterNumber = async (chapterId, currentNumber, direction) => {
    const newNumber = direction === 'up' ? currentNumber - 1 : currentNumber + 1;
    
    // Kiểm tra số thứ tự mới hợp lệ
    if (newNumber < 1) {
      toast.warning('Số thứ tự chương không thể nhỏ hơn 1');
      return;
    }
    
    // Kiểm tra xem số thứ tự mới có trùng với số thứ tự của chương khác không
    const conflictChapter = chapters.find(
      chapter => chapter.chapter_number === newNumber && chapter._id !== chapterId
    );
    
    if (conflictChapter) {
      if (window.confirm(`Số thứ tự ${newNumber} đã tồn tại. Bạn có muốn hoán đổi thứ tự giữa hai chương không?`)) {
        try {
          // Cập nhật cả hai chương
          await api.put(`/chapters/${chapterId}`, { chapter_number: newNumber });
          
          await api.put(`/chapters/${conflictChapter._id}`, { chapter_number: currentNumber });
          
          // Cập nhật danh sách chương sau khi hoán đổi
          setChapters(chapters.map(chapter => {
            if (chapter._id === chapterId) {
              return { ...chapter, chapter_number: newNumber };
            }
            if (chapter._id === conflictChapter._id) {
              return { ...chapter, chapter_number: currentNumber };
            }
            return chapter;
          }));
          
          toast.success('Hoán đổi thứ tự chương thành công');
        } catch (error) {
          console.error('Error swapping chapter numbers:', error);
          toast.error('Không thể hoán đổi thứ tự chương');
        }
      }
    } else {
      try {
        // Cập nhật số thứ tự chương
        await api.put(`/chapters/${chapterId}`, { chapter_number: newNumber });
        
        // Cập nhật danh sách chương
        setChapters(chapters.map(chapter => 
          chapter._id === chapterId 
            ? { ...chapter, chapter_number: newNumber } 
            : chapter
        ));
        
        toast.success('Cập nhật số thứ tự chương thành công');
      } catch (error) {
        console.error('Error updating chapter number:', error);
        toast.error('Không thể cập nhật số thứ tự chương');
      }
    }
  };

  const toggleSort = () => {
    setSortAscending(!sortAscending);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Không tìm thấy truyện</p>
          <button
            onClick={() => navigate('/admin/stories')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Quay lại danh sách truyện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <BackIcon />
        </button>
        <h1 className="text-3xl font-bold">Quản lý chương truyện</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold">
              {story.title}
            </h2>
            <p className="text-gray-600 mt-1">
              Tác giả: {typeof story.author === 'string' 
                ? story.author 
                : story.author && story.author.username 
                  ? story.author.username 
                  : 'Không rõ'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/stories/${storyId}`}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              Xem truyện
            </Link>
            <Link
              to={`/stories/${storyId}/edit`}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
              onClick={(e) => {
                if (!storyId) {
                  e.preventDefault();
                  toast.error('ID truyện không xác định');
                  return false;
                }
                console.log('Chuyển đến trang chỉnh sửa truyện với ID:', storyId);
              }}
            >
              Sửa truyện
            </Link>
            <Link
              to={`/stories/${storyId}/chapters/create`}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
            >
              <AddIcon className="mr-1" fontSize="small" /> Thêm chương mới
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={toggleSort}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
        >
          <SortIcon className="mr-1" /> 
          Sắp xếp: {sortAscending ? 'Tăng dần' : 'Giảm dần'}
        </button>
        
        <Link
          to={`/stories/${storyId}/chapters/create`}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
        >
          <AddIcon className="mr-1" /> Thêm chương mới
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Danh sách chương ({chapters.length})</h3>
        </div>

        {chapters.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">Chưa có chương nào</p>
            <Link
              to={`/stories/${storyId}/chapters/create`}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Thêm chương đầu tiên
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Số thứ tự</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chapters.map((chapter, index) => (
                <tr key={chapter._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium">{chapter.chapter_number}</span>
                      <div className="ml-2 flex flex-col">
                        <button
                          onClick={() => handleUpdateChapterNumber(chapter._id, chapter.chapter_number, 'up')}
                          className="text-gray-500 hover:text-gray-700"
                          title="Tăng thứ tự"
                        >
                          <SortUpIcon fontSize="small" />
                        </button>
                        <button
                          onClick={() => handleUpdateChapterNumber(chapter._id, chapter.chapter_number, 'down')}
                          className="text-gray-500 hover:text-gray-700"
                          title="Giảm thứ tự"
                        >
                          <SortDownIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{chapter.title}</div>
                    {chapter.views > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {chapter.views} lượt đọc
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(chapter.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      chapter.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {chapter.status === 'published' ? 'Công khai' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <div className="flex space-x-3 justify-center">
                      <Link
                        to={`/chapters/${chapter._id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chương"
                      >
                        <ShowIcon fontSize="small" />
                      </Link>
                      
                      <button
                        onClick={() => handleToggleVisibility(chapter._id, chapter.status)}
                        className={`${
                          chapter.status === 'published' 
                            ? 'text-orange-600 hover:text-orange-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={chapter.status === 'published' ? 'Chuyển sang bản nháp' : 'Công khai'}
                      >
                        {chapter.status === 'published' 
                          ? <HideIcon fontSize="small" /> 
                          : <ShowIcon fontSize="small" />
                        }
                      </button>
                      
                      <Link
                        to={`/stories/${storyId}/chapters/${chapter._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Sửa chương"
                      >
                        <EditIcon fontSize="small" />
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(chapter._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa chương"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StoryChapters; 