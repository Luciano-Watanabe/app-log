
import React, { useState } from 'react';

interface SettingsScreenProps {
  onSave: (url: string) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onSave }) => {
  const [url, setUrl] = useState('https://apex-agdist.tail5d823d.ts.net/ords/mws/api');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSave(url.trim());
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">API Configuration</h1>
        <p className="text-gray-400 mt-2">Please set the Base URL for the API.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="base-url" className="block text-sm font-medium text-gray-300 mb-2">
            Base URL
          </label>
          <div className="relative">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
             </div>
            <input
              id="base-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
        >
          Save and Continue
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-5 w-5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>
      </form>
    </div>
  );
};

export default SettingsScreen;
