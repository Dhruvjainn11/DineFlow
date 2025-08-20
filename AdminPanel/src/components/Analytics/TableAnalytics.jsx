import React from 'react';

const TableAnalytics = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <div className="text-2xl mb-2">🪑</div>
          <p>No table analytics data</p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(table => table.revenue || 0));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((table, index) => (
          <div key={table.tableNumber || index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">
                Table {table.tableNumber || index + 1}
              </h4>
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                {table.totalOrders || 0} orders
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="text-sm font-medium text-green-600">
                  ₹{(table.revenue || 0).toLocaleString()}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                  style={{ 
                    width: `${maxRevenue > 0 ? ((table.revenue || 0) / maxRevenue) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Utilization: {table.utilization || 0}%</span>
                <span>Avg: ₹{Math.round((table.revenue || 0) / (table.totalOrders || 1))}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Performance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.reduce((sum, table) => sum + (table.totalOrders || 0), 0)}
            </div>
            <div className="text-sm text-blue-500">Total Orders</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹{data.reduce((sum, table) => sum + (table.revenue || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-500">Total Revenue</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(data.reduce((sum, table) => sum + (table.utilization || 0), 0) / data.length)}%
            </div>
            <div className="text-sm text-purple-500">Avg Utilization</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {data.length}
            </div>
            <div className="text-sm text-orange-500">Active Tables</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableAnalytics;