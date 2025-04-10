const Story = require('../models/Story');
const User = require('../models/User');
const Chapter = require('../models/Chapter');

// Lấy thống kê tổng quan
exports.getStats = async (req, res) => {
  try {
    const [totalStories, totalUsers, totalChapters, totalViews] = await Promise.all([
      Story.countDocuments(),
      User.countDocuments(),
      Chapter.countDocuments(),
      Story.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalStories,
        totalUsers,
        totalChapters,
        totalViews: totalViews[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê'
    });
  }
};

// Lấy danh sách truyện gần đây
exports.getRecentStories = async (req, res) => {
  try {
    const stories = await Story.find()
      .sort({ created_at: -1 })
      .limit(5)
      .select('title created_at');

    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    console.error('Error getting recent stories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách truyện gần đây'
    });
  }
};

// Lấy danh sách người dùng gần đây
exports.getRecentUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ created_at: -1 })
      .limit(5)
      .select('username email created_at');

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error getting recent users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách người dùng gần đây'
    });
  }
}; 