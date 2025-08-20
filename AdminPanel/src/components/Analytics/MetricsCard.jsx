import React from 'react';

const MetricsCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color = 'blue',
  subtitle 
}) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      trend: trend === 'up' ? 'text-green-600' : 'text-red-600'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      trend: trend === 'up' ? 'text-green-600' : 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      trend: trend === 'up' ? 'text-green-600' : 'text-red-600'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      trend: trend === 'up' ? 'text-green-600' : 'text-red-600'
    }
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${classes.bg} rounded-md p-3`}>
          <span className={`text-2xl ${classes.icon}`}>{icon}</span>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {change !== undefined && change !== null && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${classes.trend}`}>
                  {trend === 'up' ? (
                    <svg className="self-center flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="self-center flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="sr-only">
                    {trend === 'up' ? 'Increased' : 'Decreased'} by
                  </span>
                  {Math.abs(change)}%
                </div>
              )}
            </dd>
            {subtitle && (
              <dd className="text-sm text-gray-500 mt-1">
                {subtitle}
              </dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;