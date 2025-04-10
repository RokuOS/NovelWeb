import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark as BookmarkIcon, 
  BookmarkBorder as BookmarkBorderIcon,
  Visibility as VisibilityIcon,
  StarRate as StarIcon,
  Star as StarFilledIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

const StoryCard = ({ story = {}, showDescription = false, horizontal = false }) => {
  // Đảm bảo story luôn là object, không bị undefined
  if (!story || typeof story !== 'object') {
    story = {};
  }
  
  const { isAuthenticated, user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(story.isBookmarked || false);
  const [isLoading, setIsLoading] = useState(false);

  // Rút gọn mô tả nếu quá dài
  const truncatedDescription = story.description && story.description.length > 120
    ? `${story.description.substring(0, 120)}...`
    : story.description || 'Không có mô tả';

  // Xử lý toggle bookmark
  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thêm truyện vào danh sách theo dõi');
      return;
    }

    setIsLoading(true);
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${story._id}`);
        toast.success('Đã xóa truyện khỏi danh sách theo dõi');
      } else {
        await api.post(`/bookmarks`, { storyId: story._id });
        toast.success('Đã thêm truyện vào danh sách theo dõi');
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<StarFilledIcon key={i} className="text-yellow-400 text-sm" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<StarIcon key={i} className="text-yellow-400 text-sm" />);
      } else {
        stars.push(<StarIcon key={i} className="text-gray-300 text-sm" />);
      }
    }
    
    return stars;
  };

  // Đảm bảo story có các thuộc tính cần thiết
  const safeStory = {
    _id: story._id || 'unknown',
    title: story.title || 'Không có tiêu đề',
    slug: story.slug || story._id || 'unknown',
    author: story.author || { name: 'Không rõ', username: 'Không rõ', slug: 'unknown' },
    status: story.status || 'ongoing',
    coverImage: story.coverImage 
      ? (story.coverImage.startsWith('http') ? story.coverImage : `http://localhost:5001/uploads/${story.coverImage}`)
      : 'https://placehold.co/150x200/e2e8f0/1e293b?text=NovelRead',
    views: story.views || 0,
    rating: story.rating || 0,
    numRatings: story.numRatings || 0,
    categories: Array.isArray(story.categories) ? story.categories : [],
    chapters: Array.isArray(story.chapters) ? story.chapters : []
  };

  // Xử lý nhiều dạng author khác nhau
  if (typeof safeStory.author === 'string') {
    safeStory.author = { name: safeStory.author, username: safeStory.author, slug: 'unknown' };
  } else if (typeof safeStory.author === 'object' && safeStory.author !== null) {
    // Nếu author là object nhưng không có name, dùng username
    if (!safeStory.author.name && safeStory.author.username) {
      safeStory.author.name = safeStory.author.username;
    }
    // Nếu author là object nhưng không có username, dùng name
    if (!safeStory.author.username && safeStory.author.name) {
      safeStory.author.username = safeStory.author.name;
    }
    // Đảm bảo có slug
    if (!safeStory.author.slug) {
      safeStory.author.slug = 'unknown';
    }
  }

  if (horizontal) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1 flex">
        <Link to={`/stories/${safeStory.slug}`} className="block w-1/3 relative">
          <img
            src={safeStory.coverImage}
            alt={safeStory.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.src = 'https://placehold.co/150x200/e2e8f0/1e293b?text=No+Image';
              e.target.onerror = null;
            }}
          />
          {safeStory.status === 'completed' && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              Hoàn thành
            </span>
          )}
        </Link>
        
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start">
            <Link to={`/stories/${safeStory.slug}`} className="block">
              <h3 className="text-lg font-semibold hover:text-primary-600 transition-colors">
                {safeStory.title}
              </h3>
            </Link>
            
            <button
              onClick={handleToggleBookmark}
              disabled={isLoading}
              className="text-primary-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </button>
          </div>
          
          <div className="mt-1 text-sm text-gray-500">
            <span>Tác giả: </span>
            <Link to={`/authors/${safeStory.author.slug}`} className="hover:text-primary-600 transition-colors">
              {safeStory.author.name}
            </Link>
          </div>
          
          {showDescription && (
            <p className="text-gray-600 mt-2 text-sm">{truncatedDescription}</p>
          )}
          
          <div className="mt-auto pt-2 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <VisibilityIcon fontSize="small" className="mr-1" />
                <span>{safeStory.views.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center">
                {renderStars(safeStory.rating)}
                <span className="ml-1">({safeStory.numRatings})</span>
              </div>
            </div>
            
            <span>
              {safeStory.chapters.length} chương
            </span>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-1">
            {safeStory.categories.slice(0, 3).map((category) => (
              <Link
                key={category._id || Math.random().toString()}
                to={`/categories/${category.slug || category._id || ''}`}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
              >
                {category.name || 'Không rõ'}
              </Link>
            ))}
            {safeStory.categories.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                +{safeStory.categories.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <Link to={`/stories/${safeStory.slug}`} className="block relative">
        <img
          src={safeStory.coverImage}
          alt={safeStory.title}
          className="w-full h-56 object-cover"
          onError={(e) => {
            e.target.src = 'https://placehold.co/150x200/e2e8f0/1e293b?text=No+Image';
            e.target.onerror = null;
          }}
        />
        {safeStory.status === 'completed' && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            Hoàn thành
          </span>
        )}
        <button
          onClick={handleToggleBookmark}
          disabled={isLoading}
          className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          {isBookmarked ? (
            <BookmarkIcon className="text-primary-500" />
          ) : (
            <BookmarkBorderIcon className="text-primary-500" />
          )}
        </button>
      </Link>
      
      <div className="p-4">
        <Link to={`/stories/${safeStory.slug}`} className="block">
          <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-1">
            {safeStory.title}
          </h3>
        </Link>
        
        <div className="mt-1 text-sm text-gray-500">
          <span>Tác giả: </span>
          <Link to={`/authors/${safeStory.author.slug}`} className="hover:text-primary-600 transition-colors">
            {safeStory.author.name}
          </Link>
        </div>
        
        {showDescription && (
          <p className="text-gray-600 mt-2 text-sm line-clamp-3">{truncatedDescription}</p>
        )}
        
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <VisibilityIcon fontSize="small" />
            <span>{safeStory.views.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center">
            {renderStars(safeStory.rating)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCard; 