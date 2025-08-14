// server/models/Menu.js
import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g., "Small", "300ml"
  price: { type: Number, required: true }, // e.g., 5.99
  available: { type: Boolean, default: true },
});

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    imageUrl: String,
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cafe',
      required: true,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    // Base price is optional if sizes are provided
    price: { type: Number },
    available: { type: Boolean, default: true },
    jain: { type: Boolean, default: false }, // New field for Jain availability
    
    // Now just an array of strings for display
    ingredients: [{ type: String }],
    
    sizes: [sizeSchema],
    
    // Additional fields for better menu management
    sortOrder: { type: Number, default: 0 },
    isPopular: { type: Boolean, default: false },
    isSpecial: { type: Boolean, default: false },
    nutritionInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number
    },
    tags: [{ type: String }], // e.g., ['spicy', 'vegetarian', 'gluten-free']
    preparationTime: { type: Number }, // in minutes
    spicyLevel: { type: Number, min: 0, max: 5 }, // 0 = not spicy, 5 = very spicy
  },
  { timestamps: true }
);

// We still keep the pre-save hook for validation
menuItemSchema.pre('validate', function(next) {
  if (!this.price && (!this.sizes || this.sizes.length === 0)) {
    this.invalidate('price', 'Either a base price or at least one size must be provided.');
  }
  next();
});

// Indexes for better performance
menuItemSchema.index({ cafeId: 1, category: 1 });
menuItemSchema.index({ cafeId: 1, available: 1 });
menuItemSchema.index({ cafeId: 1, isPopular: 1 });
menuItemSchema.index({ cafeId: 1, sortOrder: 1 });
menuItemSchema.index({ cafeId: 1, name: 1 });
menuItemSchema.index({ tags: 1 });

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
export default MenuItem;
