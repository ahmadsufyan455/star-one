import { z } from 'zod';

import { AppIdeaSchema } from './analysis';

export const SAVED_IDEA_STATUSES = ['idea', 'building', 'shipped', 'skipped'] as const;
export const SavedIdeaStatusSchema = z.enum(SAVED_IDEA_STATUSES);
export type SavedIdeaStatus = z.infer<typeof SavedIdeaStatusSchema>;

export const SaveIdeaRequestSchema = z.object({
    analysisId: z.string().uuid(),
    ideaIndex: z.number().int().min(0).max(50),
});

export const UpdateSavedIdeaRequestSchema = z.object({
    notes: z.string().max(2000).optional(),
    status: SavedIdeaStatusSchema.optional(),
}).refine((v) => v.notes !== undefined || v.status !== undefined, {
    message: 'At least one of `notes` or `status` is required',
});

export const SavedIdeaSchema = z.object({
    id: z.string().uuid(),
    analysisId: z.string().uuid().nullable(),
    ideaIndex: z.number().int().min(0),
    idea: AppIdeaSchema,
    appName: z.string(),
    appIcon: z.string(),
    notes: z.string(),
    status: SavedIdeaStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type SaveIdeaRequest = z.infer<typeof SaveIdeaRequestSchema>;
export type UpdateSavedIdeaRequest = z.infer<typeof UpdateSavedIdeaRequestSchema>;
export type SavedIdea = z.infer<typeof SavedIdeaSchema>;
