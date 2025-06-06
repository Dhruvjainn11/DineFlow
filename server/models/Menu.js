import mongoose from "mongoose";

const menuItemSchema  = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
    },
    imageUrl: String,
   category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category',
},
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const MenuItem = mongoose.model("MenuItem",menuItemSchema);
export default MenuItem;