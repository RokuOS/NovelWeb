import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  FilterAlt as FilterIcon,
  Sort as SortIcon 
} from '@mui/icons-material';
import StoryCard from '../../components/StoryCard';
import Loading from '../../components/Loading';
import api from '../../utils/api';

const StoryList = ({ initialFilter = {}, showCategoryFilter = false }) => {
  const { categoryId } = useParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: categoryId || initialFilter.category || '',
    status: initialFilter.status || '',
    sort: initialFilter.sort || 'newest'
  });
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    // Cập nhật lại filter nếu categoryId từ route params thay đổi
    if (categoryId) {
      setFilters(prev => ({
        ...prev,
        category: categoryId
      }));
    }
  }, [categoryId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data);
        
        // Nếu có categoryId, tìm thông tin category đó để hiển thị
        if (categoryId) {
          const foundCategory = response.data.data.find(cat => cat._id === categoryId || cat.slug === categoryId);
          if (foundCategory) {
            setActiveCategory(foundCategory);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, [categoryId]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        
        // Tạo query string từ filter
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', 12);
        
        if (filters.category) {
          queryParams.append('category', filters.category);
        }
        
        if (filters.status) {
          queryParams.append('status', filters.status);
        }
        
        if (filters.sort) {
          queryParams.append('sort', filters.sort);
        }
        
        const response = await api.get(`/stories?${queryParams.toString()}`);
        
        setStories(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Đã xảy ra lỗi khi tải danh sách truyện');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [page, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset về trang đầu tiên khi thay đổi filter
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && page === 1) {
    return <Loading fullScreen={true} />;
  }

  return (
    <div className="container mx-auto py-8">
      {/* Dynamic title based on filters or active category */}
      {activeCategory ? (
        <h1 className="text-3xl font-bold mb-8">Thể loại: {activeCategory.name}</h1>
      ) : filters.status === 'completed' ? (
        <h1 className="text-3xl font-bold mb-8">Truyện đã hoàn thành</h1>
      ) : filters.sort === 'popular' ? (
        <h1 className="text-3xl font-bold mb-8">Truyện thịnh hành</h1>
      ) : filters.sort === 'newest' && !filters.category && !filters.status ? (
        <h1 className="text-3xl font-bold mb-8">Truyện mới cập nhật</h1>
      ) : (
        <h1 className="text-3xl font-bold mb-8">Danh sách truyện</h1>
      )}
      
      {/* Category buttons for category page */}
      {showCategoryFilter && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold">Thể loại truyện</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link 
                key={category._id} 
                to={`/categories/${category.slug || category._id}`}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filters.category === category._id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex items-center mb-4">
          <FilterIcon className="text-primary-600 mr-2" />
          <h2 className="text-xl font-semibold">Bộ lọc</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!activeCategory && (
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Thể loại
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="form-select w-full rounded-md border-gray-300"
              >
                <option value="">Tất cả thể loại</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-select w-full rounded-md border-gray-300"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ongoing">Đang tiến hành</option>
              <option value="completed">Hoàn thành</option>
              <option value="dropped">Tạm ngưng</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sắp xếp theo
            </label>
            <select
              id="sort"
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="form-select w-full rounded-md border-gray-300"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Story Grid */}
      {error ? (
        <div className="bg-red-100 p-4 rounded-md text-red-600 mb-6">{error}</div>
      ) : (
        <>
          {loading && page > 1 ? (
            <div className="py-12 flex justify-center">
              <Loading />
            </div>
          ) : stories.length === 0 ? (
            <div className="bg-gray-100 p-8 rounded-md text-center">
              <p className="text-lg text-gray-600 mb-4">Không tìm thấy truyện nào phù hợp với bộ lọc.</p>
              <button
                onClick={() => setFilters({ category: '', status: '', sort: 'newest' })}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {stories.map((story) => (
                <StoryCard key={story._id} story={story} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {stories.length > 0 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (page <= 3) {
                    pageNumber = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1 rounded-md ${
                        pageNumber === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoryList; 