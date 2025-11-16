import React, { useState, useRef, useEffect, memo } from 'react';
import { College } from '../types';

interface CollegeCardProps {
  college: College;
}

const CollegeCard: React.FC<CollegeCardProps> = ({ college }) => {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Prevent scrolling to bottom
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  };

  const handleCopy = async (email: string) => {
    if (!email) return;
    try {
      let ok = false;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
        ok = true;
      } else {
        ok = fallbackCopy(email);
      }

      if (ok) {
        setCopiedEmail(email);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setCopiedEmail(null);
          timeoutRef.current = null;
        }, 2000);
      } else {
        // eslint-disable-next-line no-console
        console.error('Copy API not available and fallback failed.');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl flex flex-col">
      <div className="p-6 flex-grow">
        <h3 className="font-bold text-lg text-indigo-800 dark:text-indigo-300 mb-4">{college.name}</h3>
        <div className="space-y-3">
          {college.emails && college.emails.length > 0 ? (
            college.emails.map((email) => (
              <div key={email} className="flex items-center justify-between group">
                <a
                  href={`mailto:${email}`}
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 break-all transition-colors flex items-center space-x-2"
                >
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{email}</span>
                </a>
                <div className="flex items-center ml-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(email)}
                    className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    aria-label={`Copy email ${email}`}
                    title={`Copy ${email}`}
                  >
                    {copiedEmail === email ? (
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic">Email not found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(CollegeCard);