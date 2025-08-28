import React, { useEffect, useState } from "react";
import RoleBasedLayout from "../layouts/RoleBasedLayout";
import { getOrders } from "../services/orderService";
import { socket } from "../utils/socket";
import { Circle, CheckCircle, Clock, XCircle, CreditCard, Utensils, Filter, Calendar, RefreshCw } from "lucide-react";
import OrderSkeleton from "../components/Common/OrderSkeleton";

const OrderManagment = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateFilter, setDateFilter] = useState("7");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    fetchOrders();
    
     socket.on("newOrder", (newOrder) =>
          setOrders((prev) => [...prev, newOrder])
        );
    
    socket.on("orderStatusUpdated", (updated) => {
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
         socket.off("orderStatusUpdated");
       };
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (statusFilter.length > 0) params.status = statusFilter.join(",");
      if (dateFilter) params.lastDays = dateFilter;
      const data = await getOrders(params);
      setOrders(data.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-amber-100 text-amber-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Ready":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const paymentBadgeClass = (status) => {
    return status === "Completed" 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  return (
    <RoleBasedLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track all restaurant orders in real-time
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full">
              <Utensils className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">
                {orders.length} Active {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-9 pr-10 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
              >
                <option value="1">Last 1 day</option>
                <option value="3">Last 3 days</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </div>
            
            <div className="relative">
  {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <Filter className="h-4 w-4 text-gray-400" />
  </div> */}
  {/* <div className="relative">
    <select
      multiple
      value={statusFilter}
      onChange={(e) =>
        setStatusFilter(Array.from(e.target.selectedOptions).map((o) => o.value))
      }
      className="pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none min-w-[180px] h-[42px] overflow-hidden hover:border-gray-400 transition-colors"
    >
      <option 
        value="Pending" 
        className="px-3 py-1 hover:bg-indigo-50 checked:bg-indigo-100"
      >
        Pending
      </option>
      <option 
        value="In Progress" 
        className="px-3 py-1 hover:bg-indigo-50 checked:bg-indigo-100"
      >
        In Progress
      </option>
      <option 
        value="Ready" 
        className="px-3 py-1 hover:bg-indigo-50 checked:bg-indigo-100"
      >
        Ready
      </option>
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div> */}
  
  {/* Selected tags display */}
  {/* {statusFilter.length > 0 && (
    <div className="absolute -bottom-6 left-0 flex flex-wrap gap-1 mt-1">
      {statusFilter.map((status) => (
        <span 
          key={status}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
        >
          {status}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setStatusFilter(statusFilter.filter(s => s !== status));
            }}
            className="ml-1.5 inline-flex items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-200 h-4 w-4"
          >
            <span className="sr-only">Remove</span>
            <svg className="h-2 w-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  )} */}
</div>
            
            <button
              onClick={fetchOrders}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors disabled:opacity-70"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <span>Apply</span>
              )}
            </button>
          </div>
        </div>

        {isLoading ? (
          <OrderSkeleton />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <Circle className="h-10 w-10 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No orders found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${statusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                    {order.tableNumber && (
                      <span className="bg-gray-200 text-gray-800 rounded-full px-2.5 py-1 text-xs font-medium">
                        Table {order.tableNumber}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium text-gray-700">
                        Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${paymentBadgeClass(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Order Items ({order.items.length})
                    </h4>
                    <ul className="space-y-3">
                      {order.items.map((item, i) => (
                        <li key={i} className="text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-800">
                              {item.menuItem?.name || "Unknown Item"} × {item.quantity}
                            </span>
                            <span className="text-gray-600">
                              ₹{(((item.size?.price ?? item.itemPrice ?? item.menuItem?.price) || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          {item.remark && item.remark.trim() !== "" && (
                            <div className="mt-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Note: {item.remark}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      <span className="block text-xs text-gray-500">Customer</span>
                      {order.customerName || "Walk-in"}
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-gray-500">Total</span>
                      <span className="font-bold text-gray-800">₹{order.totalPrice?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
};

export default OrderManagment;