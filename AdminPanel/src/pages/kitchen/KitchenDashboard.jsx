import React, { useEffect, useState } from "react";
import KitchenLayout from "../../layouts/KitchenLayout";
import { socket } from "../../utils/socket";
import OrderCard from "../../components/kitchen/OrderCard";
import { getOrders } from "../../services/orderService";

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    console.log("🔌 socket.connected:", socket.connected);

  socket.on("connect", () => {
    console.log("✅ Socket connected to server");
  });

  socket.on("disconnect", () => {
    console.warn("❌ Socket disconnected");
  });

    const fetchOrders = async () => {
      const res = await getOrders();
      setOrders(res);
    };

    fetchOrders();

    socket.on("orderPlaced", (newOrder) => {
      console.log("✅ Received new order:", newOrder);
      setOrders((prev) => [...prev, newOrder]);
    });

    socket.on("orderUpdated", (updated) => {
      setOrders((prev) => {
        if (updated.status === "Completed") {
          return prev.filter((o) => o._id !== updated._id);
        }
        return prev.map((o) => (o._id === updated._id ? updated : o));
      });
    });

    return () => {
      socket.off("orderPlaced");
      socket.off("orderUpdated");
       socket.off("connect");
    socket.off("disconnect");

    };
  }, []);

  return (
    <KitchenLayout>
      <h1 className="text-2xl font-bold mb-6">Live Orders</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </KitchenLayout>
  );
}
