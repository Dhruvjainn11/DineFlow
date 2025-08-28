import React from 'react';

// Base skeleton component with animation
const SkeletonBase = ({ className = "" }) => (
  <div className={`animate-pulse bg-theme-primary-100 rounded ${className}`}></div>
);

// Menu Page Skeleton
export const MenuPageSkeleton = () => (
  <div className="max-w-[480px] mx-auto bg-theme-secondary min-h-screen pb-16">
    {/* Header Skeleton */}
    <div className="sticky top-0 z-20 bg-theme-secondary shadow-sm border-b border-theme-primary-100">
      <div className="p-4">
        <SkeletonBase className="h-8 w-48 mx-auto mb-4" />
        <SkeletonBase className="h-10 w-full rounded-full" />
      </div>
      {/* Category Navigation Skeleton */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto">
          {[1, 2, 3, 4].map(i => (
            <SkeletonBase key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>

    {/* Menu Items Skeleton */}
    <div className="p-4 mt-2 space-y-8">
      {[1, 2].map(section => (
        <div key={section}>
          <div className="flex items-center mb-4">
            <SkeletonBase className="w-1 h-6 rounded-full mr-3" />
            <SkeletonBase className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(item => (
              <div key={item} className="bg-white rounded-xl shadow-sm border border-theme-primary-100">
                <div className="relative pt-[100%]">
                  <SkeletonBase className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-36 rounded-full" />
                </div>
                <div className="relative bottom-6 p-3">
                  <SkeletonBase className="h-4 w-full mb-2" />
                  <SkeletonBase className="h-3 w-3/4 mb-2" />
                  <div className="flex justify-between items-center">
                    <SkeletonBase className="h-4 w-16" />
                    <SkeletonBase className="h-6 w-12 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Cart Page Skeleton
export const CartPageSkeleton = () => (
  <div className="max-w-[480px] mx-auto bg-theme-secondary min-h-screen pb-20">
    <div className="p-4">
      {/* Header */}
      <SkeletonBase className="h-8 w-32 mx-auto mb-6" />
      
      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {[1, 2, 3].map(item => (
          <div key={item} className="bg-white rounded-xl p-4 shadow-sm border border-theme-primary-100">
            <div className="flex items-center space-x-4">
              <SkeletonBase className="w-16 h-16 rounded-lg" />
              <div className="flex-1">
                <SkeletonBase className="h-4 w-3/4 mb-2" />
                <SkeletonBase className="h-3 w-1/2 mb-2" />
                <SkeletonBase className="h-4 w-16" />
              </div>
              <div className="flex items-center space-x-2">
                <SkeletonBase className="w-8 h-8 rounded-full" />
                <SkeletonBase className="w-6 h-4" />
                <SkeletonBase className="w-8 h-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-theme-primary-100">
        <SkeletonBase className="h-5 w-32 mb-4" />
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <SkeletonBase className="h-4 w-16" />
            <SkeletonBase className="h-4 w-12" />
          </div>
          <div className="flex justify-between">
            <SkeletonBase className="h-4 w-20" />
            <SkeletonBase className="h-4 w-12" />
          </div>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <SkeletonBase className="h-5 w-16" />
          <SkeletonBase className="h-5 w-16" />
        </div>
      </div>
    </div>

    {/* Fixed Bottom Button */}
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      <div className="max-w-[480px] mx-auto">
        <SkeletonBase className="h-12 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

// Order Page Skeleton
export const OrderPageSkeleton = () => (
  <div className="flex flex-col min-h-screen bg-gradient-to-b from-theme-secondary to-white">
    <div className="flex-grow px-4 py-6 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <SkeletonBase className="h-8 w-64 mx-auto mb-2" />
          <SkeletonBase className="h-5 w-32 mx-auto mb-3" />
          <SkeletonBase className="h-8 w-24 mx-auto rounded-full" />
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {[1, 2].map(order => (
            <div key={order} className="bg-white rounded-xl shadow-lg border border-gray-100">
              {/* Order Header */}
              <div className="bg-theme-primary px-4 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <SkeletonBase className="h-5 w-32 mb-1 bg-theme-primary-dark" />
                    <SkeletonBase className="h-3 w-24 bg-theme-primary-dark" />
                  </div>
                  <SkeletonBase className="h-6 w-16 rounded-full bg-theme-primary-dark" />
                </div>
              </div>

              {/* Order Body */}
              <div className="p-4">
                {/* Status Indicators */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <SkeletonBase className="h-3 w-20 mb-2" />
                    <SkeletonBase className="h-8 w-32 rounded-lg" />
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <SkeletonBase className="h-6 w-6 rounded mr-2" />
                    <SkeletonBase className="h-5 w-32" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2].map(item => (
                      <div key={item} className="py-3 flex justify-between items-start">
                        <div className="flex items-start flex-1">
                          <SkeletonBase className="w-8 h-8 rounded-md mr-3" />
                          <div className="flex-1">
                            <SkeletonBase className="h-4 w-3/4 mb-1" />
                            <SkeletonBase className="h-3 w-1/2" />
                          </div>
                        </div>
                        <div className="text-right">
                          <SkeletonBase className="h-4 w-12 mb-1" />
                          <SkeletonBase className="h-3 w-16 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-theme-secondary to-white rounded-xl p-4 border border-theme-primary-100">
                  <div className="text-center mb-3">
                    <SkeletonBase className="h-4 w-24 mx-auto mb-1" />
                    <SkeletonBase className="h-6 w-20 mx-auto" />
                  </div>
                  <div className="flex justify-center">
                    <SkeletonBase className="h-8 w-32 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Payment Page Skeleton
export const PaymentPageSkeleton = () => (
  <div className="min-h-screen bg-theme-secondary pb-20">
    <div className="max-w-md mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <SkeletonBase className="h-7 w-48 mx-auto mb-2" />
        <SkeletonBase className="h-5 w-32 mx-auto" />
      </div>

      {/* Orders */}
      {[1, 2].map(order => (
        <div key={order} className="bg-white shadow-lg p-4 mb-4 rounded-xl border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <SkeletonBase className="h-4 w-32 mb-1" />
              <SkeletonBase className="h-3 w-24" />
            </div>
            <div className="text-right">
              <SkeletonBase className="h-4 w-16 mb-1" />
              <SkeletonBase className="h-3 w-20" />
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-4">
            <SkeletonBase className="h-4 w-20 mb-3" />
            <div className="space-y-2">
              {[1, 2].map(item => (
                <div key={item} className="flex justify-between items-start p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <SkeletonBase className="h-3 w-3/4 mb-1" />
                    <SkeletonBase className="h-3 w-1/2" />
                  </div>
                  <div className="text-right">
                    <SkeletonBase className="h-3 w-12 mb-1" />
                    <SkeletonBase className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Payment Summary */}
      <div className="mt-6 mb-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <div className="mb-3 text-center">
            <SkeletonBase className="h-4 w-24 mx-auto mb-1" />
            <SkeletonBase className="h-6 w-20 mx-auto" />
          </div>
          <SkeletonBase className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);