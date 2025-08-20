import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import FeatureGate, { FeatureToggle } from '../Common/FeatureGate';
import { createAnalyticsService, formatCurrency, formatPercentage, calculatePercentageChange } from '../../services/analyticsService';

// Import chart components (we'll need to install chart library)
import MetricsCard from './MetricsCard';
import SalesChart from './SalesChart';
import PopularItems from './PopularItems';
import PeakHoursChart from './PeakHoursChart';
import TableAnalytics from './TableAnalytics';
import QRAnalytics from './QRAnalytics';

const AnalyticsDashboard = () => {
  const { hasFeature, cafeInfo } = useTheme();
  const { token } = useAuth();
  const [analyticsService] = useState(() => createAnalyticsService(token));
  
  // State management
  const [dateRange, setDateRange] = useState(hasFeature('thirtyDayAnalytics') ? 30 : 7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data state
  const [overview, setOverview] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [popularItems, setPopularItems] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [tableAnalytics, setTableAnalytics] = useState([]);
  const [qrAnalytics, setQrAnalytics] = useState(null);
  const [error, setError] = useState(null);

  // Available date ranges based on plan
  const availableDateRanges = useMemo(() => {
    const basicRanges = [
      { value: 1, label: 'Today' },
      { value: 7, label: 'Last 7 Days' }
    ];
    
    const proRanges = [
      ...basicRanges,
      { value: 14, label: 'Last 2 Weeks' },
      { value: 30, label: 'Last 30 Days' },
      { value: 90, label: 'Last 3 Months' }
    ];
    
    return overview?.planType === 'pro' ? proRanges : basicRanges;
  }, [overview?.planType]);

  // Available tabs based on plan
  const availableTabs = useMemo(() => {
    const basicTabs = [
      { id: 'overview', label: 'Overview', icon: '📊' }
    ];
    
    const proTabs = [
      ...basicTabs,
      { id: 'sales', label: 'Sales', icon: '💰' },
      { id: 'customers', label: 'Customers', icon: '👥' },
      { id: 'tables', label: 'Tables', icon: '🪑' },
      { id: 'qr-codes', label: 'QR Codes', icon: '📱' }
    ];
    
    return overview?.planType === 'pro' ? proTabs : basicTabs;
  }, [overview?.planType]);

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, token]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load overview data (available to all plans)
      const overviewData = await analyticsService.getDashboardOverview(dateRange);
      setOverview(overviewData.data);
      
      // Set popular items from overview if available
      if (overviewData.data.popularItems) {
        setPopularItems(overviewData.data.popularItems);
      }
      
      // Set peak hours from overview if available (Pro only)
      if (overviewData.data.peakHours) {
        setPeakHours(overviewData.data.peakHours);
      }

      // Load sales data
      const sales = await analyticsService.getSalesAnalytics(dateRange);
      setSalesData(sales.data);

      // Load order data
      const orders = await analyticsService.getOrderAnalytics(dateRange);
      setOrderData(orders.data);

      // Popular items are now loaded from overview data above

      // Pro-only features
      if (hasFeature('advancedAnalytics')) {
        const [peakHoursData, tableData, qrData] = await Promise.all([
          analyticsService.getPeakHours(dateRange),
          analyticsService.getTableAnalytics(dateRange),
          analyticsService.getQRAnalytics(dateRange)
        ]);

        setPeakHours(peakHoursData.data);
        setTableAnalytics(tableData.data);
        setQrAnalytics(qrData.data);
      }

    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const handleExport = async () => {
    if (!hasFeature('advancedAnalytics')) return;
    
    try {
      const blob = await analyticsService.exportAnalytics(dateRange, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${cafeInfo.name}-${dateRange}days.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Track your restaurant's performance and insights
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Plan indicator */}
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                overview?.planType === 'pro'
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {overview?.planType === 'pro' ? 'Pro Analytics' : 'Basic Analytics'}
              </span>
            </div>

            {/* Date range selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            >
              {availableDateRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Action buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {refreshing ? '↻' : '🔄'} Refresh
              </button>
              
              {overview?.planType === 'pro' && (
                <button
                  onClick={handleExport}
                  className="px-3 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90"
                >
                  📊 Export
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Plan info */}
        {overview?.planType === 'pro' ? (
          <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-900">Pro Analytics Active</h4>
                <p className="text-xs text-purple-700 mt-1">
                  30-day history • Peak hours • Popular items • Hourly patterns • Export data
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-gray-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900">Basic Analytics</h4>
                <p className="text-xs text-blue-700 mt-1">
                  7-day history • Basic metrics • Top 5 items
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      {availableTabs.length > 1 && (
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {availableTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Overview Metrics - Always visible */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Revenue"
            value={formatCurrency(overview.payments?.totalRevenue || 0)}
            change={overview.payments?.revenueChange || 0}
            trend={(overview.payments?.revenueChange || 0) >= 0 ? 'up' : 'down'}
            icon="💰"
            color="green"
          />
          <MetricsCard
            title="Total Orders"
            value={overview.totalOrders || 0}
            change={overview.ordersChange || 0}
            trend={(overview.ordersChange || 0) >= 0 ? 'up' : 'down'}
            icon="📋"
            color="blue"
          />
          <MetricsCard
            title="Average Order Value"
            value={formatCurrency((overview.payments?.totalRevenue || 0) / (overview.totalOrders || 1))}
            change={overview.aovChange || 0}
            trend={(overview.aovChange || 0) >= 0 ? 'up' : 'down'}
            icon="💵"
            color="purple"
          />
          <MetricsCard
            title={hasFeature('advancedAnalytics') ? "Completed Payments" : "Active Tables"}
            value={hasFeature('advancedAnalytics') ? (overview.payments?.completed || 0) : (overview.tables?.Occupied || 0)}
            change={hasFeature('advancedAnalytics') ? (overview.payments?.completedChange || 0) : (overview.tables?.change || 0)}
            trend={hasFeature('advancedAnalytics') ? 
              ((overview.payments?.completedChange || 0) >= 0 ? 'up' : 'down') : 
              ((overview.tables?.change || 0) >= 0 ? 'up' : 'down')
            }
            icon={hasFeature('advancedAnalytics') ? "✅" : "🪑"}
            color="orange"
          />
        </div>
      )}

      {/* Content based on active tab or plan */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          {salesData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
              <SalesChart data={salesData} dateRange={dateRange} />
            </div>
          )}

          {/* Popular Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Popular Items</h3>
              <span className="text-sm text-gray-500">
                Top {overview?.planType === 'pro' ? '10' : '5'}
              </span>
            </div>
            <PopularItems items={popularItems} />
            {overview?.planType === 'basic' && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  📈 Upgrade to Pro for top 10 items, revenue tracking, and hourly analysis
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pro-only features in overview */}
      {overview?.planType === 'pro' && overview?.peakHours && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours (Last 30 Days)</h3>
          <PeakHoursChart data={overview.peakHours} />
        </div>
      )}
      
      {overview?.planType === 'pro' && overview?.hourlyStats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Order Pattern (Last Week)</h3>
          <div className="grid grid-cols-24 gap-1 h-32">
            {Array.from({ length: 24 }, (_, hour) => {
              const hourData = overview.hourlyStats.find(h => h._id === hour);
              const orders = hourData?.orders || 0;
              const maxOrders = Math.max(...overview.hourlyStats.map(h => h.orders));
              const height = maxOrders > 0 ? (orders / maxOrders) * 100 : 0;
              
              return (
                <div key={hour} className="flex flex-col items-center">
                  <div className="flex-1 flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-sm"
                      style={{ height: `${height}%` }}
                      title={`${hour}:00 - ${orders} orders`}
                    ></div>
                  </div>
                  {hour % 6 === 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour-12}PM`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Pro-only tabs */}
      {overview?.planType === 'pro' && (
        <>
          {activeTab === 'sales' && salesData && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Sales Analysis</h3>
                <SalesChart data={salesData} dateRange={dateRange} detailed={true} />
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Table Performance</h3>
              <TableAnalytics data={tableAnalytics} />
            </div>
          )}

          {activeTab === 'qr-codes' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Analytics</h3>
              <QRAnalytics data={qrAnalytics} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
