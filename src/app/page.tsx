'use client';

import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, CheckCircle2, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  const { data: session } = useSession();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Gemini AI reads thousands of reviews to surface what users really want but aren't getting"
    },
    {
      icon: Target,
      title: "Feature Gap Detection",
      description: "Discover exactly what features competitors are missing that users are begging for"
    },
    {
      icon: Sparkles,
      title: "Instant App Ideas",
      description: "Get validated app concepts based on real user pain points, not guesswork"
    },
    {
      icon: TrendingUp,
      title: "Competitive Edge",
      description: "Build what users want before your competitors even know it's needed"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Enter Competitor App ID",
      description: "Find any app on Google Play and paste its package ID"
    },
    {
      number: "02",
      title: "AI Analyzes Reviews",
      description: "StarOne scrapes and analyzes thousands of user reviews with Gemini AI"
    },
    {
      number: "03",
      title: "Discover Opportunities",
      description: "Get a list of feature gaps and validated app ideas you can build"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/starone.svg" alt="StarOne Logo" width={32} height={32} />
            <span className="text-lg sm:text-xl font-bold text-gray-900">StarOne</span>
          </div>
          {session ? (
            <Link
              href="/analyze"
              className="px-4 py-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6"
          >
            <Sparkles className="w-4 h-4 text-yellow-600" />
            <span>Powered by Gemini AI</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
            Stop Guessing What to Build.<br />
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
              Let Real Users Tell You.
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-10 leading-relaxed">
            StarOne analyzes competitor app reviews with AI to reveal hidden feature gaps<br className="hidden sm:block" />
            and validated app ideas that users are <span className="font-semibold text-gray-900">actively begging for</span>.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            {session ? (
              <Link
                href="/analyze"
                className="px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 text-lg font-medium group shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 text-base sm:text-lg font-medium group shadow-lg hover:shadow-xl"
              >
                Start Finding Opportunities
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>

          <p className="text-sm text-gray-500 mt-6">
            Free to start • No credit card required • Google sign-in only
          </p>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              The Problem Every Indie Hacker Faces
            </h2>
            <p className="text-base sm:text-lg text-gray-700">
              You spend months building an app, only to realize nobody wants it.<br className="hidden sm:block" />
              <span className="font-semibold text-gray-900">What if you could validate ideas in minutes instead?</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, staggerChildren: 0.2 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 border border-gray-200"
            >
              <div className="text-4xl mb-4">😰</div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900">Idea Paralysis</h3>
              <p className="text-sm sm:text-base text-gray-700">
                "I don't know what to build. Every idea feels either too competitive or not validated."
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 border border-gray-200"
            >
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900">Building Blindly</h3>
              <p className="text-sm sm:text-base text-gray-700">
                "I built what I thought users wanted, but nobody's using my app."
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 border border-gray-200"
            >
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900">Wasted Time</h3>
              <p className="text-sm sm:text-base text-gray-700">
                "Months of development, zero users. How do I find problems worth solving?"
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Find What Users Want in Minutes
            </h2>
            <p className="text-base sm:text-lg text-gray-700">
              StarOne does the research so you can focus on building
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 transition-colors">
                  <feature.icon className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              From Competitor App to Validated Idea
            </h2>
            <p className="text-base sm:text-lg text-gray-700">
              Three simple steps to discover your next winning app
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-200 h-full">
                  <div className="text-5xl font-bold text-gray-200 mb-4">{step.number}</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-sm sm:text-base text-gray-700">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="bg-gray-900 text-white py-20"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Find Your Next App Idea?
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-10">
            Join indie hackers who are building apps people actually want
          </p>

          {session ? (
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all text-lg font-medium group shadow-lg"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all text-lg font-medium group shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Setup in 30 seconds</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <Footer />


    </div >
  );
}
