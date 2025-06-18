import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setTableId } from "../redux/slices/tableSlice";
import { addToCart, removeFromCart } from "../redux/slices/cartSlice";
import api from "../utils/api";
import { FiHome, FiShoppingCart, FiClock, FiCreditCard, FiSearch, FiPlus, FiMinus } from "react-icons/fi";
import CustomerFooter from "../components/CustomerFooter";

export default function MenuPage() {
  const { tableId } = useParams();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(setTableId(tableId));

    const fetchData = async () => {
      try {
        const menuRes = await api.get("/menu");
        setMenus(menuRes.data);
      } catch (err) {
        console.error("Failed to fetch menu data", err);
      }
    };

    fetchData();
  }, [tableId, dispatch]);

  const filteredMenus = menus.filter(menu => 
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getItemQuantity = (itemId) => {
    if (!cartItems) return 0;
    const itemInCart = cartItems.find(item => item._id === itemId);
    return itemInCart ? itemInCart.quantity : 0;
  };

  const handleRemoveFromCart = (item) => {
    const itemInCart = cartItems.find(cartItem => cartItem._id === item._id);
    if (itemInCart && itemInCart.quantity > 1) {
      dispatch({
        type: 'cart/updateQty',
        payload: { id: item._id, quantity: itemInCart.quantity - 1 }
      });
    } else {
      dispatch(removeFromCart(item._id));
    }
  };

  return (
    <div className="max-w-[480px] mx-auto bg-amber-50 min-h-screen pb-16">
      {/* Header with Search */}
      <div className="sticky top-0 z-10 bg-white shadow-sm p-4 border-b border-amber-100">
        <h1 className="text-2xl font-bold text-center text-amber-900 mb-4">DineFlow Menu</h1>
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-amber-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 mt-5 grid grid-cols-2 gap-4">
        {filteredMenus.map((item) => {
          const quantity = getItemQuantity(item._id);
          return (
            <div key={item._id} className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02] border border-amber-100 hover:shadow-md">
              <div className="relative pt-[100%]">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="absolute top-0 left-6 w-36 h-36 object-fit rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <div className="relative bottom-6 p-3">
                <h2 className="font-semibold text-base text-amber-900 truncate">{item.name}</h2>
                <p className="text-sm text-amber-700 mb-1 truncate">{item.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-bold text-amber-600">₹{item.price}</p>
                  {quantity > 0 ? (
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-1 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
                        onClick={() => handleRemoveFromCart(item)}
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="text-sm font-medium text-amber-800">{quantity}</span>
                      <button 
                        className="p-1 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
                        onClick={() => dispatch(addToCart(item))}
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm rounded-full hover:from-amber-600 hover:to-amber-700 transition-colors shadow-sm"
                      onClick={() => dispatch(addToCart(item))}
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <CustomerFooter />
    </div>
  );
}