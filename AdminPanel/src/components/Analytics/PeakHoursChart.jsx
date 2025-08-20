import React from 'react';

const PeakHoursChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <div className="text-2xl mb-2">⏰</div>
          <p>No peak hours data</p>
        </div>
      </div>
    );
  }

  const maxOrders = Math.max(...data.map(hour => hour.orders || 0));

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-24 gap-1 h-32">
        {Array.from({ length: 24 }, (_, hour) => {
          const hourData = data.find(d => d._id === hour);
          const orderCount = hourData?.orders || 0;
          const height = maxOrders > 0 ? (orderCount / maxOrders) * 100 : 0;
          
          return (
            <div key={hour} className="flex flex-col items-center">
              <div className="flex-1 flex items-end">
                <div 
                  className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-sm"
                  style={{ height: `${height}%` }}
                  title={`${formatHour(hour)}: ${orderCount} orders`}
                ></div>
              </div>
              {hour % 4 === 0 && (
                <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                  {formatHour(hour)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Top Peak Hours</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data
            .sort((a, b) => (b.orders || 0) - (a.orders || 0))
            .slice(0, 3)
            .map((hour, index) => (
              <div key={hour._id} className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {formatHour(hour._id)}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    #{index + 1}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-lg font-bold text-blue-600">
                    {hour.orders || 0}
                  </span>
                  <span className="text-sm text-blue-500 ml-1">orders</span>
                </div>
                {hour.revenue && (
                  <div className="text-xs text-blue-600 mt-1">
                    ₹{hour.revenue.toLocaleString()} revenue
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PeakHoursChart;