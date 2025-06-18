import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiHome, FiShoppingCart, FiClock, FiCreditCard } from "react-icons/fi";
import { useSelector } from "react-redux";

export default function CustomerFooter() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const cartItems = useSelector((state) => state.cart.items);

  const totalQuantity = (cartItems || []).reduce((acc, item) => acc + item.quantity, 0);


  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-200 flex justify-around items-center p-3 z-50">
      <button 
        className="flex flex-col items-center text-gray-500 "
        onClick={() => navigate(`/table/${tableId}`)}
      >
        <FiHome size={20} />
        <span className="text-xs mt-1">Home</span>
      </button>

      <button 
        className="flex flex-col items-center text-gray-500"
        onClick={() => navigate(`/table/${tableId}/cart`)}
      >
        <div className="relative">
          <FiShoppingCart size={20} />
          {totalQuantity > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalQuantity}
            </span>
          )}
        </div>
        <span className="text-xs mt-1">Cart</span>
      </button>

      <button 
        className="flex flex-col items-center text-gray-500"
        onClick={() => navigate(`/table/${tableId}/orders`)}
      >
        <FiClock size={20} />
        <span className="text-xs mt-1">Orders</span>
      </button>

      <button 
        className="flex flex-col items-center text-gray-500"
        onClick={() => navigate(`/table/${tableId}/payment`)}
      >
        <FiCreditCard size={20} />
        <span className="text-xs mt-1">Payment</span>
      </button>
    </div>
  );
}
