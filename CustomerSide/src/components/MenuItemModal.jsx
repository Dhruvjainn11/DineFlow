import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X, Plus, Minus } from "lucide-react";
import { addToCart } from "../redux/slices/cartSlice";
import { useCafe } from "../context/CafeContext";


export default function MenuItemModal({ item, onClose }) {
  const dispatch = useDispatch();
  const { cafeInfo } = useCafe();
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [finalPrice, setFinalPrice] = useState(item.price || (item.sizes && item.sizes[0]?.price) || 0);
  
  const primaryColor = cafeInfo?.theme?.primaryColor || '#F59E0B';

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
            className="w-32 h-32 object-cover mx-auto rounded-full border-4 shadow-lg"
            style={{ borderColor: `${primaryColor}20` }}
          />
        </div>

        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2"
              style={{ color: primaryColor }}>
            {item.name}
            {item.jain && (
              <span className="bg-green-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                J
              </span>
            )}
          </h2>
        </div>

        <p className="text-center text-sm mb-4" style={{ color: `${primaryColor}cc` }}>{item.description}</p>
        
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="mb-4 text-center">
            <h3 className="font-semibold" style={{ color: primaryColor }}>Ingredients</h3>
            <p className="text-sm" style={{ color: `${primaryColor}cc` }}>{item.ingredients.join(', ')}</p>
          </div>
        )}

        {item.sizes && item.sizes.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2" style={{ color: primaryColor }}>Choose Size:</h3>
            <div className="flex flex-wrap gap-2">
              {item.sizes.map((size) => (
                <button
                  key={size._id}
                  onClick={() => handleSizeChange(size)}
                  className="px-4 py-2 rounded-full border transition-colors"
                  style={{
                    backgroundColor: selectedSize?._id === size._id ? primaryColor : 'white',
                    color: selectedSize?._id === size._id ? 'white' : primaryColor,
                    borderColor: selectedSize?._id === size._id ? primaryColor : `${primaryColor}40`
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSize?._id !== size._id) {
                      e.target.style.backgroundColor = `${primaryColor}10`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSize?._id !== size._id) {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
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
              className="p-1 rounded-full transition-colors"
              style={{ 
                backgroundColor: `${primaryColor}20`,
                color: primaryColor
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = `${primaryColor}30`}
              onMouseLeave={(e) => e.target.style.backgroundColor = `${primaryColor}20`}
            >
              <Minus size={16} />
            </button>
            <span className="text-lg font-bold" style={{ color: primaryColor }}>{quantity}</span>
            <button
              onClick={handleIncrement}
              className="p-1 rounded-full transition-colors"
              style={{ 
                backgroundColor: `${primaryColor}20`,
                color: primaryColor
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = `${primaryColor}30`}
              onMouseLeave={(e) => e.target.style.backgroundColor = `${primaryColor}20`}
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className="px-6 py-2 text-white font-bold rounded-full shadow-md transition-colors"
            style={{ backgroundColor: primaryColor }}
            onMouseEnter={(e) => e.target.style.backgroundColor = `${primaryColor}dd`}
            onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
          >
            Add to Cart (₹{finalPrice * quantity})
          </button>
        </div>
      </div>
    </div>
  );
}