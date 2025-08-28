import { motion } from 'framer-motion';
import Skeleton from './Skeleton';
import React from 'react';

const PaymentSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" variant="text" />
        <Skeleton className="h-8 w-24" variant="button" />
      </div>

      {/* Payment Table */}
      <Skeleton variant="card" className="overflow-hidden">
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-5 gap-4">
              <Skeleton className="h-4 w-12" variant="text" />
              <Skeleton className="h-4 w-20" variant="text" />
              <Skeleton className="h-4 w-16" variant="text" />
              <Skeleton className="h-4 w-18" variant="text" />
              <Skeleton className="h-4 w-14" variant="text" />
            </div>
          </div>

          {/* Table Rows */}
          <div className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-6 py-4"
              >
                <div className="grid grid-cols-5 gap-4 items-center">
                  {/* Table Column */}
                  <div className="flex items-center">
                    <Skeleton className="w-10 h-10 mr-4" variant="circle" />
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" variant="text" />
                      <Skeleton className="h-3 w-12" variant="text" />
                    </div>
                  </div>

                  {/* Amount */}
                  <Skeleton className="h-6 w-20" variant="text" />

                  {/* Status */}
                  <Skeleton className="h-6 w-18" variant="button" />

                  {/* Requested Time */}
                  <Skeleton className="h-4 w-24" variant="text" />

                  {/* Actions */}
                  <div className="flex justify-end space-x-2">
                    <Skeleton className="h-8 w-20" variant="button" />
                    <Skeleton className="h-8 w-24" variant="button" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Skeleton>
    </div>
  );
};

export default PaymentSkeleton;