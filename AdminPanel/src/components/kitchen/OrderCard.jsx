import api from "../../utils/api";
import React from "react";

export default function OrderCard({ order }) {
  const updateStatus = async (status) => {
    await api.put(`/orders/${order._id}/status`, { status });
  };

  console.log("OrderCard rendered for order:", order);
  return (
    <div className="bg-white p-4 shadow rounded-lg border space-y-3">
      <h2 className="font-bold text-lg">
        Table: {order.tableNumber?.tableNumber || "N/A"}
      </h2>
      <ul className="text-sm text-gray-700 ">
        {order.items.map((item, idx) => (
          <li key={idx} className="flex items-center space-x-2 font-semibold  text-lg">
            {item.quantity} × {item.menuItem?.name}
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mt-2">
        {order.status === "Pending" && (
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            onClick={() => updateStatus("In Progress")}
          >
            Start
          </button>
        )}
        {order.status === "In Progress" && (
          <button
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            onClick={() => updateStatus("Ready")}
          >
            Mark Ready
          </button>
        )}
        {order.status === "Ready" && (
          <button
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            onClick={() => updateStatus("Completed")}
          >
            Mark Completed
          </button>
        )}
      </div>
    </div>
  );
}
