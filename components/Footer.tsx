
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
        <p>
          An Open Source Initiative by{" "}
          <a
            href="https://gurkhatech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Gurkha Technology
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
