import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateCollectionDto } from '@bookmark-manager/types';
import { api } from './axios';

export interface Collection {
   id: string;
   name: string;
   description: string | null;
   isPublic: boolean;
   parentId: string | null;
   createdAt: string;
   _count: { bookmarks: number };
}

export const collectionKeys = {
   all: ['collections'] as const,
};

export const useCollections = () =>
   useQuery({
      queryKey: collectionKeys.all,
      queryFn: () => api.get<Collection[]>('/collections').then((r) => r.data),
   });

export const useCreateCollection = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (dto: CreateCollectionDto) =>
         api.post<Collection>('/collections', dto).then((r) => r.data),
      onSuccess: () => qc.invalidateQueries({ queryKey: collectionKeys.all }),
   });
};

export const useDeleteCollection = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (id: string) => api.delete(`/collections/${id}`),
      onSuccess: () => qc.invalidateQueries({ queryKey: collectionKeys.all }),
   });
};
