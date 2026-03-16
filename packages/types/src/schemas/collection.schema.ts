import { z } from 'zod';

export const CreateCollectionSchema = z.object({
   name: z.string().min(1).max(100),
   description: z.string().max(500).optional(),
   isPublic: z.boolean().default(false),
   parentId: z.string().cuid().optional(),
});

export const UpdateCollectionSchema = z.object({
   name: z.string().min(1).max(100).optional(),
   description: z.string().max(500).nullable().optional(),
   isPublic: z.boolean().optional(),
   parentId: z.string().cuid().nullable().optional(),
});

export type CreateCollectionDto = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionDto = z.infer<typeof UpdateCollectionSchema>;
