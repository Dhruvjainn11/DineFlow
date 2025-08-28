import { motion } from 'framer-motion';
import Skeleton from './Skeleton';
import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#f7f3e8'}}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-stone-200">
        <div className="flex items-center justify-between px-6 py-4">
          <Skeleton className="h-8 w-32" variant="text" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-8 h-8" variant="circle" />
            <Skeleton className="w-8 h-8" variant="circle" />
            <Skeleton className="w-32 h-8" variant="button" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-stone-200 min-h-screen">
          <div className="p-6">
            <Skeleton className="h-8 w-24 mb-6" variant="text" />
            <div className="space-y-3">
              {[...Array(8)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <Skeleton className="w-5 h-5" variant="circle" />
                  <Skeleton className="h-4 w-20" variant="text" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" variant="text" />
              <Skeleton className="h-8 w-32" variant="button" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Skeleton variant="card" className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Skeleton className="h-3 w-20 mb-3" variant="text" />
                        <Skeleton className="h-8 w-16 mb-2" variant="text" />
                        <Skeleton className="h-3 w-16" variant="text" />
                      </div>
                      <Skeleton className="w-12 h-12" variant="circle" />
                    </div>
                  </Skeleton>
                </motion.div>
              ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="lg:col-span-2"
              >
                <Skeleton variant="card" className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" variant="text" />
                  <Skeleton className="h-64 w-full" variant="image" />
                </Skeleton>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Skeleton variant="card" className="p-6">
                  <Skeleton className="h-6 w-24 mb-4" variant="text" />
                  <div className="space-y-3">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-20" variant="text" />
                        <Skeleton className="h-4 w-12" variant="text" />
                      </div>
                    ))}
                  </div>
                </Skeleton>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;