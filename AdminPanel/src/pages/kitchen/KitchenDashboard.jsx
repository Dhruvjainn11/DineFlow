import React, { useEffect, useState } from "react";
import KitchenLayout from "../../layouts/KitchenLayout";
import { socket } from "../../utils/socket";
import OrderCard from "../../components/kitchen/OrderCard";
import { getOrders } from "../../services/orderService";

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    socket.on("newOrder", (newOrder) =>
      setOrders((prev) => [...prev, newOrder])
    );

    const fetchOrders = async () => {
      const res = await getOrders();
      setOrders(res);
    };

    fetchOrders();

    socket.on("orderUpdated", (updated) => {
      setOrders((prev) => {
        if (updated.status === "Completed") {
          return prev.filter((o) => o._id !== updated._id);
        }
        return prev.map((o) => (o._id === updated._id ? updated : o));
      });
    });

    socket.on("orderCompleted", (order) =>
      setOrders((prev) => prev.filter((o) => o._id !== order._id))
    );

    return () => {
      socket.off("newOrder");
      socket.off("orderCompleted");
      socket.off("orderUpdated");
    };
  }, []);

  return (
    <KitchenLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Kitchen Dashboard
        </h1>
        <p className="text-slate-600">
          {orders.length} active {orders.length === 1 ? "order" : "orders"}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200">
          {/* ... (keep the same SVG icon) */}
          <h3 className="mt-2 text-lg font-medium text-slate-800">
            No active orders
          </h3>
          <p className="mt-1 text-slate-500">Awaiting new orders...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </KitchenLayout>
  );
}
