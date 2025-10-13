import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;