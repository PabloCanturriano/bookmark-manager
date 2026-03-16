import { z } from 'zod';

export const CreateBookmarkSchema = z.object({
   url: z.string().url(),
   title: z.string().max(255).optional(),
   description: z.string().max(1000).optional(),
   collectionId: z.string().cuid().optional(),
   tags: z.array(z.string().max(50)).max(20).optional(),
});

export const UpdateBookmarkSchema = z.object({
   title: z.string().max(255).optional(),
   description: z.string().max(1000).optional(),
   collectionId: z.string().cuid().nullable().optional(),
   tags: z.array(z.string().max(50)).max(20).optional(),
});

export type CreateBookmarkDto = z.infer<typeof CreateBookmarkSchema>;
export type UpdateBookmarkDto = z.infer<typeof UpdateBookmarkSchema>;
