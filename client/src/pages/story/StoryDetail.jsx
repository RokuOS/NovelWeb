import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Visibility as ViewIcon,
  Create as EditIcon,
  Add as AddIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import Loading from '../../components/Loading';
import api from '../../utils/api';

const StoryDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarStories, setSimilarStories] = useState([]);
  const [redirectCounter, setRedirectCounter] = useState(null);
  
  // Chuyển hướng về trang chủ sau khi báo lỗi 
  useEffect(() => {
    let redirectTimer;
    
    const testPages = ['test', 'example', 'demo'];
    if (error && testPages.includes(id.toLowerCase())) {
      setRedirectCounter(5); // 5 seconds
      
      redirectTimer = setInterval(() => {
        setRedirectCounter(prev => {
          if (prev <= 1) {
            clearInterval(redirectTimer);
            navigate('/'); // Chuyển về trang chủ
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (redirectTimer) clearInterval(redirectTimer);
    };
  }, [error, id, navigate]);
  
  useEffect(() => {
    const fetchStoryDetails = async () => {
      try {
        setLoading(true);
        
        // Kiểm tra ID trước khi gọi API
        if (!id || id === 'undefined' || id === 'null') {
          console.error('ID truyện không hợp lệ:', id);
          setError(`ID truyện không hợp lệ: "${id}"`);
          setLoading(false);
          return;
        }
        
        // Xử lý các ID kiểm thử đặc biệt
        if (['test', 'example', 'demo'].includes(id.toLowerCase())) {
          console.log('ID kiểm thử được phát hiện:', id);
          setError(`"${id}" là trang thử nghiệm. Vui lòng truy cập một truyện thực tế.`);
          setLoading(false);
          return;
        }
        
        // Không cần kiểm tra định dạng ObjectId, cho phép ID là chuỗi hoặc slug
        console.log('Đang tải story với ID hoặc slug:', id);
        
        // Fetch story details - thay đổi để sử dụng endpoint tìm theo slug
        const storyRes = await api.get(`/stories/by-slug-or-id/${id}`);
        setStory(storyRes.data.data);
        
        // Fetch chapters - sử dụng ID thật của truyện sau khi đã tìm thấy
        const chaptersRes = await api.get(`/stories/${storyRes.data.data._id}/chapters`);
        setChapters(chaptersRes.data.data);
        
        // Check if user has bookmarked this story
        if (isAuthenticated) {
          try {
            const bookmarkRes = await api.get(`/users/bookmarks/check/${storyRes.data.data._id}`);
            setIsBookmarked(bookmarkRes.data.isBookmarked);
            
            // Get user rating for this story
            const ratingRes = await api.get(`/stories/${storyRes.data.data._id}/rating`);
            if (ratingRes.data.rating) {
              setUserRating(ratingRes.data.rating.value);
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching story details:', err);
        
        // Lấy danh sách truyện tương tự từ response nếu có
        if (err.response && err.response.data && err.response.data.similarStories) {
          setSimilarStories(err.response.data.similarStories);
        }
        
        if (err.response) {
          const { status, data } = err.response;
          if (status === 400) {
            setError(`ID truyện không hợp lệ: ${data.detail || data.message || id}`);
          } else if (status === 404) {
            toast.error(`Không tìm thấy truyện: ${id}`);
            setError(`Không tìm thấy truyện với ID hoặc slug: ${id}`);
          } else {
            setError(`Lỗi ${status}: ${data.message || 'Không thể tải thông tin truyện'}`);
          }
        } else if (err.request) {
          setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
        } else {
          setError('Không thể tải thông tin truyện. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStoryDetails();
  }, [id, isAuthenticated]);
  
  const toggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để đánh dấu truyện');
      navigate('/login');
      return;
    }

    if (!story) {
      toast.error('Không thể thực hiện. Truyện không tồn tại hoặc đang tải.');
      return;
    }
    
    try {
      if (isBookmarked) {
        await api.delete(`/users/bookmarks/${story._id}`);
        toast.success('Đã xóa khỏi danh sách đánh dấu');
      } else {
        await api.post(`/users/bookmarks/${story._id}`);
        toast.success('Đã thêm vào danh sách đánh dấu');
      }
      
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    }
  };
  
  const submitRating = async (rating) => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để đánh giá truyện');
      navigate('/login');
      return;
    }
    
    if (!story) {
      toast.error('Không thể thực hiện. Truyện không tồn tại hoặc đang tải.');
      return;
    }
    
    try {
      await api.post(`/stories/${story._id}/rating`, { rating });
      setUserRating(rating);
      toast.success('Đã gửi đánh giá của bạn!');
      
      // Update story rating in UI
      setStory(prev => ({
        ...prev,
        ratings: {
          ...prev.ratings,
          average: prev.ratings.count > 0 
            ? (prev.ratings.total + rating) / (prev.ratings.count + 1)
            : rating,
          count: prev.ratings.count + (userRating === 0 ? 1 : 0),
          total: prev.ratings.total + rating - (userRating || 0)
        }
      }));
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast.error('Đã xảy ra lỗi khi đánh giá. Vui lòng thử lại sau.');
    }
  };
  
  const isAuthor = user && story && user._id === story.author._id;
  
  if (loading) {
    return <Loading fullScreen={true} />;
  }
  
  if (error || !story) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="bg-red-100 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            {error || 'Không tìm thấy truyện'}
          </h2>
          
          {/* Hiển thị thông báo chuyển hướng */}
          {redirectCounter > 0 && (
            <div className="bg-yellow-100 p-3 rounded mb-4 text-yellow-800">
              Sẽ chuyển về trang chủ sau {redirectCounter} giây...
            </div>
          )}
          
          {/* Hiển thị truyện tương tự nếu có */}
          {error && error.includes('Không tìm thấy truyện') && 
            similarStories && similarStories.length > 0 && (
            <div className="mt-6 mb-4">
              <h3 className="text-lg font-semibold mb-2">Có thể bạn đang tìm:</h3>
              <ul className="space-y-2">
                {similarStories.map(story => (
                  <li key={story._id}>
                    <Link
                      to={`/stories/${story.slug || story._id}`}
                      className="text-primary-600 hover:underline"
                    >
                      {story.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 mr-3"
          >
            Về trang chủ
          </Link>
          
          <Link
            to="/stories"
            className="inline-block px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Xem danh sách truyện
          </Link>
        </div>
      </div>
    );
  }
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Format author name
  const getAuthorName = (author) => {
    if (!author) return 'Không rõ';
    if (typeof author === 'string') return author;
    if (author.username) return author.username;
    if (author.name) return author.name;
    return 'Không rõ';
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Story header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
          <div className="flex items-center text-sm">
            <span>Tác giả: {getAuthorName(story.author)}</span>
            <span className="mx-2">•</span>
            <span>Cập nhật: {formatDate(story.updatedAt)}</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column - Cover and info */}
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={story.coverImage 
                    ? (story.coverImage.startsWith('http') ? story.coverImage : `http://localhost:5001/uploads/${story.coverImage}`)
                    : '/default-cover.jpg'}
                  alt={story.title}
                  className="w-full rounded-lg shadow-md object-cover aspect-[3/4]"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = '/default-cover.jpg';
                  }}
                />
                
                <button
                  onClick={toggleBookmark}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                  title={isBookmarked ? 'Xóa khỏi danh sách' : 'Thêm vào danh sách'}
                >
                  {isBookmarked ? (
                    <BookmarkIcon className="text-primary-600 h-6 w-6" />
                  ) : (
                    <BookmarkBorderIcon className="text-primary-600 h-6 w-6" />
                  )}
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Thể loại:</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {story.categories.map((category) => (
                      <Link 
                        key={category._id} 
                        to={`/stories?category=${category._id}`}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Trạng thái:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    story.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : story.status === 'ongoing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {story.status === 'completed' 
                      ? 'Hoàn thành' 
                      : story.status === 'ongoing' 
                      ? 'Đang tiến hành'
                      : 'Tạm ngưng'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Lượt xem:</span>
                  <span className="flex items-center">
                    <ViewIcon className="h-4 w-4 text-gray-500 mr-1" />
                    {story.views.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Số chương:</span>
                  <span>{chapters.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Đánh giá:</span>
                  <span className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                    {story.ratings && story.ratings.average ? story.ratings.average.toFixed(1) : '0'} 
                    <span className="text-gray-500 text-xs ml-1">
                      ({story.ratings && story.ratings.count ? story.ratings.count : 0} lượt)
                    </span>
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Ngày tạo:</span>
                  <span>{formatDate(story.createdAt)}</span>
                </div>
              </div>
              
              {/* User rating */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Đánh giá của bạn</h3>
                <div className="flex items-center justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => submitRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      {(hoverRating || userRating) >= star ? (
                        <StarIcon className="h-8 w-8 text-yellow-500" />
                      ) : (
                        <StarBorderIcon className="h-8 w-8 text-yellow-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Author actions */}
              {isAuthor && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium mb-2">Tùy chọn tác giả</h3>
                  <Link
                    to={`/stories/${story._id}/edit`}
                    className="flex items-center justify-center w-full py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    <EditIcon className="mr-1 h-5 w-5" />
                    Chỉnh sửa truyện
                  </Link>
                  <Link
                    to={`/stories/${story._id}/chapters/create`}
                    className="flex items-center justify-center w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <AddIcon className="mr-1 h-5 w-5" />
                    Thêm chương mới
                  </Link>
                </div>
              )}
            </div>
            
            {/* Middle and right columns - Description and chapters */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Giới thiệu</h2>
                <div className="prose max-w-none">
                  {story.description ? (
                    <p className="whitespace-pre-line">{story.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">Chưa có mô tả cho truyện này.</p>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4 border-b pb-2 flex justify-between items-center">
                  Danh sách chương
                  {chapters.length > 0 && (
                    <Link 
                      to={`/chapters/${chapters[0]._id}`}
                      className="text-sm font-normal text-primary-600 hover:text-primary-800 flex items-center"
                    >
                      Đọc từ đầu
                      <ArrowIcon className="ml-1 h-4 w-4" />
                    </Link>
                  )}
                </h2>
                
                {chapters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có chương nào được đăng.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {chapters.map((chapter) => (
                      <Link
                        key={chapter._id}
                        to={`/chapters/${chapter._id}`}
                        className="flex items-center justify-between p-3 rounded-md hover:bg-gray-100"
                      >
                        <div>
                          <span className="font-medium">Chương {chapter.chapterNumber}: </span>
                          <span>{chapter.title}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(chapter.createdAt)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDetail; 