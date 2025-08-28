import { motion } from 'framer-motion';
import React from 'react';

const Skeleton = ({ className = '', variant = 'default', children }) => {
  const variants = {
    default: 'bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200',
    card: 'bg-white shadow-xl rounded-xl border border-stone-100',
    text: 'bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 rounded-md',
    button: 'bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 rounded-lg',
    circle: 'bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 rounded-full',
    image: 'bg-gradient-to-br from-stone-200 via-stone-150 to-stone-200 rounded-lg'
  };

  return (
    <motion.div
      className={`${variants[variant]} ${className} relative overflow-hidden`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        backgroundSize: '200% 100%'
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-300/30 to-transparent -skew-x-12 w-full h-full"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      {children}
    </motion.div>
  );
};

export default Skeleton;