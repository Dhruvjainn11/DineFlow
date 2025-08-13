import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { _id, name, price, imageUrl, selectedSize, quantity = 1, remark = "" } = action.payload;

      // The unique ID for the frontend cart
      const cartItemId = selectedSize ? `${_id}-${selectedSize.label}` : _id;
      
      const existing = state.items.find(i => i.cartItemId === cartItemId);
      
      if (existing) {
          existing.quantity += quantity;
      } else {
          state.items.push({ 
              _id, // <-- Always use the original ObjectId here
              cartItemId, // <-- The unique string for the UI
              name,
              price,
              imageUrl,
              selectedSize,
              quantity,
              remark
          });
      }
    },
    removeFromCart: (state, action) => {
      // Use the unique cartItemId to filter out the correct item
      state.items = state.items.filter(i => i.cartItemId !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    updateQty: (state, action) => {
      const { id, quantity } = action.payload;
      // Use the unique cartItemId to find the correct item
      const item = state.items.find(i => i.cartItemId === id);
      if (item) item.quantity = quantity;
    },
    updateRemark: (state, action) => {
      const { id, remark } = action.payload;
      const item = state.items.find(i => i.cartItemId === id);
      if (item) item.remark = remark;
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateQty, updateRemark } = cartSlice.actions;
export default cartSlice.reducer;