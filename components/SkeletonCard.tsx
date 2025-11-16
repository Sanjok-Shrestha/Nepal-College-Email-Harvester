import React from 'react';

interface SkeletonCardProps {
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse ${className}`}
    >
      <span className="sr-only">Loading content…</span>

      <div className="p-6">
        <div aria-hidden="true" className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div aria-hidden="true" className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
            <div aria-hidden="true" className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>

          <div className="flex items-center space-x-3">
            <div aria-hidden="true" className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
            <div aria-hidden="true" className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div aria-hidden="true" className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div aria-hidden="true" className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;