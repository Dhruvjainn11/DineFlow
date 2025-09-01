import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { socket } from "../utils/socket";
import { useCafe } from "../context/CafeContext";
import CustomerFooter from "../components/CustomerFooter";
import { OrderPageSkeleton } from "../components/SkeletonLoader";

export default function CustomerOrderPage() {
  const { cafeId, tableId } = useParams();
  const { cafeInfo } = useCafe();
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableInfo, setTableInfo] = useState(null);

  const fetchCurrentOrder = async () => {
    try {
      const res = await api.get(`/orders/table/${tableId}`);
      console.log(res.data.data);
      setOrders(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setLoading(false);
    }
  };

  const fetchTableInfo = async () => {
    try {
      const res = await api.get(`/tables/${tableId}`);
      setTableInfo(res.data.data);
    } catch (err) {
      console.error("Failed to fetch table info:", err);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
    fetchTableInfo();
    
    // Join cafe room for real-time updates
    if (cafeId) {
      socket.emit('joinCafeRoom', cafeId);
    }

    // Real-time order status updates
    socket.on("orderStatusUpdated", (updatedOrder) => {
      console.log("Order status updated:", updatedOrder);
      setOrders((prevOrders) => {
        if (!prevOrders) return [updatedOrder];
        
        return prevOrders.map((order) => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
      });
    });

    // New order received
    socket.on("newOrder", (newOrder) => {
      console.log("New order received:", newOrder);
      if (newOrder?.tableNumber?.toString?.() === tableId || newOrder?.tableNumber === Number(tableId)) {
        setOrders((prevOrders) => {
          if (!prevOrders) return [newOrder];
          return [newOrder, ...prevOrders];
        });
      }
    });

    // Order completed
    socket.on("orderCompleted", (completedOrder) => {
      console.log("Order completed:", completedOrder);
      setOrders((prevOrders) => {
        if (!prevOrders) return [];
        return prevOrders.filter((order) => order._id !== completedOrder._id);
      });
    });

    // Payment status updates
    socket.on("paymentCompleted", (updatedOrder) => {
      console.log("Payment completed:", updatedOrder);
      setOrders((prevOrders) => {
        if (!prevOrders) return [];
        return prevOrders.map((order) => 
          order._id === updatedOrder._id 
            ? { ...order, paymentStatus: "Completed" }
            : order
        );
      });
    });

    socket.on("paymentCompletedBulk", ({ tableId: updatedTableId }) => {
      console.log("Bulk payment completed for table:", updatedTableId);
      if (updatedTableId.toString() === tableId) {
        setOrders((prevOrders) => {
          if (!prevOrders) return [];
          return prevOrders.map((order) => ({ ...order, paymentStatus: "Completed" }));
        });
      }
    });

    return () => {
      socket.off("orderStatusUpdated");
      socket.off("newOrder");
      socket.off("orderCompleted");
      socket.off("paymentCompleted");
      socket.off("paymentCompletedBulk");
      
      // Leave cafe room
      if (cafeId) {
        socket.emit('leaveCafeRoom', cafeId);
      }
    };
  }, [cafeId, tableId]);

  if (loading) return <OrderPageSkeleton />;

  if (!orders || orders.length === 0) return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-theme-secondary to-white">
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full border border-theme-primary-100">
          <div className="w-16 h-16 bg-theme-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-theme-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-theme-primary mb-2">No Orders Yet</h2>
          <p className="text-theme-primary-dark">Your table hasn't placed any orders</p>
        </div>
      </div>
      <CustomerFooter />
    </div>
  );

  // Enhanced status colors with better visual hierarchy
  const statusColorMap = {
    Pending: 'bg-theme-primary-100 text-theme-primary border-theme-primary-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    Ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Completed: 'bg-green-100 text-green-800 border-green-200',
    Cancelled: 'bg-rose-100 text-rose-800 border-rose-200'
  };

  const paymentStatusMap = {
    Pending: 'bg-theme-primary-100 text-theme-primary border-theme-primary-200',
    Requested: 'bg-sky-100 text-sky-800 border-sky-200',
    Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Failed: 'bg-rose-100 text-rose-800 border-rose-200',
    'Not Requested': 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-theme-secondary to-white">
      <div className="flex-grow px-4 py-6 pb-20">
        <div className="max-w-md mx-auto">
          {/* Enhanced Header Section */}
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold text-theme-primary mb-2">Your Dining Experience</h1>
            {cafeInfo && (
              <p className="text-xl text-theme-primary-dark font-medium mb-3">{cafeInfo.name}</p>
            )}
            <div className="inline-flex items-center bg-theme-primary text-white px-6 py-2 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Table {tableInfo?.tableNumber || tableId}</span>
            </div>
          </div>

          {/* Orders List with Enhanced Design */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 w-full">
                {/* Order Header with Gradient */}
                <div className="bg-theme-primary px-4 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-white truncate">
                        Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </h2>
                      <p className="text-white/80 text-xs mt-1">
                        {new Date(order.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-theme-primary-dark text-white px-2 py-1 rounded-full flex-shrink-0 ml-2">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-4">
                  {/* Enhanced Status Indicators */}
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Status</h3>
                      <div className={`px-4 py-2 rounded-lg border ${statusColorMap[order.status]} flex items-center`}>
                        <div className="w-2 h-2 bg-theme-primary rounded-full mr-2"></div>
                        <span className="font-medium">{order.status}</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Status</h3>
                      <div className={`px-4 py-2 rounded-lg border ${paymentStatusMap[order.paymentStatus || "Not Requested"]} flex items-center`}>
                        <div className="w-2 h-2 bg-theme-primary rounded-full mr-2"></div>
                        <span className="font-medium">{order.paymentStatus || "Not Requested"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items with Enhanced Design */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-theme-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      Your Selection
                    </h3>
                    <ul className="divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <li key={item._id} className="py-3 flex justify-between items-start group hover:bg-theme-primary-50 transition-colors duration-200 px-3 -mx-3 rounded-lg">
                          <div className="flex items-start flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-theme-primary-100 to-theme-secondary flex items-center justify-center mr-3 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-theme-primary" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-900 group-hover:text-theme-primary transition-colors duration-200">
                                {item.menuItem?.name}
                              </span>
                              {item.size?.label && (
                                <span className="block text-xs text-theme-primary bg-theme-primary-100 px-2 py-1 rounded-full mt-1">
                                  Size: {item.size.label}
                                </span>
                              )}
                              <span className="block text-xs text-gray-500 mt-1">
                                {item.menuItem?.description || 'Delicious item'}
                              </span>
                              {item.remark && item.remark.trim() !== "" && (
                                <span className="block text-xs text-gray-600 italic mt-1">
                                  Note: {item.remark}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <span className="font-medium text-gray-900 text-sm">
                              ₹{(item.itemPrice * item.quantity).toFixed(2)}
                            </span>
                            <span className="block text-xs text-theme-primary bg-theme-primary-100 px-2 py-1 rounded-full mt-1 whitespace-nowrap">
                              ₹{item.itemPrice} × {item.quantity}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Enhanced Order Summary */}
                  <div className="bg-gradient-to-br from-theme-secondary to-white rounded-xl p-4 border border-theme-primary-100 shadow-sm">
                    <div className="text-center mb-3">
                      <h4 className="text-sm font-semibold text-theme-primary uppercase tracking-wider mb-1">Subtotal</h4>
                      <p className="text-2xl font-bold text-theme-primary">₹{(order.subtotal || order.totalAmount || order.totalPrice || 0).toFixed(2)}</p>
                      
                    </div>
                    <div className="flex justify-center">
                      {order.paymentStatus === "Requested" && (
                        <div className="flex items-center bg-sky-50 px-3 py-2 rounded-lg border border-sky-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 animate-spin text-sky-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium text-sky-700">Payment requested</span>
                        </div>
                      )}
                      {order.paymentStatus === "Completed" && (
                        <div className="flex items-center bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium text-emerald-700">Payment complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CustomerFooter />
    </div>
  );
}