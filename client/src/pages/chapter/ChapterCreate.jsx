import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatListBulleted as ListIcon,
  FormatListNumbered as NumberedListIcon,
  FormatQuote as QuoteIcon,
  Title as TitleIcon,
  AddPhotoAlternate as ImageIcon,
  ViewHeadline as ParagraphIcon
} from '@mui/icons-material';

// Component trình soạn thảo nội dung cải tiến
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  
  const formatText = (format) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    document.execCommand('styleWithCSS', false, true);
    
    switch (format) {
      case 'bold':
        document.execCommand('bold', false, null);
        break;
      case 'italic':
        document.execCommand('italic', false, null);
        break;
      case 'underline':
        document.execCommand('underline', false, null);
        break;
      case 'paragraph':
        document.execCommand('formatBlock', false, '<p>');
        break;
      case 'h2':
        document.execCommand('formatBlock', false, '<h2>');
        break;
      case 'h3':
        document.execCommand('formatBlock', false, '<h3>');
        break;
      case 'blockquote':
        document.execCommand('formatBlock', false, '<blockquote>');
        break;
      case 'ul':
        document.execCommand('insertUnorderedList', false, null);
        break;
      case 'ol':
        document.execCommand('insertOrderedList', false, null);
        break;
      default:
        break;
    }
    
    // Update the value
    if (editor) {
      onChange(editor.textContent);
    }
  };
  
  const handleInput = (e) => {
    const editor = editorRef.current;
    if (editor) {
      // Lấy nội dung hiện tại của editor dưới dạng text
      const currentContent = editor.textContent;
      // Cập nhật state với nội dung mới
      onChange(currentContent);
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };
  
  const insertImage = () => {
    const url = prompt('Nhập URL của hình ảnh:');
    if (url) {
      document.execCommand('insertHTML', false, `<img src="${url}" alt="Hình ảnh" style="max-width: 100%; height: auto; margin: 10px 0;" />`);
      onChange(editorRef.current.textContent);
    }
  };
  
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.textContent = value;
    }
  }, [value]);
  
  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-100 p-2 border-b border-gray-300 flex flex-wrap gap-1">
        <button 
          type="button" 
          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => formatText('bold')}
          title="In đậm"
        >
          <BoldIcon fontSize="small" />
        </button>
        <button 
          type="button"
          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => formatText('italic')}
          title="In nghiêng"
        >
          <ItalicIcon fontSize="small" />
        </button>
        <button 
          type="button"
          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => formatText('underline')}
          title="Gạch chân"
        >
          <UnderlineIcon fontSize="small" />
        </button>
        <span className="mx-1 border-l border-gray-300"></span>
        <button 
          type="button"
          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => formatText('h2')}
          title="Tiêu đề lớn"
        >
          <TitleIcon fontSize="small" />
        </button>
        <button 
          type="button"
          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => formatText('h3')}
          title="Tiêu đề nhỏ"
        >
          <span className="text-sm font-bold">H3</span>
        </button>
        <button 
          type="button"
          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => formatText('paragraph')}
          title="Đoạn văn"
        >
          <ParagraphIcon fontSize="small" />
        </button>
        <span className="mx-1 border-l border-gray-300"></span>
        <button 
          type="button"
          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => formatText('ul')}
          title="Danh sách"
        >
          <ListIcon fontSize="small" />
        </button>
        <button 
          type="button"
          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => formatText('ol')}
          title="Danh sách có thứ tự"
        >
          <NumberedListIcon fontSize="small" />
        </button>
        <button 
          type="button"
          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => formatText('blockquote')}
          title="Trích dẫn"
        >
          <QuoteIcon fontSize="small" />
        </button>
        <span className="mx-1 border-l border-gray-300"></span>
        <button 
          type="button"
          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          onClick={insertImage}
          title="Chèn hình ảnh"
        >
          <ImageIcon fontSize="small" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="w-full min-h-[400px] p-4 focus:outline-none"
        onInput={handleInput}
        onPaste={handlePaste}
        placeholder={placeholder}
        style={{ direction: 'ltr' }}
      />
    </div>
  );
};

