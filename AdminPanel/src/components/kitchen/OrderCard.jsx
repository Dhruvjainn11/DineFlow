import api from "../../utils/api";
import React from "react";

export default function OrderCard({ order }) {
  const updateStatus = async (status) => {
    await api.put(`/orders/${order._id}/status`, { status });
  };

  const getStatusColor = () => {
    switch(order.status) {
      case "Pending": return "bg-rose-100 text-rose-800 border border-rose-200";
      case "In Progress": return "bg-slate-100 text-slate-800 border border-slate-200";
      case "Ready": return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <h2 className="font-bold text-xl text-slate-800">
          Table #{order.tableNumber?.tableNumber || "N/A"}
        </h2>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {order.status}
        </span>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Order Items</h3>
        <ul className="space-y-3">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex justify-between items-baseline">
              <span className="font-medium text-slate-700">
                {item.quantity} × {item.menuItem?.name}
              </span>
              {item.specialRequest && (
                <span className="text-xs text-slate-400 ml-2 text-right">"{item.specialRequest}"</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex gap-3">
        {order.status === "Pending" && (
          <button
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
            onClick={() => updateStatus("In Progress")}
          >
            Start Preparation
          </button>
        )}
        {order.status === "In Progress" && (
          <button
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
            onClick={() => updateStatus("Ready")}
          >
            Mark Ready
          </button>
        )}
        {order.status === "Ready" && (
          <button
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
            onClick={() => updateStatus("Completed")}
          >
            Complete Order
          </button>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
        Order ID: {order._id.substring(0, 8)}...
      </div>
    </div>
  );
}