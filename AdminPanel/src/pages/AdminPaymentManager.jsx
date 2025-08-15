import React, { useEffect, useState } from "react";
import RoleBasedLayout from "../layouts/RoleBasedLayout";
import api from "../utils/api";
import { socket } from "../utils/socket";
import Receipt from "../components/Receipt"; // Import your Receipt component
import { useAuth } from "../context/AuthContext";

export default function AdminPaymentManager() {
  const [orders, setOrders] = useState([]);
  const [paidTables, setPaidTables] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Group orders by table and calculate total + payment status
  const groupOrdersByTable = (ordersList) => {
    const grouped = {};

    ordersList.forEach((order) => {
      const tableNum = order.tableNumber ?? "N/A";

      if (!grouped[tableNum]) {
        grouped[tableNum] = {
          tableNumber: order.tableNumber,
          orders: [],
          totalPrice: 0,
          paymentStatus: "Pending",
          paymentRequestedAt: null,
        };
      }

      grouped[tableNum].orders.push(order);
      grouped[tableNum].totalPrice += order.totalPrice;

      if (order.paymentStatus === "Requested") {
        grouped[tableNum].paymentStatus = "Requested";
        grouped[tableNum].paymentRequestedAt = order.paymentRequestedAt;
      }
      if (
        grouped[tableNum].orders.every(
          (o) => o.paymentStatus === "Completed"
        )
      ) {
        grouped[tableNum].paymentStatus = "Completed";
      }
    });

    return Object.values(grouped);
  };

  const fetchAllRelevantOrders = async () => {
    try {
      const res = await api.get("/orders", { params: { view: "payment" } });
      setOrders(groupOrdersByTable(res.data));
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
      fetchAllRelevantOrders();
    };

    const handlePaymentRequestedBulk = ({ tableId, orders }) => {
      fetchAllRelevantOrders();
    };

    const handlePaymentCompleted = (updatedOrder) => {
      fetchAllRelevantOrders();
    };

    const handleNewOrder = (newOrder) => {
      // New orders should be visible on payment page until paid
      fetchAllRelevantOrders();
    };

    socket.on("paymentRequested", handlePaymentRequested);
    socket.on("paymentRequestedBulk", handlePaymentRequestedBulk);
    socket.on("paymentCompleted", handlePaymentCompleted);
    socket.on("newOrder", handleNewOrder);

    return () => {
      socket.off("paymentRequested", handlePaymentRequested);
      socket.off("paymentRequestedBulk", handlePaymentRequestedBulk);
      socket.off("paymentCompleted", handlePaymentCompleted);
      socket.off("newOrder", handleNewOrder);
    };
  }, []);

  // Mark ALL orders for the table as paid
  const handleMarkComplete = async (tableNumber) => {
    try {
      await api.put(`/orders/table/${tableNumber}/payment-complete-all`);

      setOrders((prev) =>
        prev.map((tableOrder) =>
          (tableOrder.tableNumber) === tableNumber
            ? { ...tableOrder, paymentStatus: "Completed" }
            : tableOrder
        )
      );

      setPaidTables((prev) => [...prev, tableNumber]);

      setTimeout(() => {
        setOrders((prev) =>
          prev.filter(
            (tableOrder) =>
               (tableOrder.tableNumber) !== tableNumber
          )
        );
        setPaidTables((prev) => prev.filter((t) => t !== tableNumber));
      }, 7000);
    } catch (err) {
      console.error("Failed to mark complete", err);
    }
  };

  // Handle View/Print Bill button click
  const handleViewPrintBill = (tableNumber) => {
    // Find grouped table order by tableNumber
    const tableOrder = orders.find(
      (t) => (t.tableNumber?.tableNumber || t.tableNumber) === tableNumber
    );

    if (tableOrder) {
      // Build a single "combined" order object for the Receipt component
      // Combine all items from all orders in that table
      const combinedItems = tableOrder.orders.flatMap(order => 
        order.items.map(item => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
        }))
      );

      // Sum totalPrice from grouped data (already computed)
      const combinedOrder = {
        _id: `Table-${tableNumber}-Receipt`,
        tableNumber: tableOrder.tableNumber,
        items: combinedItems,
        totalPrice: tableOrder.totalPrice,
        createdAt: tableOrder.paymentRequestedAt || new Date().toISOString(),
      };

      setSelectedOrder(combinedOrder);
    }
  };

  return (
    <RoleBasedLayout>
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
                      Total Amount
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
                  {orders.map((tableOrder) => (
                    <tr
                      key={tableOrder.tableNumber?._id || tableOrder.tableNumber}
                      className={
                        tableOrder.paymentStatus === "Requested"
                          ? "bg-amber-50 hover:bg-amber-100"
                          : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-800 font-medium">
                              {tableOrder.tableNumber || "N/A"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Table {tableOrder.tableNumber || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tableOrder.orders.length} orders
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-semibold text-gray-900">
                          ₹{tableOrder.totalPrice.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tableOrder.paymentStatus === "Requested"
                              ? "bg-amber-100 text-amber-800"
                              : tableOrder.paymentStatus === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {tableOrder.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tableOrder.paymentRequestedAt ? (
                          new Date(tableOrder.paymentRequestedAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "numeric",
                              month: "short",
                            }
                          )
                        ) : (
                          <span className="text-gray-400 italic">Not requested</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {tableOrder.paymentStatus === "Requested" ? (
                          <>
                            <button
                              onClick={() => handleMarkComplete(tableOrder.tableNumber)}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => handleViewPrintBill(tableOrder.tableNumber)}
                              className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                            >
                              View/Print Bill
                            </button>
                          </>
                        ) : tableOrder.paymentStatus === "Completed" ? (
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
                          <span className="text-gray-400 italic">Awaiting request</span>
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

      {/* Receipt Modal */}
      {selectedOrder && (
        <Receipt order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </RoleBasedLayout>
  );
}
