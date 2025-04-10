import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StoryCard from '../../components/StoryCard';
import Loading from '../../components/Loading';
import api from '../../utils/api';

const Search = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const params = new URLSearchParams();
        params.append('q', searchQuery);
        params.append('page', page);
        params.append('limit', 12);
        
        const response = await api.get(`/stories/search?${params.toString()}`);
        
        setResults(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Lỗi khi tìm kiếm:', err);
        setError('Đã xảy ra lỗi trong quá trình tìm kiếm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <Loading fullScreen={true} />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">
        {searchQuery 
          ? `Kết quả tìm kiếm cho: "${searchQuery}"`
          : 'Tìm kiếm'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {!loading && results.length === 0 && searchQuery && (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          <p>Không tìm thấy kết quả nào cho "{searchQuery}". Vui lòng thử lại với từ khóa khác.</p>
        </div>
      )}

      {!loading && results.length === 0 && !searchQuery && (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          <p>Vui lòng nhập từ khóa để tìm kiếm truyện.</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded ${
                    page === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  Trước
                </button>
                
                {/* Show page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show current page and neighboring pages
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded ${
                        page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded ${
                    page === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  Sau
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search; 