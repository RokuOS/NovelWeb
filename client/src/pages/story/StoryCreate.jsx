import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

const StoryCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    status: 'ongoing',
    categories: [],
    coverImage: null
  });
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (response.data && response.data.data) {
          setAvailableCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Không thể tải danh sách thể loại');
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    setCoverImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.description) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Tạo FormData object để gửi file
      const formDataToSend = new FormData();
      
      // Gửi dữ liệu dưới dạng text
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('author', formData.author.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('status', formData.status);
      
      // Gửi categories dưới dạng JSON string
      if (formData.categories && formData.categories.length > 0) {
        formDataToSend.append('categories', JSON.stringify(formData.categories));
      }
      
      // Gửi ảnh bìa nếu có
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }

      // Log dữ liệu gửi đi để debug
      console.log('Form data being sent:', {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        status: formData.status,
        categories: formData.categories,
        hasCoverImage: !!formData.coverImage
      });

      // Log FormData để kiểm tra
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await api.post('/stories', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Tạo truyện thành công');
      
      // Chuyển hướng đến trang chi tiết truyện hoặc trang thêm chương mới
      navigate(`/stories/${response.data.data._id}/chapters/create`);
    } catch (error) {
      console.error('Error creating story:', error);
      // Hiển thị thông báo lỗi chi tiết từ server nếu có
      const errorMessage = error.response?.data?.message || 'Không thể tạo truyện mới';
      toast.error(errorMessage);
      
      // Log chi tiết lỗi để debug
      if (error.response?.data) {
        console.log('Server error details:', error.response.data);
        // Log chi tiết các lỗi
        if (error.response.data.errors) {
          error.response.data.errors.forEach((err, index) => {
            console.log(`Error ${index + 1}:`, err);
            // Hiển thị thông báo lỗi cho từng trường
            toast.error(err.msg);
          });
        }
        // Log request data
        console.log('Request data:', {
          title: formData.title,
          author: formData.author,
          description: formData.description,
          status: formData.status,
          categories: formData.categories,
          hasCoverImage: !!formData.coverImage
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <BackIcon />
        </button>
        <h1 className="text-3xl font-bold">Tạo truyện mới</h1>
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
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                  Tác giả <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
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
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))} 
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
              {isSubmitting ? 'Đang tạo...' : 'Lưu truyện'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoryCreate; 