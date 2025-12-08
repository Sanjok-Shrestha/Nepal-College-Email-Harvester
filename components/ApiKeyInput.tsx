import React, { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey }) => {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 2000);
    return () => clearTimeout(t);
  }, [status]);

  const copyToClipboard = async () => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(apiKey);
        setStatus('Copied');
      } catch {
        setStatus('Copy failed');
      }
    } else {
      // Fallback for non-secure contexts or older browsers
      try {
        const textarea = document.createElement('textarea');
        textarea.value = apiKey;
        textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) {
          setStatus('Copied');
        } else {
          setStatus('Copy failed');
        }
      } catch {
        setStatus('Copy failed');
      }
    }
  };

  const clearKey = () => {
    setApiKey('');
    setStatus('Cleared');
  };

  return (
    <div>
      <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Gemini API Key
      </label>

      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          id="api-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API Key (optional)"
          className="w-full px-4 py-3 pr-28 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          aria-label="Gemini API Key"
          autoComplete="off"
          title="Gemini API Key (optional)"
        />

        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-1">
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            aria-label={visible ? 'Hide API key' : 'Show API key'}
            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition"
          >
            {visible ? 'Hide' : 'Show'}
          </button>

          <button
            type="button"
            onClick={copyToClipboard}
            aria-label="Copy API key"
            disabled={!apiKey}
            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition disabled:opacity-50"
          >
            Copy
          </button>

          <button
            type="button"
            onClick={clearKey}
            aria-label="Clear API key"
            disabled={!apiKey}
            className="px-2 py-1 text-xs bg-red-50 dark:bg-red-800 text-red-700 dark:text-red-200 rounded hover:bg-red-100 dark:hover:bg-red-700 transition disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        If left blank, the application will attempt to use a pre-configured key.
      </p>

      <div role="status" aria-live="polite" className="h-4 mt-1 text-xs text-gray-600 dark:text-gray-300">
        {status && <span>{status}</span>}
      </div>
    </div>
  );
};

export default ApiKeyInput;
