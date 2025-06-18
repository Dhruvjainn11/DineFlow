import { configureStore } from '@reduxjs/toolkit';
import tableReducer from './slices/tableSlice';
import cartReducer from './slices/cartSlice';

// Load cart from localStorage
const loadCartFromLocalStorage = () => {
  try {
    const serialized = localStorage.getItem('cart');
    if (!serialized) return undefined;

    const parsed = JSON.parse(serialized);
    // Validate it's an object and has items array
    if (parsed && Array.isArray(parsed.items)) {
      return parsed;
    }
    return undefined;
  } catch (e) {
    console.warn('Error loading cart from localStorage', e);
    return undefined;
  }
};


// Save cart to localStorage
const saveCartToLocalStorage = (cartState) => {
  try {
    const serialized = JSON.stringify(cartState);
    localStorage.setItem('cart', serialized);
  } catch (e) {
    console.warn('Error saving cart to localStorage', e);
  }
};

const preloadedCart = loadCartFromLocalStorage();

export const store = configureStore({
  reducer: {
    table: tableReducer,
    cart: cartReducer,
  },
  preloadedState: {
    cart: preloadedCart || { items: [] },
  },
});

// Subscribe to changes and save cart only
store.subscribe(() => {
  const { cart } = store.getState();
  saveCartToLocalStorage(cart);
});
