import React, { useEffect, useState } from "react";
import api from "../utils/api";
import SuperAdminLayout from "../layouts/SuperAdminLayout";

const SuperAdminAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/super-admin/analytics");
      setAnalytics(res.data.data);
    } catch (err) {
      console.error("Super Admin Analytics Error:", err);
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <SuperAdminLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900">System Analytics</h2>
        <p className="text-gray-600 mt-1">
          Overview of all cafés and users in the system
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Cafés", value: analytics.totalCafes, icon: "🏢", color: "bg-blue-100 text-blue-800" },
          { title: "Total Users", value: analytics.totalUsers, icon: "👥", color: "bg-purple-100 text-purple-800" },
          { title: "Total Orders", value: analytics.totalOrders, icon: "📋", color: "bg-green-100 text-green-800" },
          { title: "Total Revenue", value: `₹${analytics.totalRevenue.toLocaleString()}`, icon: "💰", color: "bg-yellow-100 text-yellow-800" },
        ].map((metric, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{metric.title}</p>
              <p className="mt-2 text-2xl font-bold">{metric.value}</p>
            </div>
            <div className={`p-3 rounded-full ${metric.color} text-lg`}>{metric.icon}</div>
          </div>
        ))}
      </div>

      {/* Last 7 Days Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Last 7 Days Performance
        </h3>
        <div className="h-64">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            {/* Background Grid */}
            <line x1="0" y1="180" x2="400" y2="180" stroke="#e5e7eb" />
            <line x1="0" y1="140" x2="400" y2="140" stroke="#e5e7eb" />
            <line x1="0" y1="100" x2="400" y2="100" stroke="#e5e7eb" />
            <line x1="0" y1="60" x2="400" y2="60" stroke="#e5e7eb" />
            <line x1="0" y1="20" x2="400" y2="20" stroke="#e5e7eb" />

            {/* Revenue Line */}
            {analytics.dailyStats.map((point, idx) => {
              if (idx === 0) return null;
              const prev = analytics.dailyStats[idx - 1];
              const x1 = (idx - 1) * (400 / (analytics.dailyStats.length - 1));
              const y1 = 180 - (prev.revenue / Math.max(...analytics.dailyStats.map(d => d.revenue || 1))) * 160;
              const x2 = idx * (400 / (analytics.dailyStats.length - 1));
              const y2 = 180 - (point.revenue / Math.max(...analytics.dailyStats.map(d => d.revenue || 1))) * 160;
              return <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="2" />;
            })}

            {/* Data Points */}
            {analytics.dailyStats.map((point, idx) => {
              const x = idx * (400 / (analytics.dailyStats.length - 1));
              const y = 180 - (point.revenue / Math.max(...analytics.dailyStats.map(d => d.revenue || 1))) * 160;
              return <circle key={idx} cx={x} cy={y} r="4" fill="#3b82f6" />;
            })}
          </svg>
        </div>
      </div>

      {/* Top Cafés */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Cafés</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Café Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Location</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Orders</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analytics.topCafes.map((cafe, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{cafe.cafe.name}</td>
                  <td className="px-4 py-2">{cafe.cafe.location || "—"}</td>
                  <td className="px-4 py-2">{cafe.orders}</td>
                  <td className="px-4 py-2">₹{cafe.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAnalyticsDashboard;
