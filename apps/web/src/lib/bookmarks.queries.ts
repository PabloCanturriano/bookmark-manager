import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateBookmarkDto, UpdateBookmarkDto } from '@bookmark-manager/types';
import { api } from './axios';

interface Tag {
   id: string;
   name: string;
}

export interface Bookmark {
   id: string;
   url: string;
   title: string | null;
   description: string | null;
   ogImage: string | null;
   favicon: string | null;
   isFavorited: boolean;
   createdAt: string;
   collectionId: string | null;
   tags: Tag[];
}

interface BookmarkPage {
   items: Bookmark[];
   total: number;
   page: number;
   limit: number;
}

export const bookmarkKeys = {
   all: ['bookmarks'] as const,
   list: (params: Record<string, unknown>) => ['bookmarks', 'list', params] as const,
   bin: ['bookmarks', 'bin'] as const,
};

export const useBookmarks = (params: Record<string, unknown> = {}) =>
   useQuery({
      queryKey: bookmarkKeys.list(params),
      queryFn: () => api.get<BookmarkPage>('/bookmarks', { params }).then((r) => r.data),
   });

export const useSearchBookmarks = (q: string, page = 1, limit = 12) =>
   useQuery({
      queryKey: ['bookmarks', 'search', { q, page, limit }] as const,
      queryFn: () =>
         api.get<BookmarkPage>('/bookmarks/search', { params: { q, page, limit } }).then((r) => r.data),
      enabled: q.trim().length > 0,
   });

export const useCreateBookmark = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (dto: CreateBookmarkDto) =>
         api.post<Bookmark>('/bookmarks', dto).then((r) => r.data),
      onSuccess: () => qc.invalidateQueries({ queryKey: bookmarkKeys.all }),
   });
};

export const useUpdateBookmark = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateBookmarkDto }) =>
         api.patch<Bookmark>(`/bookmarks/${id}`, dto).then((r) => r.data),
      onSuccess: () => qc.invalidateQueries({ queryKey: bookmarkKeys.all }),
   });
};

export const useToggleFavorite = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: ({ id, isFavorited }: { id: string; isFavorited: boolean }) =>
         api.patch(`/bookmarks/${id}`, { isFavorited: !isFavorited }).then((r) => r.data),
      onSuccess: () => qc.invalidateQueries({ queryKey: bookmarkKeys.all }),
   });
};

export const useDeleteBookmark = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (id: string) => api.delete(`/bookmarks/${id}`),
      onSuccess: () => qc.invalidateQueries({ queryKey: bookmarkKeys.all }),
   });
};

export const useBinBookmarks = () =>
   useQuery({
      queryKey: bookmarkKeys.bin,
      queryFn: () =>
         api.get<{ items: Bookmark[]; total: number }>('/bookmarks/bin').then((r) => r.data),
   });

export const useRestoreBookmark = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (id: string) => api.patch(`/bookmarks/${id}/restore`, {}).then((r) => r.data),
      onSuccess: () => qc.invalidateQueries({ queryKey: bookmarkKeys.all }),
   });
};

export const usePermanentDeleteBookmark = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (id: string) => api.delete(`/bookmarks/${id}/permanent`),
      onSuccess: () => qc.invalidateQueries({ queryKey: bookmarkKeys.all }),
   });
};

export const useEmptyBin = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: () => api.delete('/bookmarks/bin'),
      onSuccess: () => qc.invalidateQueries({ queryKey: bookmarkKeys.all }),
   });
};
