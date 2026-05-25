'use client';

import { Card } from '@/components/ui/Card';
import type { Review } from '@/lib/schemas/analysis';
import { MessageSquareWarning } from 'lucide-react';
import Image from 'next/image';

export function BadReviewsList({ reviews }: { reviews: Review[] }) {
    return (
        <Card>
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
                {reviews.map((review, index) => (
                    <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-100 hover:bg-white hover:shadow-md transition-all duration-300 group"
                    >
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
                                        <span
                                            key={i}
                                            className={`text-sm ${i < review.score ? 'text-yellow-400' : 'text-gray-300'}`}
                                        >
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
        </Card>
    );
}
