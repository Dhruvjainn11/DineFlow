import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { socket } from "../utils/socket";
import CustomerFooter from "../components/CustomerFooter";

export default function PaymentPage() {
  const { tableId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/${tableId}/orders`);
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  const requestPayment = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/request-payment`);
      fetchOrders(); // refresh
    } catch (err) {
      console.error("Failed to request payment", err);
    }
  };

  useEffect(() => {
    fetchOrders();

    socket.on("paymentCompleted", (updatedOrder) => {
        console.log("Payment completed for order:", updatedOrder);
        
  // Optionally show "Paid" for a few seconds before removal
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
  }, 7000);// 7 seconds delay before auto-remove


   

});


    return () => {
      socket.off("paymentCompleted");
    };
  }, []);
  
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

 

  const totalAmount = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-amber-50 p-4">
      <h2 className="text-2xl font-bold text-center text-amber-900 mb-4">Payment Summary</h2>

      {orders.map((order) => (
        <div key={order._id} className="bg-white shadow p-4 mb-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold text-gray-700">Order ID: {order._id.slice(-6)}</p>
              <p className="text-sm text-gray-500">Total: ₹{order.totalPrice}</p>
              <p className="text-sm">
                Status:{" "}
                <span className={`font-medium ${order.paymentStatus === "Requested"
                  ? "text-blue-600"
                  : order.paymentStatus === "Completed"
                    ? "text-green-600"
                    : "text-gray-600"
                  }`}>
                  {order.paymentStatus || "Not Requested"}
                </span>
              </p>
            </div>

            <button
              disabled={order.paymentStatus === "Requested" || order.paymentStatus === "Completed"}
              onClick={() => requestPayment(order._id)}
              className={`px-4 py-2 rounded font-semibold text-white
                ${order.paymentStatus === "Requested" || order.paymentStatus === "Completed"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600"
                }`}
            >
              {order.paymentStatus === "Requested"
                ? "Payment Requested"
                : order.paymentStatus === "Completed"
                  ? "Paid"
                  : "Request Payment"}
            </button>
          </div>
        </div>
      ))}

      <div className="mt-6 p-4 bg-white rounded-lg shadow flex justify-between text-lg font-bold">
        <span>Total Amount:</span>
        <span>₹{totalAmount}</span>
      </div>
      <CustomerFooter />
    </div>
  );
}