const ChapterCreate = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    chapter_number: 1,
    status: 'published'
  });

  useEffect(() => {
    const fetchStoryAndChapters = async () => {
      try {
        setLoading(true);
        const storyResponse = await api.get(`/stories/${storyId}`);
        const chaptersResponse = await api.get(`/stories/${storyId}/chapters`);
        
        if (storyResponse.data && storyResponse.data.data) {
          setStory(storyResponse.data.data);
        }
        
        // Determine next chapter number
        if (chaptersResponse.data && chaptersResponse.data.data) {
          const chapters = chaptersResponse.data.data;
          if (chapters.length > 0) {
            const maxChapterNumber = Math.max(...chapters.map(c => c.chapter_number));
            setFormData(prev => ({
              ...prev,
              chapter_number: maxChapterNumber + 1
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching story data:', error);
        toast.error('Không thể tải thông tin truyện');
      } finally {
        setLoading(false);
      }
    };

    fetchStoryAndChapters();
  }, [storyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra độ dài tối thiểu của nội dung
    if (formData.content.trim().length < 10) {
      toast.error('Nội dung chương phải có ít nhất 10 ký tự');
      return;
    }
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung chương');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Kiểm tra và chuẩn hóa dữ liệu trước khi gửi
      const submitData = {
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
        chapter_number: parseInt(formData.chapter_number),
        status: formData.status
      };

      // Log dữ liệu để debug
      console.log('Submitting data:', submitData);
      
      const response = await api.post(`/stories/${storyId}/chapters`, submitData);
      
      if (response.data && response.data.success) {
        toast.success('Tạo chương mới thành công');
        navigate(`/stories/${storyId}/chapters`);
      } else {
        throw new Error(response.data?.message || 'Không thể tạo chương mới');
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
      
      // Xử lý các loại lỗi cụ thể
      if (error.response) {
        // Lỗi từ server
        const errorData = error.response.data;
        
        // Xử lý lỗi validation
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).map(err => err.message);
          errorMessages.forEach(message => {
            toast.error(message);
          });
          return;
        }
        
        // Xử lý các lỗi khác từ server
        const errorMessage = errorData.message || 'Lỗi server';
        toast.error(errorMessage);
        
        // Log chi tiết lỗi để debug
        console.error('Server error details:', {
          status: error.response.status,
          data: errorData,
          headers: error.response.headers
        });
      } else if (error.request) {
        // Lỗi không nhận được phản hồi
        toast.error('Không thể kết nối đến server');
      } else {
        // Lỗi khác
        toast.error('Có lỗi xảy ra khi tạo chương mới');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const generateChapterTitle = () => {
    const chapterNumber = formData.chapter_number;
    return `Chương ${chapterNumber}${formData.title ? ': ' + formData.title : ''}`;
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
        <h1 className="text-3xl font-bold">Thêm chương mới</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">
          {story.title}
        </h2>
        <p className="text-gray-600">Tác giả: {typeof story.author === 'object' ? story.author.username : story.author}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-3">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề chương <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Nhập tiêu đề chương"
              />
            </div>
            
            <div>
              <label htmlFor="chapter_number" className="block text-sm font-medium text-gray-700 mb-1">
                Số thứ tự <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="chapter_number"
                name="chapter_number"
                value={formData.chapter_number}
                onChange={handleChange}
                min="1"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-lg font-medium mb-2">{generateChapterTitle()}</p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <RichTextEditor 
              value={formData.content} 
              onChange={handleContentChange} 
              placeholder="Nhập nội dung chương tại đây..."
            />
          </div>
          
          <div className="mb-6">
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
              <option value="published">Công khai ngay</option>
              <option value="draft">Lưu bản nháp</option>
            </select>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50"
            >
              <SaveIcon className="mr-2" fontSize="small" />
              {submitting ? 'Đang lưu...' : 'Lưu chương'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterCreate; 