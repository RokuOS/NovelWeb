const mongoose = require('mongoose');

const StoryCategorySchema = new mongoose.Schema({
  story: {
    type: mongoose.Schema.ObjectId,
    ref: 'Story',
    required: true
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true
  }
});

// Create compound index to ensure uniqueness of story-category pairs
StoryCategorySchema.index({ story: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('StoryCategory', StoryCategorySchema); 