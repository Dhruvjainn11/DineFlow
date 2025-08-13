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

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
export default MenuItem;