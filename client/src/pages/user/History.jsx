import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/reading-history');
      setHistory(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reading history:', error);
      toast.error('Không thể tải lịch sử đọc truyện');
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử đọc?')) {
      try {
        await api.delete('/users/reading-history');
        setHistory([]);
        toast.success('Đã xóa lịch sử đọc truyện');
      } catch (error) {
        console.error('Error clearing reading history:', error);
        toast.error('Không thể xóa lịch sử đọc truyện');
      }
    }
  };

  const handleRemoveFromHistory = async (entryId) => {
    try {
      await api.delete(`/users/reading-history/${entryId}`);
      setHistory(history.filter(entry => entry._id !== entryId));
      toast.success('Đã xóa khỏi lịch sử đọc');
    } catch (error) {
      console.error('Error removing history entry:', error);
      toast.error('Không thể xóa mục khỏi lịch sử');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Vui lòng đăng nhập để xem lịch sử đọc truyện của bạn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lịch sử đọc truyện</h1>
        {history.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Xóa lịch sử
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Bạn chưa đọc truyện nào</p>
          <Link to="/stories" className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            Khám phá truyện
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truyện</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chương</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((entry) => (
                <tr key={entry._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/stories/${entry.story._id}`} className="text-primary-600 hover:text-primary-800">
                      {entry.story.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/chapters/${entry.chapter._id}`} className="text-blue-600 hover:text-blue-800">
                      {entry.chapter.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.lastRead).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleRemoveFromHistory(entry._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History; 