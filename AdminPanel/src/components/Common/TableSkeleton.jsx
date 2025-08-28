import { motion } from 'framer-motion';
import Skeleton from './Skeleton';
import React from 'react';

const TableSkeleton = () => {
  const statusColors = [
    'bg-gradient-to-br from-stone-200 to-stone-300',
    'bg-gradient-to-br from-amber-100 to-amber-200', 
    'bg-gradient-to-br from-stone-100 to-stone-200',
    'bg-gradient-to-br from-stone-150 to-stone-250'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ 
            delay: index * 0.1,
            type: "spring",
            stiffness: 120,
            damping: 20
          }}
        >
          <Skeleton variant="card" className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:rotate-1">
            <div className={`h-40 flex items-center justify-center relative ${statusColors[index % statusColors.length]}`}>
              <motion.div 
                className="text-center z-10"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Skeleton className="h-8 w-24 mx-auto mb-2" variant="text" />
                <Skeleton className="h-4 w-16 mx-auto" variant="text" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Skeleton className="h-5 w-28 mb-2" variant="text" />
                  <Skeleton className="h-4 w-24" variant="text" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="w-6 h-6" variant="circle" />
                  <Skeleton className="w-6 h-6" variant="circle" />
                  <Skeleton className="w-6 h-6" variant="circle" />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20" variant="text" />
                  <Skeleton className="h-6 w-16" variant="button" />
                </div>
              </div>
            </div>
          </Skeleton>
        </motion.div>
      ))}
    </div>
  );
};

export default TableSkeleton;