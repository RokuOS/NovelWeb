import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/bookmarks');
      
      // Kiểm tra dữ liệu trả về và đảm bảo bookmarks là mảng
      if (response.data && response.data.data) {
        setBookmarks(response.data.data);
      } else if (Array.isArray(response.data)) {
        setBookmarks(response.data);
      } else {
        console.error('Dữ liệu đánh dấu không đúng định dạng:', response.data);
        setBookmarks([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Không thể tải danh sách đánh dấu');
      setBookmarks([]);
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (storyId) => {
    try {
      await api.delete(`/stories/${storyId}/bookmark`);
      setBookmarks(bookmarks.filter(bookmark => bookmark.story._id !== storyId));
      toast.success('Đã xóa khỏi danh sách đánh dấu');
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Không thể xóa đánh dấu');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Vui lòng đăng nhập để xem danh sách đánh dấu của bạn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Truyện đã đánh dấu</h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Bạn chưa đánh dấu truyện nào</p>
          <Link to="/stories" className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            Khám phá truyện
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <div key={bookmark._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex">
                <div className="w-1/3">
                  <Link to={`/stories/${bookmark.story._id}`}>
                    <img 
                      src={bookmark.story.coverImage?.startsWith('http') 
                        ? bookmark.story.coverImage
                        : `/uploads/${bookmark.story.coverImage || 'default-cover.jpg'}`} 
                      alt={bookmark.story.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150x200?text=Book+Cover';
                      }}
                    />
                  </Link>
                </div>
                <div className="w-2/3 p-4">
                  <h2 className="text-xl font-semibold mb-2">
                    <Link to={`/stories/${bookmark.story._id}`} className="text-gray-900 hover:text-primary-600">
                      {bookmark.story.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{bookmark.story.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Đã đánh dấu: {new Date(bookmark.addedAt).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.story._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookmarks; 