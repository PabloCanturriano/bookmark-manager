import { useQuery } from '@tanstack/react-query';
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
};

export const useBookmarks = (params: Record<string, unknown> = {}) =>
   useQuery({
      queryKey: bookmarkKeys.list(params),
      queryFn: () => api.get<BookmarkPage>('/bookmarks', { params }).then((r) => r.data),
   });
