import { motion } from 'framer-motion';
import Skeleton from './Skeleton';
import React from 'react';

const AnalyticsSkeleton = () => {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" variant="text" />
          <Skeleton className="h-6 w-20" variant="button" />
        </div>
        <Skeleton className="h-4 w-96" variant="text" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Skeleton variant="card" className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-3 w-24 mb-3" variant="text" />
                  <Skeleton className="h-8 w-16 mb-2" variant="text" />
                  <Skeleton className="h-3 w-20" variant="text" />
                </div>
                <Skeleton className="w-12 h-12" variant="circle" />
              </div>
            </Skeleton>
          </motion.div>
        ))}
      </div>

      {/* All Time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Skeleton variant="card" className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-3 w-20 mb-3" variant="text" />
                  <Skeleton className="h-8 w-24 mb-2" variant="text" />
                  <Skeleton className="h-3 w-16" variant="text" />
                </div>
                <Skeleton className="w-12 h-12" variant="circle" />
              </div>
            </Skeleton>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.2 }}
          >
            <Skeleton variant="card" className="p-6">
              <div className="mb-4">
                <Skeleton className="h-5 w-32 mb-2" variant="text" />
                <Skeleton className="h-4 w-48" variant="text" />
              </div>
              <Skeleton className="h-[300px] w-full" variant="image" />
            </Skeleton>
          </motion.div>
        ))}
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 + index * 0.2 }}
          >
            <Skeleton variant="card" className="p-6">
              <div className="mb-4">
                <Skeleton className="h-5 w-28 mb-2" variant="text" />
                <Skeleton className="h-4 w-40" variant="text" />
              </div>
              <Skeleton className="h-[300px] w-full" variant="image" />
            </Skeleton>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;