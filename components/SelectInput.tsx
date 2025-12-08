import React, { forwardRef, useId, useMemo } from 'react';

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

/**
 * Improved SelectInput:
 * - preserves original API (existing props still supported)
 * - adds optional props (id, disabled, className, required, placeholder default)
 * - generates an accessible unique id if none provided
 * - slight UX/accessibility improvements
 * - wrapped in forwardRef + memo to avoid unnecessary re-renders and allow refs
 */

// Module-level sanitize utility function
function sanitize(s: string): string {
  return s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '').toLowerCase();
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, value, onChange, options, placeholder = 'Select an option', id, disabled = false, className = '', required = false }, ref) => {
    const reactId = useId();
    const selectId = useMemo(() => id || `${sanitize(label)}-${reactId}`, [id, label, reactId]);

    return (
      <div>
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span aria-hidden="true" className="ml-1 text-red-500">*</span>}
        </label>

        <select
          id={selectId}
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-required={required}
          className={
            `w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${className}`
          }
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

export default React.memo(SelectInput);
