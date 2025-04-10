import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  ArrowBack as PrevIcon,
  ArrowForward as NextIcon,
  Menu as MenuIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Edit as EditIcon,
  FormatListBulleted as ListIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon
} from '@mui/icons-material';
import Loading from '../../components/Loading';
import api from '../../utils/api';

const ChapterDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [story, setStory] = useState(null);
  const [prevChapter, setPrevChapter] = useState(null);
  const [nextChapter, setNextChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    // Lấy fontSize từ localStorage nếu có
    return parseInt(localStorage.getItem('reader-fontSize') || '18');
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Lấy darkMode từ localStorage nếu có
    return localStorage.getItem('reader-darkMode') === 'true';
  });
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin chương
        const chapterRes = await api.get(`/chapters/${id}`);
        setChapter(chapterRes.data.data);
        
        const storyId = chapterRes.data.data.story;
        
        // Đảm bảo storyId là string
        const storyIdStr = typeof storyId === 'object' && storyId._id ? storyId._id : storyId;
        
        // Lấy thông tin truyện
        const storyRes = await api.get(`/stories/${storyIdStr}`);
        setStory(storyRes.data.data);
        
        // Lấy chương trước và sau
        try {
          const chapterNav = await api.get(`/stories/${storyIdStr}/chapters/navigation/${id}`);
          setPrevChapter(chapterNav.data.prev);
          setNextChapter(chapterNav.data.next);
        } catch (navErr) {
          console.error('Error fetching chapter navigation:', navErr);
          // Sử dụng dữ liệu từ response chapter nếu có
          if (chapterRes.data.data.prevChapter) {
            setPrevChapter(chapterRes.data.data.prevChapter);
          }
          if (chapterRes.data.data.nextChapter) {
            setNextChapter(chapterRes.data.data.nextChapter);
          }
        }
        
        // Kiểm tra bookmark nếu đã đăng nhập
        if (isAuthenticated) {
          try {
            const bookmarkRes = await api.get(`/users/bookmarks/check/${storyIdStr}`);
            setIsBookmarked(bookmarkRes.data.isBookmarked);
          } catch (err) {
            console.error('Error checking bookmark:', err);
          }
          
          // Ghi lại lịch sử đọc truyện
          try {
            await api.post('/users/history', {
              storyId: storyIdStr,
              chapterId: id
            });
          } catch (err) {
            console.error('Error recording reading history:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching chapter:', err);
        setError('Không thể tải chương truyện. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChapterData();
  }, [id, isAuthenticated]);
  
  // Lưu cài đặt đọc vào localStorage
  useEffect(() => {
    localStorage.setItem('reader-fontSize', fontSize.toString());
    localStorage.setItem('reader-darkMode', isDarkMode.toString());
    
    // Áp dụng dark mode cho toàn trang
    document.body.classList.toggle('dark-reader', isDarkMode);
    
    return () => {
      // Clean up khi rời khỏi trang
      document.body.classList.remove('dark-reader');
    };
  }, [fontSize, isDarkMode]);
  
  const toggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để đánh dấu truyện');
      navigate('/login');
      return;
    }
    
    try {
      const storyId = typeof story._id === 'object' ? story._id._id : story._id;
      
      if (isBookmarked) {
        await api.delete(`/users/bookmarks/${storyId}`);
        toast.success('Đã xóa khỏi danh sách đánh dấu');
      } else {
        await api.post(`/users/bookmarks/${storyId}`);
        toast.success('Đã thêm vào danh sách đánh dấu');
      }
      
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    }
  };
  
  const changeFontSize = (increment) => {
    setFontSize(prevSize => {
      // Giới hạn fontSize trong khoảng 12-28
      const newSize = Math.max(12, Math.min(28, prevSize + increment));
      return newSize;
    });
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  
  const isAuthor = user && story && user._id === story.author._id;
  
  if (loading) {
    return <Loading fullScreen={true} />;
  }
  
  if (error || !chapter || !story) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="bg-red-100 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            {error || 'Không tìm thấy chương truyện'}
          </h2>
          <Link
            to="/stories"
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Quay lại danh sách truyện
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`py-4 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      {/* Top navigation bar */}
      <div className={`fixed top-0 left-0 right-0 z-10 px-4 py-2 shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label="Toggle menu"
            >
              <MenuIcon />
            </button>
            
            <Link to={`/stories/${typeof story._id === 'object' ? story._id._id : story._id}`} className="hidden md:flex items-center">
              <span className="truncate max-w-xs">{story.title}</span>
            </Link>
          </div>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-medium truncate">
              Chương {chapter.chapterNumber}: {chapter.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </button>
            
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label={isBookmarked ? 'Unbookmark' : 'Bookmark'}
            >
              {isBookmarked ? <BookmarkIcon className="text-primary-500" /> : <BookmarkBorderIcon />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Sidebar menu */}
      {showMenu && (
        <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)}>
          <div 
            className={`fixed top-0 left-0 bottom-0 w-64 z-30 shadow-lg p-4 transition-transform ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-8">
              <Link to="/" className="flex items-center space-x-2 mb-6">
                <HomeIcon className="text-primary-600" />
                <span className="font-bold text-lg">NovelRead</span>
              </Link>
              
              <Link 
                to={`/stories/${typeof story._id === 'object' ? story._id._id : story._id}`} 
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <MenuIcon className="text-gray-500" />
                  <span>Thông tin truyện</span>
                </div>
              </Link>
              
              <Link 
                to="/stories" 
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <ListIcon className="text-gray-500" />
                  <span>Danh sách truyện</span>
                </div>
              </Link>
              
              {isAuthor && (
                <Link 
                  to={`/chapters/${chapter._id}/edit`} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    <EditIcon className="text-gray-500" />
                    <span>Chỉnh sửa chương</span>
                  </div>
                </Link>
              )}
            </div>
            
            <div className="border-t pt-4 mb-6">
              <h3 className="font-medium mb-2">Cài đặt trình đọc</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Cỡ chữ</p>
                  <div className="flex items-center">
                    <button 
                      onClick={() => changeFontSize(-2)}
                      className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      disabled={fontSize <= 12}
                    >
                      <ZoomOutIcon />
                    </button>
                    <span className="mx-2">{fontSize}px</span>
                    <button 
                      onClick={() => changeFontSize(2)}
                      className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      disabled={fontSize >= 28}
                    >
                      <ZoomInIcon />
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Chế độ đọc</p>
                  <button 
                    onClick={toggleDarkMode}
                    className={`flex items-center space-x-2 p-2 rounded-md ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    {isDarkMode ? (
                      <>
                        <LightModeIcon />
                        <span>Chế độ sáng</span>
                      </>
                    ) : (
                      <>
                        <DarkModeIcon />
                        <span>Chế độ tối</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="container mx-auto max-w-3xl px-4 mt-16 mb-20">
        {/* Chapter title */}
        <h1 className="text-2xl font-bold text-center my-8">
          Chương {chapter.chapterNumber}: {chapter.title}
        </h1>
        
        {/* Chapter content */}
        <div 
          className="prose max-w-none mx-auto my-8"
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: '1.8',
          }}
        >
          {chapter.content.split('\n').map((paragraph, index) => (
            <p key={index} className="my-4">
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Bottom navigation */}
        <div className="flex justify-between items-center my-12">
          {prevChapter ? (
            <Link
              to={`/chapters/${prevChapter._id}`}
              className={`px-4 py-2 rounded-md flex items-center ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50 shadow'
              }`}
            >
              <PrevIcon className="mr-1" />
              <span className="hidden md:inline">Chương trước</span>
              <span className="md:hidden">Trước</span>
            </Link>
          ) : (
            <div className="invisible">
              <PrevIcon />
            </div>
          )}
          
          <Link
            to={`/stories/${typeof story._id === 'object' ? story._id._id : story._id}`}
            className={`px-4 py-2 rounded-md ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white hover:bg-gray-50 shadow'
            }`}
          >
            <span className="hidden md:inline">Mục lục</span>
            <ListIcon className="md:hidden" />
          </Link>
          
          {nextChapter ? (
            <Link
              to={`/chapters/${nextChapter._id}`}
              className={`px-4 py-2 rounded-md flex items-center ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50 shadow'
              }`}
            >
              <span className="hidden md:inline">Chương tiếp</span>
              <span className="md:hidden">Tiếp</span>
              <NextIcon className="ml-1" />
            </Link>
          ) : (
            <div className="invisible">
              <NextIcon />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterDetail; 