import { motion } from 'framer-motion';
import Skeleton from './Skeleton';
import React from 'react';

const CategorySkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(8)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: index * 0.08,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
        >
          <Skeleton variant="card" className="p-4 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <Skeleton className="h-6 w-28 mb-1" variant="text" />
                <Skeleton className="h-3 w-16" variant="text" />
              </div>
              <div className="flex gap-2 ml-4">
                <Skeleton className="w-9 h-9" variant="button" />
                <Skeleton className="w-9 h-9" variant="button" />
              </div>
            </div>
          </Skeleton>
        </motion.div>
      ))}
    </div>
  );
};

export default CategorySkeleton;