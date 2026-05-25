import { z } from 'zod';

export const FeedbackRequestSchema = z.object({
    email: z.string().email().optional().nullable(),
    rating: z.number().int().min(1).max(5),
    feedback: z.string().min(1, 'Feedback is required').max(5000),
    timestamp: z.string().optional(),
});

export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;
