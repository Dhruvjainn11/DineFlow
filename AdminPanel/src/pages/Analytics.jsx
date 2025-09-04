import React, { useEffect, useState } from "react";
import RoleBasedLayout from "../layouts/RoleBasedLayout";
import api from "../utils/api";
import AnalyticsDashboard from "../components/Analytics/AnalyticsDashboard";
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { 
  Table, 
  Clock, 
  CheckCircle, 
  Loader2, 
  Circle, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  DollarSign,
  ShoppingCart,
  BarChart3
} from "lucide-react";
import FeatureGate from "../components/Common/FeatureGate";
import AnalyticsSkeleton from "../components/Common/AnalyticsSkeleton";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/analytics/summary?days=7");
        console.log('Analytics response:', res.data);
        if (res.data.success) {
          console.log('Today stats:', res.data.data.todayStats);
          console.log('Daily stats:', res.data.data.dailyStats);
          console.log('Payments:', res.data.data.payments);
          console.log('Today potential revenue:', res.data.data.todayStats?.totalPotentialRevenue);
          setData(res.data.data);
        } else {
          console.error('Analytics API returned error:', res.data.message);
          setData(null);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return (
    <RoleBasedLayout>
      <AnalyticsSkeleton />
    </RoleBasedLayout>
  );

  if (!data) return (
    <RoleBasedLayout>
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <Circle className="h-10 w-10 text-red-500 mx-auto" />
          <p className="text-red-500 font-medium">Failed to load analytics data</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </RoleBasedLayout>
  );

  const { 
    totalOrders = 0, 
    payments = { pending: 0, requested: 0, completed: 0, totalRevenue: 0 }, 
    tables = { Occupied: 0, Available: 0 }, 
    dailyStats = [], 
    todayStats = { orders: 0, revenue: 0 },
    planType = 'basic'
  } = data || {};
  
  const isProPlan = planType === 'pro';
  const periodLabel = '7-Day'; // Always 7 days for main charts

  const paymentData = [
    { name: "Pending", value: payments?.pending || 0 },
    { name: "Requested", value: payments?.requested || 0 },
    { name: "Completed", value: payments?.completed || 0 },
  ];

  const tableData = [
    { name: "Occupied", value: tables?.Occupied || 0 },
    { name: "Available", value: tables?.Available || 0 },
  ];

  // Format daily stats for charts - ALWAYS use only last 7 days
  const last7Days = dailyStats?.slice(-7) || [];
  const dailyChartData = last7Days.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    orders: day.orders,
    revenue: Math.round(day.revenue),
    revenueFormatted: `₹${Math.round(day.revenue).toLocaleString()}`
  }));

  // Calculate 7-day totals from last 7 days only
  const periodStats = last7Days.reduce((acc, day) => ({
    orders: acc.orders + day.orders,
    revenue: acc.revenue + Math.round(day.revenue)
  }), { orders: 0, revenue: 0 });

  return (
    <RoleBasedLayout>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Analytics</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isProPlan ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isProPlan ? 'Pro Plan' : 'Basic Plan'}
            </span>
          </div>
          <p className="text-gray-500 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Comprehensive overview of your restaurant performance
          </p>
        </div>

        {/* Today's Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Orders */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Today's Orders</p>
                <p className="mt-2 text-3xl font-semibold text-indigo-600">{todayStats?.orders || 0}</p>
                <p className="mt-1 text-xs text-gray-400">Orders placed today</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg shadow-inner">
                <ShoppingCart className="h-6 w-6 text-indigo-600" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Today's Revenue */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Today's Revenue</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-600">₹{Math.round(todayStats?.totalPotentialRevenue || todayStats?.revenue || 0).toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {todayStats?.revenue !== todayStats?.totalPotentialRevenue ? 
                    `₹${Math.round(todayStats?.revenue || 0).toLocaleString()} completed` : 
                    'Revenue generated today'
                  }
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg shadow-inner">
                <DollarSign className="h-6 w-6 text-emerald-600" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* 7-Day Orders */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">7-Day Orders</p>
                <p className="mt-2 text-3xl font-semibold text-purple-600">{periodStats.orders}</p>
                <p className="mt-1 text-xs text-gray-400">Last 7 days total</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg shadow-inner">
                <TrendingUp className="h-6 w-6 text-purple-600" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* 7-Day Revenue */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">7-Day Revenue</p>
                <p className="mt-2 text-3xl font-semibold text-amber-600">₹{Math.round(periodStats.revenue).toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-400">Last 7 days total</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg shadow-inner">
                <CreditCard className="h-6 w-6 text-amber-600" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* All Time Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Orders Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Orders</p>
                <p className="mt-2 text-3xl font-semibold text-indigo-600">{totalOrders.toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-400">All time orders</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg shadow-inner">
                <Table className="h-6 w-6 text-indigo-600" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-600">₹{Math.round(payments.totalRevenue).toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-400">Total earnings</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg shadow-inner">
                <CreditCard className="h-6 w-6 text-emerald-600" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Payment Status</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded-md">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Circle className="h-2 w-2 text-amber-500 fill-current" />
                    Pending
                  </span>
                  <span className="font-medium text-gray-900">{payments.pending}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Circle className="h-2 w-2 text-blue-500 fill-current" />
                    Requested
                  </span>
                  <span className="font-medium text-gray-900">{payments.requested}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-md">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-emerald-500 fill-current" />
                    Completed
                  </span>
                  <span className="font-medium text-gray-900">{payments.completed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 7-Day Revenue Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">7-Day Revenue Trend</h2>
              <p className="text-sm text-gray-500">Daily revenue over the last 7 days</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280' }}
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    formatter={(value) => [
                      <span className="font-semibold">₹{value.toLocaleString()}</span>,
                      <span className="text-gray-600">Revenue</span>
                    ]}
                    contentStyle={{
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      border: 'none'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 7-Day Orders Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">7-Day Orders Trend</h2>
              <p className="text-sm text-gray-500">Daily orders over the last 7 days</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    formatter={(value) => [`${value} orders`, '']}
                    contentStyle={{
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      border: 'none'
                    }}
                  />
                  <Bar 
                    dataKey="orders" 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    fill="#6366f1"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Status Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payment Status</h2>
              <p className="text-sm text-gray-500">Distribution of payment statuses</p>
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
                  >
                    {paymentData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke="#fff"
                        strokeWidth={2} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      <span className="font-semibold">{value} payments</span>,
                      <span className="text-gray-600">{name}</span>
                    ]}
                    contentStyle={{
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      border: 'none',
                      padding: '12px'
                    }}
                    itemStyle={{
                      padding: '4px 0'
                    }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value, entry, index) => (
                      <span className="flex items-center text-sm">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Occupancy Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Table Occupancy</h2>
              <p className="text-sm text-gray-500">Current table availability status</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tableData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    formatter={(value) => [`${value} tables`, '']}
                    contentStyle={{
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      border: 'none'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  >
                    {tableData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? "#6366f1" : "#10b981"} 
                        strokeWidth={index === 0 ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Section (Pro Only) */}
        {isProPlan && (
          <div className="mt-8 space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Advanced Analytics</h2>
                <p className="text-sm text-gray-600">Detailed insights and trends for better decision making</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Pro Feature
              </span>
            </div>

            {/* Advanced Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Order Value</p>
                    <p className="mt-2 text-2xl font-semibold text-blue-600">
                      ₹{payments.totalRevenue > 0 ? Math.round(payments.totalRevenue / totalOrders) : 0}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Orders per Day</p>
                    <p className="mt-2 text-2xl font-semibold text-green-600">
                      {dailyStats && dailyStats.length > 0 ? Math.round(periodStats.orders / 7) : 0}
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Peak Hour</p>
                    <p className="mt-2 text-2xl font-semibold text-orange-600">{data.peakHour || 'N/A'}</p>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Table Turnover</p>
                    <p className="mt-2 text-2xl font-semibold text-purple-600">{data.tableTurnover || 0}x</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Table className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* 30-Day Analytics Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">30-Day Performance Trend</h3>
                <p className="text-sm text-gray-600">Extended analytics showing month-long patterns</p>
              </div>
              
              {isProPlan && data.thirtyDayStats ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.thirtyDayStats.map(day => ({
                      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      orders: day.orders,
                      revenue: day.revenue
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        interval={4}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        formatter={(value, name) => [
                          name === 'revenue' ? `₹${value.toLocaleString()}` : `${value} orders`,
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                        contentStyle={{
                          borderRadius: '8px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          border: 'none'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8b5cf6" 
                        fill="#8b5cf6" 
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#f59e0b" 
                        fill="#f59e0b" 
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-gray-900 font-medium">30-Day Analytics Available</p>
                    <p className="text-sm text-gray-500">Extended trend analysis with Pro subscription</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        )}
        

        


      </div>
    </RoleBasedLayout>
  );
}
