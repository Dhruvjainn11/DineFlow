import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { socket } from "../utils/socket";
import CustomerFooter from "../components/CustomerFooter";

export default function CustomerOrderPage() {
  const { tableId } = useParams();
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentOrder = async () => {
    try {
      const res = await api.get(`/orders/${tableId}/orders`);
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch order:", err);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();

    socket.on("orderStatusUpdated", (updatedOrder) => {
      if (updatedOrder._id === orders?._id) {
        setOrders(updatedOrder);
      }
    });

    return () => {
      socket.off("orderStatusUpdated");
    };
  }, [orders?._id]);

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full border border-amber-100">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-amber-800 mb-2">Loading Your Orders</h2>
          <p className="text-amber-600">Preparing your dining experience...</p>
        </div>
      </div>
      <CustomerFooter />
    </div>
  );

  if (!orders || orders.length === 0) return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full border border-amber-100">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-amber-800 mb-2">No Orders Yet</h2>
          <p className="text-amber-600">Your table hasn't placed any orders</p>
        </div>
      </div>
      <CustomerFooter />
    </div>
  );

  // Enhanced status colors with better visual hierarchy
  const statusColorMap = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Preparing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Served: 'bg-violet-100 text-violet-800 border-violet-200',
    Cancelled: 'bg-rose-100 text-rose-800 border-rose-200'
  };

  const paymentStatusMap = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Requested: 'bg-sky-100 text-sky-800 border-sky-200',
    Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Failed: 'bg-rose-100 text-rose-800 border-rose-200',
    'Not Requested': 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-amber-900 mb-3">Your Dining Experience</h1>
            <div className="inline-flex items-center bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Table {tableId}</span>
            </div>
          </div>

          {/* Orders List with Enhanced Design */}
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                {/* Order Header with Gradient */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </h2>
                      <p className="text-amber-100 text-sm mt-1">
                        {new Date(order.createdAt).toLocaleString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-amber-800/90 text-white px-3 py-1.5 rounded-full">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-6">
                  {/* Enhanced Status Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Status</h3>
                      <div className={`px-4 py-2 rounded-lg border ${statusColorMap[order.status]} flex items-center`}>
                        <div className="w-2 h-2 rounded-full mr-2" style={{
                          backgroundColor: {
                            Pending: '#f59e0b',
                            Preparing: '#6366f1',
                            Ready: '#10b981',
                            Served: '#8b5cf6',
                            Cancelled: '#f43f5e'
                          }[order.status]
                        }}></div>
                        <span className="font-medium">{order.status}</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Status</h3>
                      <div className={`px-4 py-2 rounded-lg border ${paymentStatusMap[order.paymentStatus || "Not Requested"]} flex items-center`}>
                        <div className="w-2 h-2 rounded-full mr-2" style={{
                          backgroundColor: {
                            Pending: '#f59e0b',
                            Requested: '#0ea5e9',
                            Completed: '#10b981',
                            Failed: '#f43f5e',
                            'Not Requested': '#64748b'
                          }[order.paymentStatus || "Not Requested"]
                        }}></div>
                        <span className="font-medium">{order.paymentStatus || "Not Requested"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items with Enhanced Design */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      Your Selection
                    </h3>
                    <ul className="divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <li key={item._id} className="py-4 flex justify-between items-center group hover:bg-amber-50/50 transition-colors duration-200 px-3 -mx-3 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center mr-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 group-hover:text-amber-700 transition-colors duration-200">
                                {item.menuItem?.name}
                              </span>
                              <span className="block text-xs text-gray-500 mt-1">
                                {item.menuItem?.description || 'Delicious item'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-medium text-gray-900">₹{(item.menuItem?.price * item.quantity).toFixed(2)}</span>
                            <span className="block text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full mt-1">
                              × {item.quantity}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Enhanced Order Summary */}
                  <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-5 border border-amber-100 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-1">Total Amount</h4>
                        <p className="text-3xl font-bold text-amber-800">₹{order.totalPrice.toFixed(2)}</p>
                      </div>
                      {order.paymentStatus === "Requested" && (
                        <div className="flex items-center bg-sky-50 px-4 py-2 rounded-lg border border-sky-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-spin text-sky-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-sky-700">Payment requested</span>
                        </div>
                      )}
                      {order.paymentStatus === "Completed" && (
                        <div className="flex items-center bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-emerald-700">Payment complete</span>
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