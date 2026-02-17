'use client';

import { trackFeedbackModalOpened, trackFeedbackSubmitted } from '@/lib/analytics';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail?: string;
}

export function FeedbackModal({ isOpen, onClose, userEmail }: FeedbackModalProps) {
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Track when modal opens
    useEffect(() => {
        if (isOpen) {
            trackFeedbackModalOpened('rate_limit');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    rating,
                    feedback,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                // Track feedback submission
                trackFeedbackSubmitted(rating, feedback.trim().length > 0);

                setSubmitted(true);
                setTimeout(() => {
                    onClose();
                    setSubmitted(false);
                    setFeedback('');
                    setRating(0);
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-[scale-in_0.2s_ease-out]">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {submitted ? (
                    // Success state
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You! 🎉</h3>
                        <p className="text-gray-600">Your feedback helps us improve StarOne</p>
                    </div>
                ) : (
                    // Feedback form
                    <>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                You've used your daily limit! 🎯
                            </h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                                <p className="text-sm text-blue-900 font-medium mb-1">
                                    📊 Daily Analysis Limit: 2/2 used
                                </p>
                                <p className="text-xs text-blue-700">
                                    Your limit resets in 24 hours. Come back tomorrow for 2 more free analyses!
                                </p>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Before you go, we'd love to hear your thoughts! Your feedback helps us improve StarOne.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    How would you rate StarOne?
                                </label>
                                <div className="flex gap-2 justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="text-3xl transition-transform hover:scale-110"
                                        >
                                            {star <= rating ? '⭐' : '☆'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feedback text */}
                            <div>
                                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                                    What did you think? Any suggestions?
                                </label>
                                <textarea
                                    id="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Tell us what you loved or what we can improve..."
                                    required
                                />
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !rating}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                Your feedback is anonymous and helps us build a better product
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
