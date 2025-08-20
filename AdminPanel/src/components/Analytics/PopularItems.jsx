import React from 'react';

const PopularItems = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <div className="text-2xl mb-2">🍽️</div>
          <p>No popular items data</p>
        </div>
      </div>
    );
  }

  const maxQuantity = Math.max(...items.map(item => item.totalOrdered || 0));

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-amber-800">#{index + 1}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item._id || item.name || 'Unknown Item'}
              </p>
              <span className="text-sm text-gray-500">
                {item.totalOrdered || 0} sold
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full"
                style={{ 
                  width: `${maxQuantity > 0 ? ((item.totalOrdered || 0) / maxQuantity) * 100 : 0}%` 
                }}
              ></div>
            </div>
            {item.totalRevenue && (
              <p className="text-xs text-gray-500 mt-1">
                Revenue: ₹{item.totalRevenue.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PopularItems;