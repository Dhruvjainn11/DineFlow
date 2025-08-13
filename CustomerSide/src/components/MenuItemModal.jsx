import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X, Plus, Minus } from "lucide-react";
import { addToCart } from "../redux/slices/cartSlice"; // Assuming you have this action


export default function MenuItemModal({ item, onClose }) {
  const dispatch = useDispatch();
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [finalPrice, setFinalPrice] = useState(item.price || (item.sizes && item.sizes[0]?.price) || 0);

  useEffect(() => {
    // If the item has sizes, set the default price to the first size's price.
    if (item.sizes && item.sizes.length > 0) {
      setFinalPrice(item.sizes[0].price);
    } else {
      setFinalPrice(item.price);
    }
  }, [item]);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setFinalPrice(size.price);
  };

  const handleAddToCart = () => {
    // Important: do NOT mutate _id. The backend expects a real ObjectId for menuItem.
    // cartSlice will generate a unique cartItemId using selectedSize to distinguish items in the UI.
    const itemToAdd = {
      ...item,
      price: finalPrice,
      quantity,
      selectedSize,
    };
    dispatch(addToCart(itemToAdd));
    onClose();
  };

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };
  
  const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") {
      onClose();
    }
  };

  return (
    <div
      id="modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-lg p-6 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-4">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-32 h-32 object-cover mx-auto rounded-full border-4 border-amber-100 shadow-lg"
          />
        </div>

        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-center text-amber-900 flex items-center justify-center gap-2">
            {item.name}
            {item.jain && (
              <span className="bg-green-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                J
              </span>
            )}
          </h2>
        </div>

        <p className="text-center text-sm text-amber-700 mb-4">{item.description}</p>
        
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="mb-4 text-center">
            <h3 className="font-semibold text-amber-900">Ingredients</h3>
            <p className="text-sm text-amber-700">{item.ingredients.join(', ')}</p>
          </div>
        )}

        {item.sizes && item.sizes.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-amber-900 mb-2">Choose Size:</h3>
            <div className="flex flex-wrap gap-2">
              {item.sizes.map((size) => (
                <button
                  key={size._id}
                  onClick={() => handleSizeChange(size)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    selectedSize?._id === size._id
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-amber-900 border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  {size.label} (₹{size.price})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDecrement}
              className="p-1 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="text-lg font-bold text-amber-800">{quantity}</span>
            <button
              onClick={handleIncrement}
              className="p-1 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className="px-6 py-2 bg-amber-600 text-white font-bold rounded-full shadow-md hover:bg-amber-700 transition-colors"
          >
            Add to Cart (₹{finalPrice * quantity})
          </button>
        </div>
      </div>
    </div>
  );
}