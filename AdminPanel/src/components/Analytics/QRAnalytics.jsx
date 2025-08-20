import React from 'react';

const QRAnalytics = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <div className="text-2xl mb-2">📱</div>
          <p>No QR analytics data</p>
        </div>
      </div>
    );
  }

  const mockData = {
    totalScans: 245,
    uniqueScans: 189,
    conversionRate: 77.1,
    topTables: [
      { tableNumber: 5, scans: 32, orders: 28 },
      { tableNumber: 3, scans: 28, orders: 24 },
      { tableNumber: 7, scans: 25, orders: 19 },
      { tableNumber: 1, scans: 22, orders: 20 },
      { tableNumber: 4, scans: 19, orders: 15 }
    ],
    scansByHour: [
      { hour: 12, scans: 15 },
      { hour: 13, scans: 22 },
      { hour: 14, scans: 18 },
      { hour: 19, scans: 28 },
      { hour: 20, scans: 35 },
      { hour: 21, scans: 24 }
    ]
  };

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-3xl mr-3">📱</div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {mockData.totalScans}
              </div>
              <div className="text-sm text-blue-500">Total QR Scans</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-3xl mr-3">👥</div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {mockData.uniqueScans}
              </div>
              <div className="text-sm text-green-500">Unique Visitors</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-3xl mr-3">📈</div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {mockData.conversionRate}%
              </div>
              <div className="text-sm text-purple-500">Conversion Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Tables */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Top Performing Tables
        </h4>
        <div className="space-y-3">
          {mockData.topTables.map((table, index) => (
            <div key={table.tableNumber} className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-amber-800">#{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Table {table.tableNumber}
                  </span>
                  <div className="text-sm text-gray-500">
                    {table.scans} scans → {table.orders} orders
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full"
                    style={{ width: `${(table.orders / table.scans) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Conversion: {Math.round((table.orders / table.scans) * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scan Activity by Hour */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          QR Scan Activity by Hour
        </h4>
        <div className="space-y-2">
          {mockData.scansByHour.map((hourData) => {
            const maxScans = Math.max(...mockData.scansByHour.map(h => h.scans));
            return (
              <div key={hourData.hour} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-gray-600">
                  {formatHour(hourData.hour)}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(hourData.scans / maxScans) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {hourData.scans}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QRAnalytics;