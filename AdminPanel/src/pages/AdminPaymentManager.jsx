import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../utils/api";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL); // make sure your env has this

export default function AdminPaymentManager() {
  const [orders, setOrders] = useState([]);

  const fetchRequestedPayments = async () => {
    try {
      const res = await api.get("/orders?paymentStatus=Requested");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  useEffect(() => {
    fetchRequestedPayments();

    // Real-time update listener
    socket.on("paymentRequested", (newOrder) => {
      setOrders((prev) => [...prev, newOrder]);
    });

    socket.on("paymentCompleted", (completedOrder) => {
      setOrders((prev) => prev.filter((o) => o._id !== completedOrder._id));
    });

    return () => {
      socket.off("paymentRequested");
      socket.off("paymentCompleted");
    };
  }, []);

  const handleMarkComplete = async (id) => {
    try {
      await api.put(`/orders/${id}/payment-complete`);
      // Will auto-remove via socket
    } catch (err) {
      console.error("Failed to mark complete", err);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Pending Payment Requests</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500">No payment requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Table</th>
                  <th className="p-3 text-left">Total Price</th>
                  <th className="p-3 text-left">Requested At</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t">
                    <td className="p-3">{order.tableNumber?.tableNumber || "N/A"}</td>
                    <td className="p-3">₹{order.totalPrice}</td>
                    <td className="p-3">{new Date(order.paymentRequestedAt).toLocaleString()}</td>
                    <td className="p-3">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer"
                        disabled={order.paymentStatus === "Completed"}
                      
                      onClick={() => handleMarkComplete(order._id)}>Mark Complete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
