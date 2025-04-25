'use client';

import React from 'react';
import { QueryResult } from '../utils/api';

interface QueryInterfaceProps {
  question: string;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
  results: QueryResult | null;
  loading: boolean;
  error: string | null;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({
  question,
  onQuestionChange,
  onSubmit,
  results,
  loading,
  error
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuestionChange(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center">
          <input
            type="text"
            value={question}
            onChange={handleInputChange}
            placeholder="Ask a question about the data..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !question.trim()}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </span>
            ) : 'Submit'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {results && !error && (
        <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
          <h3 className="text-lg font-medium mb-2">Query Results</h3>
          
          {/* Analysis - Display prominently at the top */}
          {results.description && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <h4 className="text-md font-medium mb-2 text-blue-700">Analysis:</h4>
              <p className="text-md text-blue-800">{results.description}</p>
            </div>
          )}
          
          {/* SQL Query */}
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2">SQL Query:</h4>
            <div className="bg-gray-50 p-3 rounded overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap">{results.sql || "No SQL query generated"}</pre>
            </div>
          </div>
          
          {/* Results Table */}
          {results.results && results.results.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-medium mb-2">Raw Results:</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(results.results[0]).map((key) => (
                        <th 
                          key={key}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.results.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, colIndex) => (
                          <td 
                            key={`${rowIndex}-${colIndex}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {value !== null ? String(value) : 'N/A'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Empty Results */}
          {(!results.results || results.results.length === 0) && results.sql && (
            <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded">
              No results found for this query.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QueryInterface;