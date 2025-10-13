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

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [province, setProvince] = useState(() => localStorage.getItem('selectedProvince') || '');
  const [university, setUniversity] = useState(() => localStorage.getItem('selectedUniversity') || '');
  const [faculty, setFaculty] = useState(() => localStorage.getItem('selectedFaculty') || '');
  const [colleges, setColleges] = useState<College[]>([]);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    localStorage.setItem('selectedProvince', province);
  }, [province]);

  useEffect(() => {
    localStorage.setItem('selectedUniversity', university);
  }, [university]);

  useEffect(() => {
    localStorage.setItem('selectedFaculty', faculty);
  }, [faculty]);

  useEffect(() => {
    if (isLoading) {
      setLoadingMessage(LOADING_MESSAGES[0]); // Reset to first message on new search
      const interval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 2000); // Change message every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleHarvest = useCallback(async () => {
    if (!province || !university) {
      setError('Please select both a province and a university.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setSearchPerformed(true);
    setColleges([]);
    setSources([]);

    try {
      const finalApiKey = apiKey.trim() || process.env.API_KEY;
      if (!finalApiKey) {
          throw new Error('API Key is required. Please enter one or ensure it is set as an environment variable.');
      }
      const { colleges: results, sources: foundSources } = await harvestEmails(province, university, faculty, finalApiKey);
      setColleges(results);
      setSources(foundSources);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [province, university, faculty, apiKey]);
  
  const handleDownloadCSV = () => {
    if (colleges.length === 0) return;

    const headers = ['Name', 'Email 1', 'Email 2'];
    const rows = colleges.map(college => {
        const name = `"${college.name.replace(/"/g, '""')}"`; // Handle quotes in names
        const email1 = college.emails[0] ? `"${college.emails[0]}"` : '';
        const email2 = college.emails[1] ? `"${college.emails[1]}"` : '';
        return [name, email1, email2].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    const filenameSafeUniversity = university.replace(/\s+/g, '-').toLowerCase();
    const filenameSafeProvince = province.replace(/\s+/g, '-').toLowerCase();
    const filenameSafeFaculty = faculty ? `-${faculty.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}` : '';
    link.setAttribute('download', `nepal-colleges-${filenameSafeProvince}-${filenameSafeUniversity}${filenameSafeFaculty}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
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

        <div className="mt-8">
          {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</p>}
          
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

          {!isLoading && !error && !searchPerformed && (
            <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">Ready to Start?</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select a province and university to begin harvesting college emails.</p>
            </div>
          )}

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