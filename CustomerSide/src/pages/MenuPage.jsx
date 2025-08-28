// MenuPage.jsx

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setTableId } from "../redux/slices/tableSlice";
import { addToCart, removeFromCart } from "../redux/slices/cartSlice";
import api from "../utils/api";
import { FiSearch, FiPlus, FiMinus, FiX } from "react-icons/fi";
import CustomerFooter from "../components/CustomerFooter";
import MenuItemModal from "../components/MenuItemModal";
import { useCafe } from "../context/CafeContext";

export default function MenuPage() {
  const { cafeId, tableId } = useParams();
  const { cafeInfo } = useCafe();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [tableStatus, setTableStatus] = useState(null);
  const [existingOrder, setExistingOrder] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    cafeId,
    tableId,
    apiCalls: [],
    errors: [],
    loadingStates: {}
  });
  const categoryRefs = useRef({});
  
  const addDebugInfo = (type, data) => {
    setDebugInfo(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), { timestamp: new Date().toISOString(), ...data }]
    }));
  };

  useEffect(() => {
    dispatch(setTableId(tableId));

    const fetchData = async () => {
      addDebugInfo('apiCalls', { action: 'fetchData_start', cafeId, tableId });
      
      try {
        // Check for existing orders on this table
        addDebugInfo('apiCalls', { action: 'fetching_orders', url: `/orders?tableId=${tableId}&status=active` });
        try {
          const ordersRes = await api.get(`/orders?tableId=${tableId}&status=active`);
          addDebugInfo('apiCalls', { action: 'orders_success', data: ordersRes.data });
          
          const activeOrders = ordersRes.data.data || [];
          const activeOrder = activeOrders.find(order => 
            order.status !== 'PAID' && order.status !== 'SERVED' && order.status !== 'Cancelled'
          );
          
          if (activeOrder) {
            setExistingOrder(activeOrder);
            addDebugInfo('apiCalls', { action: 'existing_order_found', order: activeOrder });
          }
        } catch (orderErr) {
          addDebugInfo('errors', { action: 'orders_failed', error: orderErr.message, response: orderErr.response?.data });
        }
        
        // fetch menus & categories by cafeId
        addDebugInfo('apiCalls', { action: 'fetching_menu_categories', cafeId });
        const [menuRes, categoriesRes] = await Promise.all([
          api.get(`/menu?cafeId=${cafeId}`),
          api.get(`/categories?cafeId=${cafeId}`),
        ]);

        addDebugInfo('apiCalls', { action: 'menu_success', menuCount: menuRes.data.data?.length, categoryCount: categoriesRes.data.data?.length });
        setMenus(menuRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (err) {
        addDebugInfo('errors', { action: 'fetchData_failed', error: err.message, response: err.response?.data });
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, [tableId, dispatch]);

  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(menu => menu.available !== false); // Only show available items

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c._id === categoryId);
    return cat ? cat.name : "Others";
  };

  const getCategoryById = (categoryId) => {
    return categories.find(c => c._id === categoryId);
  };

  // Group by category ID - handle both populated and unpopulated category data
  const groupedMenus = filteredMenus.reduce((acc, item) => {
    // Handle both populated category object and category ID string
    const categoryId = item.category && typeof item.category === 'object' 
      ? item.category._id 
      : item.category;
    
    if (!acc[categoryId]) acc[categoryId] = [];
    acc[categoryId].push(item);
    return acc;
  }, {});

  const getItemQuantity = (itemId) => {
    if (!cartItems) return 0;
    const itemInCart = cartItems.find(item => item._id === itemId);
    return itemInCart ? itemInCart.quantity : 0;
  };

  const handleRemoveFromCart = (item) => {
    const itemInCart = cartItems.find(cartItem => item.selectedSize 
      ? cartItem.cartItemId === `${item._id}-${item.selectedSize.label}`
      : cartItem._id === item._id
    );
    if (itemInCart && itemInCart.quantity > 1) {
      dispatch({
        type: 'cart/updateQty',
        payload: { id: itemInCart.cartItemId, quantity: itemInCart.quantity - 1 }
      });
    } else {
      dispatch(removeFromCart(itemInCart.cartItemId));
    }
  };

  const handleAddToCart = (item, size = null) => {
    if (item.sizes && item.sizes.length > 0 && !size) {
      setSelectedItem(item);
      return;
    }
    dispatch(addToCart({ ...item, selectedSize: size }));
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleItemClick = (item) => {
    setDetailItem(item);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setDetailItem(null);
  };

  const scrollToCategory = (categoryId) => {
    const category = getCategoryById(categoryId);
    setActiveCategory(categoryId);
    const element = categoryRefs.current[categoryId];
    if (element) {
      const headerHeight = 200; // Approximate header height
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    }
  };

  // Show existing order notification if there's an active order
  if (existingOrder) {
    return (
      <div className="max-w-[480px] mx-auto bg-theme-secondary min-h-screen pb-16">
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Table Already Has an Active Order</h2>
            <p className="text-yellow-700 mb-3">
              This table already has an order in progress (Order #{existingOrder._id.slice(-6)}). 
              Status: <span className="font-medium">{existingOrder.status}</span>
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setExistingOrder(null)}
                className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark"
              >
                Place New Order
              </button>
              <button 
                onClick={() => window.location.href = `/cafe/${cafeId}/table/${tableId}/orders`}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                View Existing Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Debug panel (remove in production)
  const showDebug = new URLSearchParams(window.location.search).get('debug') === 'true';
  
  return (
    <div className="max-w-[480px] mx-auto bg-theme-secondary min-h-screen pb-16">
      {/* Debug Panel */}
      {showDebug && (
        <div className="bg-black text-white p-4 text-xs overflow-auto max-h-96 sticky top-0 z-50">
          <h3 className="font-bold mb-2">DEBUG INFO (add ?debug=true to URL)</h3>
          <div className="space-y-2">
            <div><strong>Cafe ID:</strong> {cafeId}</div>
            <div><strong>Table ID:</strong> {tableId}</div>
            <div><strong>Menus Count:</strong> {menus.length}</div>
            <div><strong>Categories Count:</strong> {categories.length}</div>
            <div><strong>Existing Order:</strong> {existingOrder ? 'YES' : 'NO'}</div>
            <div><strong>Theme Primary:</strong> {getComputedStyle(document.documentElement).getPropertyValue('--theme-primary')}</div>
            
            <details>
              <summary className="cursor-pointer font-bold">API Calls ({debugInfo.apiCalls.length})</summary>
              <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo.apiCalls, null, 2)}</pre>
            </details>
            
            <details>
              <summary className="cursor-pointer font-bold text-red-400">Errors ({debugInfo.errors.length})</summary>
              <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo.errors, null, 2)}</pre>
            </details>
            
            <details>
              <summary className="cursor-pointer font-bold">Cafe Context</summary>
              <pre className="text-xs overflow-auto">{JSON.stringify({ cafeInfo: cafeInfo }, null, 2)}</pre>
            </details>
          </div>
        </div>
      )}
      {/* Header with Search */}
      <div className={`sticky top-0 z-20 bg-theme-secondary  shadow-sm border-b border-theme-primary-100 `}>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-center text-theme-primary mb-4">The Annsh Menu</h1>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-theme-primary" />
            <input
              type="text"
              placeholder="Search menu items..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-theme-primary-200 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <button
              onClick={() => scrollToCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'all' || !activeCategory
                  ? 'bg-theme-primary text-white'
                  : 'bg-theme-primary-100 text-theme-primary hover:bg-theme-primary-200'
              }`}
            >
              All Items
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => scrollToCategory(category._id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category._id
                    ? 'bg-theme-primary text-white'
                    : 'bg-theme-primary-100 text-theme-primary hover:bg-theme-primary-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grouped by Category */}
      <div className="p-4 mt-2 space-y-8">
        {Object.entries(groupedMenus).map(([categoryId, items]) => {
          const category = getCategoryById(categoryId);
          const categoryName = category ? category.name : "Others";
          
          return (
            <section 
              key={categoryId} 
              ref={(el) => categoryRefs.current[categoryId] = el}
              className="scroll-mt-52"
            >
              <h2 className="text-xl font-bold text-theme-primary mb-4 flex items-center">
                <span className="bg-theme-primary w-1 h-6 rounded-full mr-3"></span>
                {categoryName}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {items.map((item) => {
                  const quantity = getItemQuantity(item._id);
                  const displayPrice = item.sizes && item.sizes.length > 0
                    ? `From ₹${item.sizes.reduce((min, s) => s.price < min ? s.price : min, Infinity)}`
                    : `₹${item.price}`;

                  return (
                    <div
                      key={item._id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02] border border-theme-primary-100 hover:shadow-md cursor-pointer"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="relative pt-[100%]">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-36 object-cover rounded-full border-4 border-white shadow-lg"
                        />
                        {/* Jain Indicator */}
                        {item.jain && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                            J
                          </div>
                        )}
                      </div>
                      <div className="relative bottom-6 p-3">
                        <h2 className="font-semibold text-base text-theme-primary truncate">{item.name}</h2>
                        <p className="text-sm text-theme-primary-dark mb-1 truncate">{item.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="font-bold text-theme-primary">{displayPrice}</p>
                          {quantity > 0 ? (
                            <div className="flex items-center space-x-2">
                              <button
                                className="p-1 bg-theme-primary-100 text-theme-primary rounded-full hover:bg-theme-primary-200 transition-colors"
                                onClick={(e) => { e.stopPropagation(); handleRemoveFromCart(item); }}
                              >
                                <FiMinus size={14} />
                              </button>
                              <span className="text-sm font-medium text-theme-primary">{quantity}</span>
                              <button
                                className="p-1 bg-theme-primary-100 text-theme-primary rounded-full hover:bg-theme-primary-200 transition-colors"
                                onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              className="px-3 py-1 bg-theme-primary text-white text-sm rounded-full hover:bg-theme-primary-dark transition-colors shadow-sm"
                              onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
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
            </section>
          );
        })}
      </div>
      
      {/* Size Selection Modal */}
      {selectedItem && <MenuItemModal item={selectedItem} onClose={handleCloseModal} />}

      {/* Detail Modal */}
      {showDetailModal && detailItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative">
              <img
                src={detailItem.imageUrl}
                alt={detailItem.name}
                className="w-full h-48 object-cover rounded-t-2xl"
              />
              <button
                onClick={handleCloseDetailModal}
                className="absolute top-4 right-4 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{detailItem.name}</h2>
                {detailItem.jain && (
                  <span className="bg-green-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    J
                  </span>
                )}
              </div>
              
              {/* Price */}
              <div className="mb-4">
                {detailItem.sizes && detailItem.sizes.length > 0 ? (
                  <div>
                    <p className="text-lg font-semibold text-theme-primary mb-2">Available Sizes:</p>
                    <div className="space-y-2">
                      {detailItem.sizes.map((size, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium">{size.label}</span>
                          <span className="text-theme-primary font-bold">₹{size.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-theme-primary">₹{detailItem.price}</p>
                )}
              </div>

              {/* Description */}
              {detailItem.description && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{detailItem.description}</p>
                </div>
              )}

              {/* Ingredients */}
              {detailItem.ingredients && detailItem.ingredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {detailItem.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-theme-primary-100 text-theme-primary px-3 py-1 rounded-full text-sm"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  handleAddToCart(detailItem);
                  handleCloseDetailModal();
                }}
                className="w-full bg-theme-primary text-white font-bold py-3 rounded-xl hover:bg-theme-primary-dark transition-all duration-200 shadow-lg"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <CustomerFooter />
    </div>
  );
}