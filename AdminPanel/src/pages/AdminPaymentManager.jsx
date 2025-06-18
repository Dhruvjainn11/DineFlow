import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../utils/api";

import { socket } from "../utils/socket";

export default function AdminPaymentManager() {
  const [orders, setOrders] = useState([]);

  const fetchAllRelevantOrders = async () => {
    try {
      const res = await api.get("/orders/payment");
      console.log(res.data);

      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  useEffect(() => {
    fetchAllRelevantOrders();
    socket.on("connect", () => {
      console.log("✅ Connected to Socket:", socket.id);
    });

    const handlePaymentRequested = (updatedOrder) => {
      console.log(updatedOrder);

      setOrders((prev) => {
        const exists = prev.find((o) => o._id === updatedOrder._id);
        if (exists) {
          return prev.map((o) =>
            o._id === updatedOrder._id ? updatedOrder : o
          );
        } else {
          return [...prev, updatedOrder];
        }
      });
    };

    const handlePaymentCompleted = (updatedOrder) => {
      console.log(updatedOrder);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === updatedOrder._id ? { ...o, paymentStatus: "Completed" } : o
        )
      );

      setTimeout(() => {
        setOrders((prev) => prev.filter((o) => o._id !== updatedOrder._id));
      }, 7000);
    };

    socket.on("paymentRequested", handlePaymentRequested);
    socket.on("paymentCompleted", handlePaymentCompleted);
    socket.on("newOrder", (newOrder) =>
      setOrders((prev) => [...prev, newOrder])
    );

    return () => {
      socket.off("paymentRequested", handlePaymentRequested);
      socket.off("paymentCompleted", handlePaymentCompleted);
      socket.off("newOrder")
    };
  }, []);

  const handleMarkComplete = async (id) => {
    try {
      await api.put(`/orders/${id}/payment-complete`);
    } catch (err) {
      console.error("Failed to mark complete", err);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Payment Requests</h2>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {orders.length} Active
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mt-4">
              No payment requests
            </h3>
            <p className="text-gray-500 mt-1">All payments are up to date</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className={
                        order.paymentStatus === "Requested"
                          ? "bg-amber-50 hover:bg-amber-100"
                          : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-800 font-medium">
                              {order.tableNumber?.tableNumber || "N/A"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Table {order.tableNumber?.tableNumber || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items.length} items
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-semibold text-gray-900">
                          ₹{order.totalPrice.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.paymentStatus === "Requested"
                              ? "bg-amber-100 text-amber-800"
                              : order.paymentStatus === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.paymentStatus || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.paymentRequestedAt ? (
                          new Date(order.paymentRequestedAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "numeric",
                              month: "short",
                            }
                          )
                        ) : (
                          <span className="text-gray-400 italic">
                            Not requested
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {order.paymentStatus === "Requested" ? (
                          <button
                            onClick={() => handleMarkComplete(order._id)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        ) : order.paymentStatus === "Completed" ? (
                          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg cursor-default">
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Paid
                            </div>
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">
                            Awaiting request
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
