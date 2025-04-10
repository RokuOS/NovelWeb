import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp as TrendingIcon, 
  Bookmark as BookmarkIcon,
  NewReleases as NewIcon,
  LocalFireDepartment as HotIcon,
  Star as StarIcon
} from '@mui/icons-material';
import StoryCard from '../components/StoryCard';
import Loading from '../components/Loading';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredStories, setFeaturedStories] = useState([]);
  const [trendingStories, setTrendingStories] = useState([]);
  const [newStories, setNewStories] = useState([]);
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featuredRes, trendingRes, newRes, completedRes] = await Promise.all([
          api.get('/stories/featured?limit=5'),
          api.get('/stories/trending?limit=6'),
          api.get('/stories/latest?limit=8'),
          api.get('/stories/completed?limit=4')
        ]);

        // Kiểm tra và xử lý dữ liệu an toàn
        setFeaturedStories(Array.isArray(featuredRes.data?.data) ? featuredRes.data.data : []);
        setTrendingStories(Array.isArray(trendingRes.data?.data) ? trendingRes.data.data : []);
        setNewStories(Array.isArray(newRes.data?.data) ? newRes.data.data : []);
        setCompletedStories(Array.isArray(completedRes.data?.data) ? completedRes.data.data : []);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading fullScreen={true} />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pt-16 md:pt-0">
      {/* Hero Banner with featured stories */}
      <section className="relative">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-700 rounded-xl overflow-hidden">
          <div className="container mx-auto py-12 px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-white space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold">
                  Khám phá thế giới truyện chữ
                </h1>
                <p className="text-lg md:text-xl opacity-90">
                  Hàng ngàn tác phẩm đặc sắc từ nhiều thể loại đang chờ bạn khám phá
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/new"
                    className="px-6 py-3 bg-white text-primary-600 font-medium rounded-md hover:bg-gray-100 transition"
                  >
                    Khám phá ngay
                  </Link>
                  <Link
                    to="/categories"
                    className="px-6 py-3 bg-transparent text-white border border-white font-medium rounded-md hover:bg-white/10 transition"
                  >
                    Xem thể loại
                  </Link>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  {featuredStories.slice(0, 4).map((story, index) => (
                    <div
                      key={story._id}
                      className={`${
                        index % 2 === 0 ? 'transform translate-y-4' : ''
                      }`}
                    >
                      <Link to={`/stories/${story._id}`} className="block">
                        <img
                          src={
                            story.coverImage 
                              ? (story.coverImage.startsWith('http') 
                                  ? story.coverImage 
                                  : `http://localhost:5001/uploads/${story.coverImage}`)
                              : 'https://placehold.co/150x200/e2e8f0/1e293b?text=NovelRead'
                          }
                          alt={story.title || 'Ảnh bìa truyện'}
                          className="w-full h-[180px] object-cover rounded-lg shadow-lg transition-transform hover:scale-105"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/150x200/e2e8f0/1e293b?text=No+Image';
                            e.target.onerror = null;
                          }}
                        />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Stories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <TrendingIcon className="mr-2 text-primary-500" />
            Truyện thịnh hành
          </h2>
          <Link
            to="/trending"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Xem tất cả
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingStories.map((story) => (
            <StoryCard key={story._id} story={story} horizontal />
          ))}
        </div>
      </section>

      {/* New Stories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <NewIcon className="mr-2 text-primary-500" />
            Truyện mới cập nhật
          </h2>
          <Link
            to="/new"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Xem tất cả
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {newStories.map((story) => (
            <StoryCard key={story._id} story={story} />
          ))}
        </div>
      </section>

      {/* Completed Stories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <StarIcon className="mr-2 text-primary-500" />
            Truyện đã hoàn thành
          </h2>
          <Link
            to="/completed"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Xem tất cả
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {completedStories.map((story) => (
            <StoryCard key={story._id} story={story} showDescription />
          ))}
        </div>
      </section>

      {/* Call to Action - Chỉ hiển thị khi chưa đăng nhập */}
      {!isAuthenticated && (
        <section className="bg-gray-100 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Tham gia cộng đồng NovelRead</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Đăng ký tài khoản để theo dõi truyện yêu thích, lưu lịch sử đọc và nhận thông báo khi có chương mới
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition"
            >
              Đăng ký ngay
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-transparent text-primary-600 border border-primary-600 font-medium rounded-md hover:bg-primary-50 transition"
            >
              Đăng nhập
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home; 