import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};



const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
   addToCart: (state, action) => {
  const item = action.payload;
  if (!item || !item._id) return;

  const existing = state.items.find(i => i._id === item._id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.items.push({ ...item, quantity: 1 }); // 👈 correct default quantity
  }
},



    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    updateQty: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(i => i._id === id);
      if (item) item.quantity = quantity;
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateQty } = cartSlice.actions;
export default cartSlice.reducer;
