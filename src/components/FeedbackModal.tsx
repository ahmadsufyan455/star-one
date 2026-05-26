'use client';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RATE_LIMIT_MAX } from '@/config/rate-limit';
import { trackFeedbackModalOpened, trackFeedbackSubmitted } from '@/lib/analytics';
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

    useEffect(() => {
        if (isOpen) {
            trackFeedbackModalOpened('rate_limit');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    rating,
                    feedback,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (response.ok) {
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
        <Modal isOpen={isOpen} onClose={onClose}>
            {submitted ? (
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
                <>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            You've used your daily limit! 🎯
                        </h2>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                            <p className="text-sm text-blue-900 font-medium mb-1">
                                📊 Daily Analysis Limit: {RATE_LIMIT_MAX}/{RATE_LIMIT_MAX} used
                            </p>
                            <p className="text-xs text-blue-700">
                                Your limit resets in 24 hours. Come back tomorrow for {RATE_LIMIT_MAX} more free analyses!
                            </p>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Before you go, we'd love to hear your thoughts! Your feedback helps us improve StarOne.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                        aria-label={`Rate ${star} out of 5 stars`}
                                    >
                                        {star <= rating ? '⭐' : '☆'}
                                    </button>
                                ))}
                            </div>
                        </div>

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

                        <Button
                            type="submit"
                            variant="gradient"
                            size="lg"
                            fullWidth
                            loading={isSubmitting}
                            disabled={!rating}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>

                        <p className="text-xs text-gray-500 text-center">
                            Your feedback is anonymous and helps us build a better product
                        </p>
                    </form>
                </>
            )}
        </Modal>
    );
}
