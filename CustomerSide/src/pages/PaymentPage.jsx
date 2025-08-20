import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { socket } from "../utils/socket";
import CustomerFooter from "../components/CustomerFooter";

export default function PaymentPage() {
  const { tableId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cafeInfo, setCafeInfo] = useState(null);

  // Fetch all orders for this table (unpaid or partially paid)
  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/table/${tableId}`);
      console.log(res.data.data);
      
      setOrders(res.data.data);
      
      // Fetch cafe info if we have orders
      if (res.data.data.length > 0 && !cafeInfo) {
        const cafeId = res.data.data[0].cafeId._id || res.data.data[0].cafeId;
        try {
          const cafeRes = await api.get(`/cafes/${cafeId}`);
          setCafeInfo(cafeRes.data.data);
          // Join cafe room for real-time updates
          socket.emit('joinCafeRoom', cafeId);
        } catch (cafeErr) {
          console.error("Failed to fetch cafe info", cafeErr);
        }
      }
      
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
    };
  }, [tableId]);

  if (loading)
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-theme-secondary to-white">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full border border-theme-primary-100">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-theme-primary mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-theme-primary mb-2">
              Loading Your Orders
            </h2>
            <p className="text-theme-primary-dark">Preparing your dining experience...</p>
          </div>
        </div>
        <CustomerFooter />
      </div>
    );

  if (!orders || orders.length === 0)
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-theme-secondary to-white">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full border border-theme-primary-100">
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
    <div className="min-h-screen bg-theme-secondary p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-theme-primary mb-2">
          Payment Summary
        </h2>
        {cafeInfo && (
          <p className="text-lg text-theme-primary-dark font-medium">{cafeInfo.name}</p>
        )}
      </div>

      {orders.map((order) => (
        <div key={order._id} className="bg-white shadow-lg p-6 mb-6 rounded-xl border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-theme-primary">₹{order.totalPrice?.toFixed(2)}</p>
              <p className={`text-sm font-medium ${
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
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {item.menuItem?.name}
                      </span>
                      {item.size?.label && (
                        <span className="text-xs bg-theme-primary-100 text-theme-primary px-2 py-1 rounded-full">
                          {item.size.label}
                        </span>
                      )}
                    </div>
                    {item.remark && item.remark.trim() !== "" && (
                      <p className="text-xs text-gray-600 italic mt-1">
                        Note: {item.remark}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-800">
                      ₹{(item.itemPrice * item.quantity).toFixed(2)}
                    </span>
                    <span className="block text-xs text-gray-500">
                      ₹{item.itemPrice} × {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Total Amount</h3>
          <p className="text-3xl font-bold text-theme-primary">₹{totalAmount.toFixed(2)}</p>
        </div>
        
        {allPaidOrRequested ? (
          <div className="flex items-center bg-green-50 px-4 py-3 rounded-lg border border-green-200">
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
            className="px-8 py-3 bg-theme-primary text-white font-bold rounded-lg hover:bg-theme-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Request Payment
          </button>
        )}
      </div>

      <CustomerFooter />
    </div>
  );
}
