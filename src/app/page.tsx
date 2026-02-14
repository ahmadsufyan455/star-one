'use client';

import type { AnalysisResponse, ErrorResponse } from '@/types';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [appId, setAppId] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appId.trim()) {
      setError('Please enter a valid App ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appId: appId.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        setError(errorData.details || errorData.error || 'An error occurred');
        return;
      }

      setResults(data as AnalysisResponse);
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAppId('');
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              🚀 For Indie Hackers
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            Google Play Review Analyzer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover feature gaps in competitor apps. Turn user complaints into your competitive advantage.
          </p>
        </header>

        {/* Search Form */}
        <div className="mb-12">
          <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  id="appId"
                  name="appId"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="Enter Google Play App ID (e.g., com.google.android.apps.translate)"
                  className="flex-1 px-6 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-lg"
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={loading || !appId.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      🔍 Analyze Reviews
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-pulse">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 mt-6 font-medium">
              Analyzing reviews... This may take 5-10 seconds
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="text-4xl">❌</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
                  Analysis Failed
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && !loading && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* App Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                  <Image
                    src={results.appIcon}
                    alt={results.appName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {results.appName}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Analysis Complete
                  </p>
                </div>
              </div>
            </div>

            {/* Sentiment Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🧠</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Sentiment Summary
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {results.sentiment_summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Complaints */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl">😡</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Top Complaints
                  </h3>
                  <ul className="space-y-3">
                    {results.top_complaints.map((complaint, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {complaint}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature Requests */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💡</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Feature Requests
                  </h3>
                  <ul className="space-y-3">
                    {results.feature_requests.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* App Idea Recommendations */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🚀</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    App Idea Recommendations
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Based on the analysis, here are specific app concepts you could build as an indie hacker:
                  </p>
                  <div className="space-y-4">
                    {results.app_ideas.map((idea, index) => {
                      // Handle both string and structured object formats
                      const isStructured = typeof idea === 'object' && idea !== null;

                      return (
                        <div key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            {isStructured ? (
                              <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">
                                  {idea.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  <strong>Pain Point:</strong> {idea.pain_point}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  <strong>Differentiation:</strong> {idea.differentiation}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  <strong>Value:</strong> {idea.value_proposition}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {idea}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pt-4">
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors"
              >
                Analyze Another App
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {!results && !loading && !error && (
          <footer className="text-center mt-16 text-gray-500 dark:text-gray-400">
            <p className="mb-2">
              💡 <strong>Tip:</strong> Find App IDs by visiting the Google Play Store and copying the ID from the URL
            </p>
            <p className="text-sm">
              Example: <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">com.google.android.apps.translate</code>
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}

