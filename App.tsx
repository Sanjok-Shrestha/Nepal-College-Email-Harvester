
// Import necessary React hooks and components, type definitions, and services.
import React, { useState, useCallback, useEffect } from 'react';
import { PROVINCES, UNIVERSITIES, FACULTIES } from './constants';
import { College, GroundingChunk } from './types';
import { harvestEmails } from './services/geminiService';
import Header from './components/Header';
import ApiKeyInput from './components/ApiKeyInput';
import SelectInput from './components/SelectInput';
import CollegeCard from './components/CollegeCard';
import Spinner from './components/Spinner';
import SkeletonCard from './components/SkeletonCard';

// An array of messages to display during the loading process.
const LOADING_MESSAGES = [
  'Initializing Gemini AI model...', 
  'Crafting the perfect search query...', 
  'Activating Google Search grounding for fresh data...', 
  'Scanning digital archives and official websites...', 
  'Cross-referencing university affiliation lists...', 
  'Searching Google Maps for contact information...', 
  'Compiling and formatting the results...', 
  'Almost there! Just polishing the final list.', 
];

/**
 * The main App component.
 * This component manages the application's state, user inputs, and API interactions.
 */
const App: React.FC = () => {
  // State for the user-provided Gemini API key.
  const [apiKey, setApiKey] = useState('');
  // State for the selected province, initialized from localStorage.
  const [province, setProvince] = useState(() => localStorage.getItem('selectedProvince') || '');
  // State for the selected university, initialized from localStorage.
  const [university, setUniversity] = useState(() => localStorage.getItem('selectedUniversity') || '');
  // State for the selected faculty, initialized from localStorage.
  const [faculty, setFaculty] = useState(() => localStorage.getItem('selectedFaculty') || '');
  // State to store the harvested college data.
  const [colleges, setColleges] = useState<College[]>([]);
  // State to store the data sources returned by the Gemini API.
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  // State to manage the loading status of the API call.
  const [isLoading, setIsLoading] = useState(false);
  // State to store any error messages.
  const [error, setError] = useState<string | null>(null);
  // State to track if a search has been performed.
  const [searchPerformed, setSearchPerformed] = useState(false);
  // State for the currently displayed loading message.
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  // useEffect hook to persist the selected province in localStorage.
  useEffect(() => {
    localStorage.setItem('selectedProvince', province);
  }, [province]);

  // useEffect hook to persist the selected university in localStorage.
  useEffect(() => {
    localStorage.setItem('selectedUniversity', university);
  }, [university]);

  // useEffect hook to persist the selected faculty in localStorage.
  useEffect(() => {
    localStorage.setItem('selectedFaculty', faculty);
  }, [faculty]);

  // useEffect hook to cycle through loading messages when isLoading is true.
  useEffect(() => {
    if (isLoading) {
      setLoadingMessage(LOADING_MESSAGES[0]); // Reset to the first message on a new search.
      const interval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 2000); // Change message every 2 seconds.
      return () => clearInterval(interval); // Cleanup the interval on component unmount or when isLoading becomes false.
    }
  }, [isLoading]);

  /**
   * Handles the email harvesting process.
   * This function is called when the user clicks the "Harvest Emails" button.
   * It validates the inputs, calls the Gemini API, and updates the state with the results.
   */
  const handleHarvest = useCallback(async () => {
    // Validate that a province and university are selected.
    if (!province || !university) {
      setError('Please select both a province and a university.');
      return;
    }
    // Reset state for a new search.
    setError(null);
    setIsLoading(true);
    setSearchPerformed(true);
    setColleges([]);
    setSources([]);

    try {
      // Use the provided API key or fallback to an environment variable.
      const finalApiKey = apiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY;
      if (!finalApiKey) {
          throw new Error('API Key is required. Please enter one or ensure it is set as an environment variable.');
      }
      // Call the harvestEmails service function.
      const { colleges: results, sources: foundSources } = await harvestEmails(province, university, faculty, finalApiKey);
      setColleges(results);
      setSources(foundSources);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [province, university, faculty, apiKey]);
  
  /**
   * Handles the download of the harvested college data as a CSV file.
   */
  const handleDownloadCSV = () => {
    if (colleges.length === 0) return;

    // Define CSV headers.
    const headers = ['Name', 'Email 1', 'Email 2'];
    // Convert college data to CSV rows.
    const rows = colleges.map(college => {
        const name = `"${college.name.replace(/"/g, '""')}"` // Handle quotes in names.
        const email1 = college.emails[0] ? `"${college.emails[0]}"` : '';
        const email2 = college.emails[1] ? `"${college.emails[1]}"` : '';
        return [name, email1, email2].join(',');
    });

    // Combine headers and rows to create the full CSV content.
    const csvContent = [headers.join(','), ...rows].join('\n');
    // Create a Blob from the CSV content.
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    // Create a link element to trigger the download.
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    // Generate a filename based on the search criteria.
    const filenameSafeUniversity = university.replace(/\s+/g, '-').toLowerCase();
    const filenameSafeProvince = province.replace(/\s+/g, '-').toLowerCase();
    const filenameSafeFaculty = faculty ? `-${faculty.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}` : '';
    link.setAttribute('download', `nepal-colleges-${filenameSafeProvince}-${filenameSafeUniversity}${filenameSafeFaculty}.csv`);
    // Trigger the download and cleanup.
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {/* Search criteria section */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <SelectInput
              label="Province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              options={PROVINCES}
              placeholder="Select a Province"
            />
            <SelectInput
              label="Affiliated University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              options={UNIVERSITIES}
              placeholder="Select a University"
            />
            <SelectInput
              label="Faculty / Program (Optional)"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              options={FACULTIES}
              placeholder="Filter by Faculty"
            />
          </div>
          <div className="mb-6">
            <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleHarvest}
              disabled={isLoading}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Harvesting...
                </>
              ) : (
                'Harvest Emails'
              )}
            </button>
          </div>
        </div>

        {/* Results section */}
        <div className="mt-8">
          {/* Display error message if any */}
          {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</p>}
          
          {/* Display loading skeletons and messages while fetching data */}
          {isLoading && (
             <div>
                <div className="text-center p-4 mb-4">
                  <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Searching for colleges...</p>
                  <p className="text-gray-600 dark:text-gray-400">{loadingMessage}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
             </div>
          )}

          {/* Display results when data is successfully fetched */}
          {!isLoading && searchPerformed && colleges.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Results</h2>
                <button
                    onClick={handleDownloadCSV}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download CSV</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colleges.map((college, index) => (
                  <CollegeCard key={`${college.name}-${index}`} college={college} />
                ))}
              </div>
              {/* Display data sources if available */}
              {sources.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Data Sources</h3>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <ul className="space-y-3">
                      {sources.map((source, index) => (
                        <li key={index}>
                          <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline break-all">
                            {source.web.title || source.web.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Initial state message before any search is performed */}
          {!isLoading && !error && !searchPerformed && (
            <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">Ready to Start?</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select a province and university to begin harvesting college emails.</p>
            </div>
          )}

          {/* Message to display when no results are found */}
          {!isLoading && !error && searchPerformed && colleges.length === 0 && (
             <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">No Results Found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">We couldn't find any colleges matching your criteria. Please try a different combination.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
