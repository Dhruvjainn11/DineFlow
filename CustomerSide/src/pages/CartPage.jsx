import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQty, clearCart } from "../redux/slices/cartSlice";
import { FiChevronLeft, FiTrash2, FiPlus, FiMinus, FiShoppingCart } from "react-icons/fi";
import api from "../utils/api";
import { toast } from 'react-toastify';
import CustomerFooter from "../components/CustomerFooter";

export default function CartPage() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
const cartItems = useSelector((state) => state.cart?.items || []);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const totalPrice = (cartItems || []).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) {
      dispatch(removeFromCart(item._id));
    } else {
      dispatch(updateQty({ id: item._id, quantity: newQuantity }));
    }
  };

const handlePlaceOrder = async () => {
  if (cartItems.length === 0) return;
  
  setIsPlacingOrder(true);
  try {
    // Ensure tableId is a number
    const tableNum = Number(tableId);
    
    const orderData = {
      tableNumber: tableNum, // Send as number
      items: cartItems.map(item => ({
        menuItem: item._id,
        quantity: item.quantity
      }))
    };

    const response = await api.post("/orders", orderData);
    toast.success("Order placed successfully!",response);
    dispatch(clearCart());
    
  } catch (err) {
    console.error("Order error:", err.response?.data || err.message);
    toast.error(err.response?.data?.error || "Failed to place order");
  } finally {
    setIsPlacingOrder(false);
  }
};  
  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-100 flex items-center">
        <button
          onClick={() => navigate(`/table/${tableId}`)}
          className="bg-amber-500 p-2 rounded-full hover:bg-indigo-50"
        >
          <FiChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-center flex-1 text-amber-500">
          Your Cart
        </h1>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-amber-700 p-2 rounded-full hover:bg-red-50 text-sm font-medium"
          disabled={cartItems.length === 0}
        >
          Clear
        </button>
      </div>

      {/* Cart Items */}
      <div className="p-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-10">
            <FiShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">Your cart is empty</p>
            <button
              onClick={() => navigate(`/table/${tableId}`)}
              className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-700"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      ₹{item.price} × {item.quantity}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-amber-500">
                        ₹{item.price * item.quantity}
                      </p>
                      <div className="flex items-center space-x-2 bg-indigo-50 rounded-full px-2">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="p-1 text-amber-500 hover:text-amber-700"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="text-sm font-medium text-amber-500">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="p-1 text-amber-500 hover:text-amber-700"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
              <h3 className="font-bold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{totalPrice}</span>
                </div>
               
                <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-amber-500">
                    ₹{(totalPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || cartItems.length === 0}
              className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-700 disabled:bg-amber-300"
            >
              {isPlacingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </>
        )}
      </div>
      {/* Footer Navigation */}
      <CustomerFooter />
    </div>
  );
}