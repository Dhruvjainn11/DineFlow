import { motion } from 'framer-motion';
import Skeleton from './Skeleton';
import React from 'react';

const OrderSkeleton = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" variant="text" />
          <Skeleton className="h-4 w-80" variant="text" />
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Skeleton className="h-8 w-32" variant="button" />
          <Skeleton className="h-8 w-28" variant="button" />
          <Skeleton className="h-8 w-20" variant="button" />
        </div>
      </div>

      {/* Order Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100
            }}
          >
            <Skeleton variant="card" className="overflow-hidden">
              {/* Card Header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-16" variant="button" />
                  <Skeleton className="h-6 w-20" variant="button" />
                </div>
                <Skeleton className="h-4 w-12" variant="text" />
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" variant="circle" />
                    <Skeleton className="h-4 w-24" variant="text" />
                  </div>
                  <Skeleton className="h-5 w-16" variant="button" />
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Skeleton className="h-4 w-32 mb-3" variant="text" />
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i}>
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-32" variant="text" />
                          <Skeleton className="h-4 w-12" variant="text" />
                        </div>
                        {i === 0 && (
                          <Skeleton className="h-6 w-40 mt-1" variant="button" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div>
                    <Skeleton className="h-3 w-16 mb-1" variant="text" />
                    <Skeleton className="h-4 w-20" variant="text" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-3 w-8 mb-1" variant="text" />
                    <Skeleton className="h-5 w-16" variant="text" />
                  </div>
                </div>
              </div>
            </Skeleton>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OrderSkeleton;