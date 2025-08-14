import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cafeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

// Create compound index for unique category names per cafe
categorySchema.index({ name: 1, cafeId: 1 }, { unique: true });
categorySchema.index({ cafeId: 1, sortOrder: 1 });
categorySchema.index({ cafeId: 1, isActive: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;
