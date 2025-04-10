import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { 
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Component trình soạn thảo rich text đơn giản
const RichTextEditor = ({ value, onChange }) => {
  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-100 p-2 border-b border-gray-300 flex space-x-2">
        <button 
          type="button" 
          className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => onChange(value + '<b></b>')}
        >
          <b>B</b>
        </button>
        <button 
          type="button"
          className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => onChange(value + '<i></i>')}
        >
          <i>I</i>
        </button>
        <button 
          type="button"
          className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => onChange(value + '<u></u>')}
        >
          <u>U</u>
        </button>
        <button 
          type="button"
          className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => onChange(value + '<h2></h2>')}
        >
          H2
        </button>
        <button 
          type="button"
          className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => onChange(value + '<p></p>')}
        >
          P
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[300px] p-3 focus:outline-none"
      />
    </div>
  );
};

const StoryEdit = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: [],
    status: 'ongoing',
    coverImage: null
  });
  
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch story and categories data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Kiểm tra ID trước khi gọi API - thêm kiểm tra chi tiết và log
        console.log('ID truyện nhận được:', storyId);
        
        if (!storyId) {
          console.error('ID truyện không xác định:', storyId);
          toast.error('ID truyện không xác định');
          navigate('/admin/stories');
          return;
        }
        
        if (storyId === 'undefined' || storyId === 'null') {
          console.error('ID truyện không hợp lệ:', storyId);
          toast.error(`ID truyện không hợp lệ: "${storyId}"`);
          navigate('/admin/stories');
          return;
        }
        
        // Fetch categories
        const categoriesRes = await api.get('/categories');
        if (categoriesRes.data && categoriesRes.data.data) {
          setAvailableCategories(categoriesRes.data.data);
        }

        // Fetch story data
        const storyRes = await api.get(`/stories/${storyId}`);
        const story = storyRes.data.data;
        
        console.log('Dữ liệu story nhận từ API:', story);
        console.log('Thông tin categories:', story.categories);
        
        // Set form data
        setFormData({
          title: story.title || '',
          description: story.description || '',
          categories: Array.isArray(story.categories) 
            ? story.categories.map(cat => typeof cat === 'object' ? cat._id : cat) 
            : [],
          status: story.status || 'ongoing',
          coverImage: null
        });
        
        // Set preview image
        if (story.coverImage) {
          setCoverImagePreview(
            story.coverImage.startsWith('http') 
              ? story.coverImage 
              : `http://localhost:5001/uploads/${story.coverImage}`
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
          toast.error(error.response.data?.message || 'Không thể tải thông tin truyện');
        } else {
          toast.error('Không thể kết nối đến máy chủ');
        }
        navigate('/admin/stories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storyId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDescriptionChange = (value) => {
    setFormData(prev => ({ 
      ...prev, 
      description: value 
    }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const isChecked = e.target.checked;

    setFormData(prev => {
      if (isChecked) {
        return {
          ...prev,
          categories: [...prev.categories, categoryId]
        };
      } else {
        return {
          ...prev,
          categories: prev.categories.filter(id => id !== categoryId)
        };
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 2MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        coverImage: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      coverImage: null
    }));
    setCoverImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Tạo FormData object để xử lý upload file
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('status', formData.status);
      
      // Thêm từng thể loại vào form data
      if (formData.categories && formData.categories.length > 0) {
        console.log('Categories trước khi gửi lên server:', formData.categories);
        console.log('Categories sau khi chuyển thành JSON:', JSON.stringify(formData.categories));
        data.append('categories', JSON.stringify(formData.categories));
      } else {
        console.log('Không có categories để gửi lên server');
        // Vẫn gửi một mảng rỗng để server xử lý
        data.append('categories', JSON.stringify([]));
      }
      
      // Thêm ảnh bìa nếu có thay đổi
      if (formData.coverImage && formData.coverImage instanceof File) {
        data.append('coverImage', formData.coverImage);
      }
      
      await api.put(`/stories/${storyId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Cập nhật truyện thành công!');
      navigate(`/stories/${storyId}`);
    } catch (err) {
      console.error('Error updating story:', err);
      
      if (err.response && err.response.data) {
        const errorMessage = err.response.data.message || 'Có lỗi xảy ra khi cập nhật truyện';
        toast.error(errorMessage);
      } else {
        toast.error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
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
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <BackIcon />
        </button>
        <h1 className="text-3xl font-bold">Chỉnh sửa truyện</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <RichTextEditor 
                  value={formData.description} 
                  onChange={handleDescriptionChange} 
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="ongoing">Đang tiến hành</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="dropped">Đã bỏ dở</option>
                </select>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh bìa
                </label>
                <div className="flex flex-col items-center">
                  {coverImagePreview ? (
                    <div className="relative mb-4">
                      <img
                        src={coverImagePreview}
                        alt="Cover preview"
                        className="w-48 h-64 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-48 h-64 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-gray-400 text-sm text-center p-4">
                        Chưa có ảnh bìa
                      </span>
                    </div>
                  )}
                  <label className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-md flex items-center justify-center cursor-pointer hover:bg-blue-100 transition">
                    <UploadIcon className="mr-2" fontSize="small" />
                    <span>Tải ảnh lên</span>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Định dạng: JPG, PNG, WebP. Tối đa 2MB.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thể loại
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
                  {availableCategories.length === 0 ? (
                    <p className="text-gray-500 text-sm">Không có thể loại nào</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableCategories.map(category => (
                        <div key={category._id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`category-${category._id}`}
                            value={category._id}
                            checked={formData.categories.includes(category._id)}
                            onChange={handleCategoryChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`category-${category._id}`} className="ml-2 text-sm text-gray-700">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50"
            >
              <SaveIcon className="mr-2" fontSize="small" />
              {isSubmitting ? 'Đang cập nhật...' : 'Lưu truyện'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoryEdit; 