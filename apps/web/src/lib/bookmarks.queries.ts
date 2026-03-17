import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateBookmarkDto, UpdateBookmarkDto } from '@bookmark-manager/types';
import { App } from 'antd';
import { api } from './axios';

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
         api
            .get<BookmarkPage>('/bookmarks/search', { params: { q, page, limit } })
            .then((r) => r.data),
      enabled: q.trim().length > 0,
   });

export const useCreateBookmark = () => {
   const qc = useQueryClient();
   const { message } = App.useApp();
   return useMutation({
      mutationFn: (dto: CreateBookmarkDto) =>
         api.post<Bookmark>('/bookmarks', dto).then((r) => r.data),
      onSuccess: () => {
         qc.invalidateQueries({ queryKey: bookmarkKeys.all });
         void message.success('Bookmark added');
      },
      onError: () => void message.error('Failed to add bookmark'),
   });
};

export const useUpdateBookmark = () => {
   const qc = useQueryClient();
   const { message } = App.useApp();
   return useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateBookmarkDto }) =>
         api.patch<Bookmark>(`/bookmarks/${id}`, dto).then((r) => r.data),
      onSuccess: () => {
         qc.invalidateQueries({ queryKey: bookmarkKeys.all });
         void message.success('Bookmark updated');
      },
      onError: () => void message.error('Failed to update bookmark'),
   });
};

export const useToggleFavorite = () => {
   const qc = useQueryClient();
   const { message } = App.useApp();
   return useMutation({
      mutationFn: ({ id, isFavorited }: { id: string; isFavorited: boolean }) =>
         api.patch(`/bookmarks/${id}`, { isFavorited: !isFavorited }).then((r) => r.data),
      onSuccess: () => qc.invalidateQueries({ queryKey: bookmarkKeys.all }),
      onError: () => void message.error('Failed to update favourite'),
   });
};

export const useDeleteBookmark = () => {
   const qc = useQueryClient();
   const { message } = App.useApp();
   return useMutation({
      mutationFn: (id: string) => api.delete(`/bookmarks/${id}`),
      onSuccess: () => {
         qc.invalidateQueries({ queryKey: bookmarkKeys.all });
         void message.success('Bookmark moved to bin');
      },
      onError: () => void message.error('Failed to delete bookmark'),
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
   const { message } = App.useApp();
   return useMutation({
      mutationFn: (id: string) => api.patch(`/bookmarks/${id}/restore`, {}).then((r) => r.data),
      onSuccess: () => {
         qc.invalidateQueries({ queryKey: bookmarkKeys.all });
         void message.success('Bookmark restored');
      },
      onError: () => void message.error('Failed to restore bookmark'),
   });
};

export const usePermanentDeleteBookmark = () => {
   const qc = useQueryClient();
   const { message } = App.useApp();
   return useMutation({
      mutationFn: (id: string) => api.delete(`/bookmarks/${id}/permanent`),
      onSuccess: () => {
         qc.invalidateQueries({ queryKey: bookmarkKeys.all });
         void message.success('Bookmark permanently deleted');
      },
      onError: () => void message.error('Failed to permanently delete bookmark'),
   });
};

export const useEmptyBin = () => {
   const qc = useQueryClient();
   const { message } = App.useApp();
   return useMutation({
      mutationFn: () => api.delete('/bookmarks/bin'),
      onSuccess: () => {
         qc.invalidateQueries({ queryKey: bookmarkKeys.all });
         void message.success('Bin emptied');
      },
      onError: () => void message.error('Failed to empty bin'),
   });
};
