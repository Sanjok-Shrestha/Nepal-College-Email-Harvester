import React from 'react';

interface SpinnerProps {
  large?: boolean;
  className?: string;
  label?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ large = false, className = '', label = 'Loading' }) => {
  const sizeClasses = large ? 'h-10 w-10' : 'h-5 w-5';
  return (
    <span role="status" aria-live="polite" className={`inline-flex items-center ${className}`}>
      <svg
        className={`motion-safe:animate-spin ${sizeClasses} text-white dark:text-indigo-400 mr-3`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        focusable="false"
        role="img"
        aria-label={label}
      >
        <title>{label}</title>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>

      <span className="sr-only">{label}</span>
    </span>
  );
};

export default Spinner;
