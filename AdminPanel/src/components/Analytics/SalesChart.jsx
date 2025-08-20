import React from 'react';

const SalesChart = ({ data, dateRange, detailed = false }) => {
  if (!data || !data.dailyStats) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No sales data available</p>
        </div>
      </div>
    );
  }

  const { dailyStats } = data;
  const maxRevenue = Math.max(...dailyStats.map(day => day.revenue));

  return (
    <div className="space-y-4">
      {detailed && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹{dailyStats.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {dailyStats.reduce((sum, day) => sum + day.orders, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ₹{Math.round(dailyStats.reduce((sum, day) => sum + day.revenue, 0) / dailyStats.reduce((sum, day) => sum + day.orders, 0) || 0)}
            </div>
            <div className="text-sm text-gray-500">Avg Order Value</div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {dailyStats.map((day, index) => (
          <div key={day.date} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600">
              {new Date(day.date).toLocaleDateString('en-IN', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0}%` }}
              >
                <span className="text-white text-xs font-medium">
                  ₹{day.revenue.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="w-16 text-sm text-gray-600 text-right">
              {day.orders} orders
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesChart;