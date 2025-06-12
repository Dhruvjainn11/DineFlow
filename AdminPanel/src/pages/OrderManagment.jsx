import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { getOrders } from "../services/orderService";

const OrderManagment = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Order Management</h2>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border rounded-lg shadow p-4 space-y-2"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  Table: {order.tableNumber?.tableNumber || "N/A"}
                </h3>
                <span className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="text-blue-600">{order.status}</span>
                </p>
                <p>
                  <strong>Payment:</strong>{" "}
                  <span
                    className={
                      order.paymentStatus === "Completed"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {order.paymentStatus}
                  </span>
                </p>
                <p>
                  <strong>Total Price:</strong> ₹{order.totalPrice || 0}
                </p>
              </div>

              <div>
                <h4 className="font-medium mt-2">Items:</h4>
                <ul className="ml-4 list-disc">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.menuItem?.name || "Unknown Item"} × {item.quantity}{" "}
                      — ₹{(item.menuItem?.price || 0) * item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderManagment;
