import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { socket } from "../utils/socket";
import { useCafe } from "../context/CafeContext";
import CustomerFooter from "../components/CustomerFooter";
import { PaymentPageSkeleton } from "../components/SkeletonLoader";

export default function PaymentPage() {
  const { cafeId, tableId } = useParams();
  const { cafeInfo } = useCafe();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders for this table (unpaid or partially paid)
  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/table/${tableId}`);
      console.log(res.data.data);
      setOrders(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setLoading(false);
    }
  };

  // Request payment for ALL unpaid orders at once
  const requestPaymentAll = async () => {
    try {
     const res = await api.put(`/orders/table/${tableId}/request-payment`);
     console.log(res.data);
     
      fetchOrders(); // Refresh orders after requesting payment
    } catch (err) {
      console.error("Failed to request payment for all orders", err);
    }
  };

  // Check if ALL orders are either requested or completed
  const allPaidOrRequested =
    orders.length > 0 &&
    orders.every(
      (order) =>
        order.paymentStatus === "Requested" || order.paymentStatus === "Completed"
    );

  useEffect(() => {
    fetchOrders();
    
    // Join cafe room for real-time updates
    if (cafeId) {
      socket.emit('joinCafeRoom', cafeId);
    }

    // Real-time payment status updates
    socket.on("paymentCompleted", (updatedOrder) => {
      console.log("Payment completed for order:", updatedOrder);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id
            ? { ...order, paymentStatus: "Completed" }
            : order
        )
      );

      setTimeout(() => {
        setOrders((prev) =>
          prev.filter((order) => order._id !== updatedOrder._id)
        );
      }, 3000);
    });

    // Bulk payment requested
    socket.on("paymentRequestedBulk", ({ tableId: updatedTableId, orders: updatedOrders }) => {
      if (updatedTableId.toString() === tableId) {
        setOrders(updatedOrders);
      }
    });

    // Bulk payment completed
    socket.on("paymentCompletedBulk", ({ tableId: updatedTableId }) => {
      console.log("Bulk payment completed for table:", updatedTableId);
      if (updatedTableId.toString() === tableId) {
        // Mark all orders completed and remove after delay
        setOrders((prev) =>
          prev.map((order) => ({ ...order, paymentStatus: "Completed" }))
        );

        setTimeout(() => setOrders([]), 3000);
      }
    });

    // New orders should appear on payment page
    socket.on("newOrder", (newOrder) => {
      if (newOrder?.tableNumber?.toString?.() === tableId || newOrder?.tableNumber === Number(tableId)) {
        setOrders((prev) => [newOrder, ...prev]);
      }
    });

    return () => {
      socket.off("paymentCompleted");
      socket.off("paymentRequestedBulk");
      socket.off("paymentCompletedBulk");
      socket.off("newOrder");
      
      // Leave cafe room
      if (cafeId) {
        socket.emit('leaveCafeRoom', cafeId);
      }
    };
  }, [cafeId, tableId]);

  if (loading) return <PaymentPageSkeleton />;

  if (!orders || orders.length === 0)
    return (
      <div className="min-h-screen bg-theme-secondary pb-20">
        <div className="max-w-md mx-auto p-4 flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl w-full border border-theme-primary-100">
            <div className="w-16 h-16 bg-theme-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-theme-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-theme-primary mb-2">No Orders Yet</h2>
            <p className="text-theme-primary-dark">Your table hasn't placed any orders</p>
          </div>
        </div>
        <CustomerFooter />
      </div>
    );

  // Calculate total amount for all unpaid orders
  const totalAmount = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-theme-secondary pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Payment Summary
          </h2>
          {cafeInfo && (
            <p className="text-lg text-theme-primary-dark font-medium">{cafeInfo.name}</p>
          )}
        </div>

        {orders.map((order) => (
          <div key={order._id} className="bg-white shadow-lg p-4 mb-4 rounded-xl border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-700 truncate">
                  Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-base font-bold text-theme-primary">₹{order.totalPrice?.toFixed(2)}</p>
                <p className={`text-xs font-medium ${
                  order.paymentStatus === "Requested"
                    ? "text-blue-600"
                    : order.paymentStatus === "Completed"
                    ? "text-green-600"
                    : "text-gray-600"
                }`}>
                  {order.paymentStatus || "Not Requested"}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Items:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-800 text-sm truncate">
                          {item.menuItem?.name}
                        </span>
                        {item.size?.label && (
                          <span className="text-xs bg-theme-primary-100 text-theme-primary px-2 py-1 rounded-full flex-shrink-0">
                            {item.size.label}
                          </span>
                        )}
                      </div>
                      {item.remark && item.remark.trim() !== "" && (
                        <p className="text-xs text-gray-600 italic mt-1 truncate">
                          Note: {item.remark}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="font-medium text-gray-800 text-sm">
                        ₹{(item.itemPrice * item.quantity).toFixed(2)}
                      </span>
                      <span className="block text-xs text-gray-500 whitespace-nowrap">
                        ₹{item.itemPrice} × {item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Fixed Bottom Payment Section */}
        <div className="mt-6 mb-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="mb-3 text-center">
              <h3 className="text-base font-bold text-gray-800 mb-1">Total Amount</h3>
              <p className="text-2xl font-bold text-theme-primary">₹{totalAmount.toFixed(2)}</p>
            </div>
            
            {allPaidOrRequested ? (
              <div className="flex items-center justify-center bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-green-700">
                  Payment {orders.some(o => o.paymentStatus === "Completed") ? "Completed" : "Requested"}
                </span>
              </div>
            ) : (
              <button
                onClick={requestPaymentAll}
                className="w-full px-6 py-3 bg-theme-primary text-white font-bold rounded-lg hover:bg-theme-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Request Payment
              </button>
            )}
          </div>
        </div>
      </div>

      <CustomerFooter />
    </div>
  );
}
