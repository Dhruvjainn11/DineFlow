import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../utils/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Table, Clock, CheckCircle, Loader2, Circle, CreditCard } from "lucide-react";

const COLORS = ["#6366f1", "#f59e0b", "#10b981"]; // Indigo, Amber, Emerald

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/analytics/summary");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    </AdminLayout>
  );

  if (!data) return (
    <AdminLayout>
      <div className="p-6 text-red-500 flex items-center gap-2">
        <Circle className="h-4 w-4 fill-current" />
        Failed to load analytics data
      </div>
    </AdminLayout>
  );

  const { totalOrders, payments, tables } = data;

  const paymentData = [
    { name: "Pending", value: payments.pending },
    { name: "Requested", value: payments.requested },
    { name: "Completed", value: payments.completed },
  ];

  const tableData = [
    { name: "Occupied", value: tables.Occupied },
    { name: "Available", value: tables.Available },
  ];



  return (
    <AdminLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Analytics</h1>
          <p className="text-gray-500">Real-time overview of your restaurant operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="mt-1 text-3xl font-semibold text-indigo-600">{totalOrders}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <Table className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="mt-1 text-3xl font-semibold text-emerald-600">₹{payments.totalRevenue}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-500">Payment Status</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium">{payments.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Requested</span>
                <span className="font-medium">{payments.requested}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium">{payments.completed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Status Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payment Status Distribution</h2>
              <p className="text-sm text-gray-500">Breakdown of payment statuses</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} payments`, '']}
                    labelFormatter={(name) => <span className="font-semibold">{name}</span>}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Occupancy Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Table Occupancy</h2>
              <p className="text-sm text-gray-500">Current table availability status</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tableData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    formatter={(value) => [`${value} tables`, '']}
                    labelFormatter={(name) => ''}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  >
                    {tableData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#6366f1" : "#10b981"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

       
      </div>
    </AdminLayout>
  );
}