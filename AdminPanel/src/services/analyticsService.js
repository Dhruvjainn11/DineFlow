import { useAuth } from '../context/AuthContext';

/**
 * Analytics Service - Handles data fetching and processing for analytics dashboard
 */
export class AnalyticsService {
  constructor(token) {
    this.token = token;
    this.baseURL = '/api';
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Get dashboard overview data
  async getDashboardOverview(dateRange = 7) {
    return this.apiCall(`/analytics/summary?days=${dateRange}`);
  }

  // Get sales analytics
  async getSalesAnalytics(dateRange = 7, granularity = 'day') {
    return this.apiCall(`/analytics/sales?days=${dateRange}&granularity=${granularity}`);
  }

  // Get order analytics
  async getOrderAnalytics(dateRange = 7) {
    return this.apiCall(`/analytics/orders?days=${dateRange}`);
  }

  // Get popular items (Basic: top 5, Pro: top 20)
  async getPopularItems(dateRange = 7, limit = 5) {
    return this.apiCall(`/analytics/popular-items?days=${dateRange}&limit=${limit}`);
  }

  // Get peak hours analysis (Pro only)
  async getPeakHours(dateRange = 30) {
    return this.apiCall(`/analytics/peak-hours?days=${dateRange}`);
  }

  // Get table analytics (Pro only)
  async getTableAnalytics(dateRange = 30) {
    return this.apiCall(`/analytics/tables?days=${dateRange}`);
  }

  // Get QR code analytics (Pro only)
  async getQRAnalytics(dateRange = 30) {
    return this.apiCall(`/analytics/qr-codes?days=${dateRange}`);
  }

  // Get customer analytics (Pro only)
  async getCustomerAnalytics(dateRange = 30) {
    return this.apiCall(`/analytics/customers?days=${dateRange}`);
  }

  // Get category performance (Pro only)
  async getCategoryAnalytics(dateRange = 30) {
    return this.apiCall(`/analytics/categories?days=${dateRange}`);
  }

  // Get revenue forecasting (Pro only)
  async getRevenueForecast() {
    return this.apiCall('/analytics/forecast');
  }

  // Export analytics data (Pro only)
  async exportAnalytics(dateRange = 30, format = 'csv') {
    const response = await fetch(`${this.baseURL}/analytics/export?days=${dateRange}&format=${format}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }

  // Real-time analytics (Pro only)
  async getRealTimeData() {
    return this.apiCall('/analytics/realtime');
  }
}

/**
 * Analytics Helper Functions
 */

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Format currency
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value) => {
  return `${value >= 0 ? '+' : ''}${value}%`;
};

// Calculate growth rate
export const calculateGrowthRate = (data) => {
  if (data.length < 2) return 0;
  
  const recent = data.slice(-7).reduce((sum, item) => sum + item.value, 0);
  const previous = data.slice(-14, -7).reduce((sum, item) => sum + item.value, 0);
  
  return calculatePercentageChange(recent, previous);
};

// Group data by time period
export const groupDataByPeriod = (data, period = 'day') => {
  const grouped = {};
  
  data.forEach(item => {
    const date = new Date(item.date);
    let key;
    
    switch (period) {
      case 'hour':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${date.getMonth()}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });
  
  return grouped;
};

// Calculate average order value
export const calculateAOV = (orders) => {
  if (orders.length === 0) return 0;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  return totalRevenue / orders.length;
};

// Find peak hours
export const findPeakHours = (orders) => {
  const hourCounts = {};
  
  orders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const sortedHours = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
    
  return sortedHours.map(([hour, count]) => ({
    hour: parseInt(hour),
    orderCount: count,
    timeLabel: formatHour(parseInt(hour))
  }));
};

// Format hour for display
const formatHour = (hour) => {
  if (hour === 0) return '12:00 AM';
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
};

// Calculate table utilization
export const calculateTableUtilization = (tables, orders) => {
  const tableStats = {};
  
  tables.forEach(table => {
    tableStats[table._id] = {
      tableNumber: table.number,
      totalOrders: 0,
      revenue: 0,
      utilization: 0
    };
  });
  
  orders.forEach(order => {
    if (order.tableId && tableStats[order.tableId]) {
      tableStats[order.tableId].totalOrders += 1;
      tableStats[order.tableId].revenue += order.total;
    }
  });
  
  return Object.values(tableStats).sort((a, b) => b.revenue - a.revenue);
};

// Factory function to create analytics service instance
export const createAnalyticsService = (token) => {
  return new AnalyticsService(token);
};

export default AnalyticsService;
