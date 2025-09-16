import React, { useEffect, useState } from "react";
import api from "../utils/api";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import {
  BuildingOfficeIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

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
      <SuperAdminLayout>
        <div className="space-y-6">
          {/* Loading Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (error) {
    return (
      <SuperAdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Analytics</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  if (!analytics) return null;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <SuperAdminLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">System Analytics</h2>
            <p className="text-blue-100">
              Comprehensive overview of all cafés and platform performance
            </p>
          </div>
          <button
            onClick={loadAnalytics}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <ArrowPathIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: "Total Cafés", 
            value: analytics.totalCafes, 
            icon: BuildingOfficeIcon, 
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600"
          },
          { 
            title: "Total Users", 
            value: analytics.totalUsers, 
            icon: UsersIcon, 
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600"
          },
          { 
            title: "Total Orders", 
            value: analytics.totalOrders, 
            icon: ShoppingCartIcon, 
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            textColor: "text-green-600"
          },
          { 
            title: "Total Revenue", 
            value: `₹${Math.floor(analytics.totalRevenue).toLocaleString()}`, 
            icon: CurrencyDollarIcon, 
            color: "from-yellow-500 to-yellow-600",
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-600"
          },
        ].map((metric, idx) => {
          const IconComponent = metric.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{metric.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${metric.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">7-Day Revenue Trend</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => `₹${Math.floor(value).toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value) => [`₹${Math.floor(value).toLocaleString()}`, 'Revenue']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.1}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
            <ClockIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: analytics.subscriptionBreakdown?.active || 0 },
                    { name: 'Trial', value: analytics.subscriptionBreakdown?.trial || 0 },
                    { name: 'Inactive', value: analytics.subscriptionBreakdown?.inactive || 0 },
                    { name: 'Suspended', value: analytics.subscriptionBreakdown?.suspended || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} cafés`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-4 space-x-4">
            {[
              { name: 'Active', color: '#3B82F6' },
              { name: 'Trial', color: '#10B981' },
              { name: 'Inactive', color: '#F59E0B' },
              { name: 'Suspended', color: '#EF4444' }
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Cafés */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Cafés</h3>
        <div className="space-y-4">
          {analytics.topCafes.map((cafe, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    #{idx + 1}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{cafe.cafe.name}</h4>
                  <p className="text-sm text-gray-500">{cafe.cafe.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹{Math.floor(cafe.revenue).toLocaleString()}</p>
                <p className="text-sm text-gray-500">{cafe.orders} orders</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health & Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Metrics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Cafés (7 days)</span>
              <span className="font-semibold text-green-600">+{analytics.cafeStatusBreakdown?.active || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Subscriptions</span>
              <span className="font-semibold text-blue-600">{analytics.subscriptionBreakdown?.active || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Trial Conversions</span>
              <span className="font-semibold text-purple-600">{Math.round(((analytics.subscriptionBreakdown?.active || 0) / (analytics.totalCafes || 1)) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Cafés</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="font-semibold">{analytics.cafeStatusBreakdown?.active || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Inactive Cafés</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="font-semibold">{analytics.cafeStatusBreakdown?.inactive || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Suspended</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="font-semibold">{analytics.cafeStatusBreakdown?.suspended || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="font-medium text-blue-900">Check Expired Subscriptions</div>
              <div className="text-sm text-blue-600">Run manual subscription check</div>
            </button>
            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="font-medium text-green-900">Export Analytics</div>
              <div className="text-sm text-green-600">Download detailed report</div>
            </button>
            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="font-medium text-purple-900">System Health</div>
              <div className="text-sm text-purple-600">View system diagnostics</div>
            </button>
          </div>
        </div>
      </div>
    </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAnalyticsDashboard;
