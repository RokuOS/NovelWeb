import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      if (response.data && response.data.data) {
        setCategories(response.data.data);
      } else {
        setCategories([]);
        console.error('Unexpected API response format:', response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách thể loại');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const response = await api.post('/categories', { name: newCategory });
      if (response.data && response.data.data) {
        setCategories([...categories, response.data.data]);
      } else if (response.data) {
        setCategories([...categories, response.data]);
      }
      setNewCategory('');
      toast.success('Thêm thể loại thành công');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Không thể thêm thể loại');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory({
      id: category._id,
      name: category.name
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCategory.name.trim()) return;

    try {
      await api.put(`/categories/${editingCategory.id}`, { name: editingCategory.name });
      setCategories(categories.map(cat => 
        cat._id === editingCategory.id ? { ...cat, name: editingCategory.name } : cat
      ));
      setEditingCategory(null);
      toast.success('Cập nhật thể loại thành công');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Không thể cập nhật thể loại');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      try {
        await api.delete(`/categories/${id}`);
        setCategories(categories.filter(cat => cat._id !== id));
        toast.success('Xóa thể loại thành công');
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Không thể xóa thể loại');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý thể loại</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Thêm thể loại mới</h2>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Tên thể loại"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
          >
            Thêm
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Chưa có thể loại nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên thể loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(category => (
                <tr key={category._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingCategory && editingCategory.id === category._id ? (
                      <form onSubmit={handleUpdate} className="flex space-x-2">
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
                        >
                          Hủy
                        </button>
                      </form>
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {!(editingCategory && editingCategory.id === category._id) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
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

export default Categories; 