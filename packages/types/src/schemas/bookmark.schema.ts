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
   isFavorited: z.boolean().optional(),
});

export const PaginationSchema = z.object({
   page: z.coerce.number().int().min(1).default(1),
   limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const SearchBookmarksSchema = PaginationSchema.extend({
   q: z.string().min(1).max(200),
});

export const ListBookmarksSchema = PaginationSchema.extend({
   collectionId: z.string().cuid().optional(),
   tag: z.string().max(50).optional(),
   favorited: z.coerce.boolean().optional(),
});

export type CreateBookmarkDto = z.infer<typeof CreateBookmarkSchema>;
export type UpdateBookmarkDto = z.infer<typeof UpdateBookmarkSchema>;
export type PaginationDto = z.infer<typeof PaginationSchema>;
export type SearchBookmarksDto = z.infer<typeof SearchBookmarksSchema>;
export type ListBookmarksDto = z.infer<typeof ListBookmarksSchema>;
