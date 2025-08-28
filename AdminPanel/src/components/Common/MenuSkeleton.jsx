import { motion } from 'framer-motion';
import Skeleton from './Skeleton';
import React from 'react';

const MenuSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            delay: index * 0.12,
            type: "spring",
            stiffness: 150,
            damping: 25
          }}
        >
          <Skeleton variant="card" className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
            <div className="relative">
              <Skeleton className="h-48 w-full" variant="image" />
              <div className="absolute top-3 right-3">
                <Skeleton className="w-8 h-8" variant="circle" />
              </div>
            </div>
            <div className="p-5">
              <div className="mb-3">
                <Skeleton className="h-7 w-4/5 mb-2" variant="text" />
                <Skeleton className="h-4 w-full mb-1" variant="text" />
                <Skeleton className="h-4 w-3/4" variant="text" />
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <Skeleton className="h-3 w-12 mb-1" variant="text" />
                  <Skeleton className="h-6 w-16" variant="text" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8" variant="circle" />
                  <Skeleton className="w-8 h-8" variant="circle" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" variant="text" />
                  <Skeleton className="h-6 w-12" variant="button" />
                </div>
              </div>
            </div>
          </Skeleton>
        </motion.div>
      ))}
    </div>
  );
};

export default MenuSkeleton;