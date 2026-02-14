'use client';

import type { AnalysisResponse, ErrorResponse } from '@/types';
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  History,
  Lightbulb,
  LogOut,
  Mail,
  MessageSquareWarning,
  Rocket,
  Search,
  Settings,
  TrendingUp,
  User,
  X
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const [appId, setAppId] = useState('');
  const [country, setCountry] = useState('us'); // Default to US
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load saved results from localStorage on mount
  useEffect(() => {
    const savedResults = localStorage.getItem('analysisResults');
    const savedAppId = localStorage.getItem('lastAppId');

    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        console.error('Failed to parse saved results:', e);
      }
    }

    if (savedAppId) {
      setAppId(savedAppId);
    }
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId,
          country,
          lang: country === 'id' ? 'id' : 'en' // Use Indonesian for ID, English for others
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error((data as ErrorResponse).details || (data as ErrorResponse).error || 'Analysis failed');
      }

      setResults(data as AnalysisResponse);
      // Save to localStorage
      localStorage.setItem('analysisResults', JSON.stringify(data));
      localStorage.setItem('lastAppId', appId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClearResults = () => {
    setResults(null);
    setAppId('');
    setError(null);
    localStorage.removeItem('analysisResults');
    localStorage.removeItem('lastAppId');
  };

  const quickStart = (id: string) => {
    setAppId(id);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-10 hidden md:flex">
        <div className="p-8 flex items-center gap-3">
          <Image src="/starone.svg" alt="StarOne Logo" width={32} height={32} />
          <h1 className="text-xl font-bold tracking-wide">STARONE</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Main Menu
          </div>
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#1A1F2C] text-white rounded-xl transition-colors">
            <Search className="w-5 h-5" />
            <span className="font-medium">Analyzer</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
            <History className="w-5 h-5" />
            <span className="font-medium">History</span>
          </a>
        </nav>

        <nav className="p-4 space-y-1 mb-8">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Account
          </div>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Setting</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log out</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        {/* Top Header */}
        <header className="flex justify-end items-center gap-4 mb-12">
          <button className="p-2 bg-white rounded-lg border border-gray-100 text-gray-500 hover:text-gray-900 hover:border-gray-200 transition-colors">
            <Mail className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white rounded-lg border border-gray-100 text-gray-500 hover:text-gray-900 hover:border-gray-200 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="w-8 h-8 bg-[#1A1F2C] rounded-full flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Indie Hacker</span>
          </button>
        </header>

        {/* Welcome Section */}
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500">
              Analyze competitor apps and discover opportunities
            </p>
          </div>

          {/* Analyzer Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative overflow-hidden group">
            <div className="relative z-10 w-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Google Play Review Analyzer
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Discover feature gaps and opportunities in competitor apps
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </div>

              <form onSubmit={handleAnalyze} className="w-full">
                <div className="flex gap-3 mb-4 w-full">
                  <input
                    type="text"
                    id="appId"
                    name="appId"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="com.instagram.android"
                    className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
                    disabled={loading}
                    autoComplete="off"
                  />
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={loading}
                      className="h-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <option value="us">🇺🇸 US</option>
                      <option value="id">🇮🇩 ID</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !appId.trim()}
                    className="bg-[#1A1F2C] hover:bg-black text-white px-8 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></span>
                        Analyzing...
                      </span>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Analyze
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400">Quick start:</span>
                {[
                  { name: 'Instagram', id: 'com.instagram.android' },
                  { name: 'Notion', id: 'notion.id' },
                  { name: 'Duolingo', id: 'com.duolingo' }
                ].map((app) => (
                  <button
                    key={app.name}
                    onClick={() => quickStart(app.id)}
                    className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium transition-colors"
                  >
                    {app.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl flex items-center gap-3 animate-fade-in">
              <MessageSquareWarning className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-6 animate-fade-in pb-12">
              {/* Loading Header */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-shimmer bg-[length:200%_100%]"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-48"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-32"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">Analyzing app reviews... This typically takes 5-10 seconds</span>
                </div>
              </div>

              {/* Competitive Intelligence Skeleton */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-64 mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-20 mb-3"></div>
                      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-24"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complaints and Features Skeleton */}
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-40 mb-6"></div>
                    <div className="space-y-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-shimmer bg-[length:200%_100%]"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sentiment Summary Skeleton */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-48 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-full"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-5/6"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-4/6"></div>
                </div>
              </div>
            </div>
          )}

          {results && !loading && (
            <div className="space-y-6 animate-fade-in pb-12">
              {/* App Analysis Header */}
              <div className="flex items-center gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
                  <Image
                    src={results.appIcon}
                    alt={results.appName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {results.appName}
                  </h2>
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-medium uppercase tracking-wide">Analysis Complete</span>
                  </div>
                </div>
                <button
                  onClick={handleClearResults}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium text-sm"
                >
                  <X className="w-4 h-4" />
                  Analyze Another App
                </button>
              </div>

              {/* App Intelligence */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Competitive Intelligence</h3>
                    <p className="text-xs text-gray-500">Key metrics for market opportunity analysis</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Last Updated */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-white transition-all group">
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      Last Updated
                    </div>
                    <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {results.lastUpdated}
                    </div>
                  </div>

                  {/* Install Count */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-white transition-all group">
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      Installs
                    </div>
                    <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {results.installs}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-white transition-all group">
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                      Rating
                    </div>
                    <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {results.score > 0 && results.ratings > 0
                        ? `${results.score.toFixed(1)} ★ (${results.ratings.toLocaleString()} reviews)`
                        : 'N/A'}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-white transition-all group">
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      Pricing
                    </div>
                    <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {results.free ? 'Free' : results.price}
                      {results.offersIAP && <span className="text-xs text-gray-500 ml-1">(IAP)</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Top Complaints */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                      <TrendingUp className="w-5 h-5 rotate-180" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Top Complaints</h3>
                  </div>
                  <ul className="space-y-4">
                    {results.top_complaints.map((complaint, index) => (
                      <li key={index} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold font-mono">
                          {index + 1}
                        </span>
                        <span className="text-gray-600 text-sm leading-relaxed">{complaint}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Feature Requests */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Feature Requests</h3>
                  </div>
                  <ul className="space-y-4">
                    {results.feature_requests.map((request, index) => (
                      <li key={index} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold font-mono">
                          {index + 1}
                        </span>
                        <span className="text-gray-600 text-sm leading-relaxed">{request}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sentiment Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <MessageSquareWarning className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Sentiment Summary</h3>
                </div>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl text-sm">
                  {results.sentiment_summary}
                </p>
              </div>

              {/* Bad Reviews */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <MessageSquareWarning className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Bad Reviews (1-3 ★)</h3>
                    <p className="text-xs text-gray-500">Real user feedback from Google Play</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {(results.badReviews || []).map((review, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0">
                          {review.userImage ? (
                            <Image
                              src={review.userImage}
                              alt={review.userName}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">{review.userName}</h4>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < review.score ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({review.score}/5)</span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* App Idea Recommendations */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <div className="relative z-10 w-full">
                  <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">App Opportunities</h3>
                      <p className="text-gray-500 text-sm">Project ideas for indie hackers</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {results.app_ideas.map((idea, index) => {
                      const isStructured = typeof idea === 'object' && idea !== null;
                      return (
                        <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
                          <div className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-white border border-gray-200 text-gray-500 rounded-lg flex items-center justify-center text-sm font-bold font-mono group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              {isStructured ? (
                                <div className="space-y-2">
                                  <h4 className="font-bold text-lg text-gray-900 group-hover:text-indigo-700 transition-colors">
                                    {idea.name}
                                  </h4>
                                  <div className="grid md:grid-cols-3 gap-6 mt-4 pt-4 border-t border-gray-200/50 text-sm">
                                    <div className="space-y-1.5">
                                      <span className="text-gray-400 text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                        Pain Point
                                      </span>
                                      <p className="text-gray-600 text-xs leading-relaxed">{idea.pain_point}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                      <span className="text-gray-400 text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                        Differentiation
                                      </span>
                                      <p className="text-gray-600 text-xs leading-relaxed">{idea.differentiation}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                      <span className="text-gray-400 text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                        Value
                                      </span>
                                      <p className="text-gray-900 font-medium text-xs leading-relaxed">{idea.value_proposition}</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-600 leading-relaxed">{idea}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

