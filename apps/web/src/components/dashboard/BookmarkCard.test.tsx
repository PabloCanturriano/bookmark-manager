import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { BookmarkCard } from './BookmarkCard';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const { patchMock, deleteMock } = vi.hoisted(() => ({
   patchMock: vi.fn().mockResolvedValue({ data: {} }),
   deleteMock: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/axios', () => ({
   api: {
      patch: patchMock,
      delete: deleteMock,
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
   },
}));

const mockBookmark = {
   id: '1',
   url: 'https://nestjs.com',
   title: 'NestJS',
   description: 'A progressive Node.js framework',
   ogImage: null,
   favicon: null,
   isFavorited: false,
   createdAt: new Date().toISOString(),
   collectionId: null,
};

describe('BookmarkCard', () => {
   it('renders title and domain', () => {
      renderWithProviders(<BookmarkCard bookmark={mockBookmark} />);
      expect(screen.getByText('NestJS')).toBeDefined();
      expect(screen.getByText('nestjs.com')).toBeDefined();
   });

   it('renders description when present', () => {
      renderWithProviders(<BookmarkCard bookmark={mockBookmark} />);
      expect(screen.getByText('A progressive Node.js framework')).toBeDefined();
   });

   it('uses title as fallback when title is null', () => {
      renderWithProviders(<BookmarkCard bookmark={{ ...mockBookmark, title: null }} />);
      expect(screen.getAllByText('nestjs.com').length).toBeGreaterThanOrEqual(1);
   });

   it('open link uses safe URL and targets blank', () => {
      renderWithProviders(<BookmarkCard bookmark={mockBookmark} />);
      const link = document.querySelector('a[target="_blank"]') as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link.href).toBe('https://nestjs.com/');
   });

   it('replaces unsafe javascript: URL with # in the open link', () => {
      renderWithProviders(
         <BookmarkCard bookmark={{ ...mockBookmark, url: 'javascript:alert(1)' }} />,
      );
      const link = document.querySelector('a[target="_blank"]') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toBe('#');
   });

   it('calls PATCH to toggle favourite when heart button clicked', async () => {
      renderWithProviders(<BookmarkCard bookmark={mockBookmark} />);
      const heartBtn = screen.getByRole('button', { name: /^heart$/i });
      await userEvent.click(heartBtn);
      await waitFor(() => {
         expect(patchMock).toHaveBeenCalledWith('/bookmarks/1', { isFavorited: true });
      });
   });

   it('shows filled heart icon when bookmark is already favorited', () => {
      renderWithProviders(<BookmarkCard bookmark={{ ...mockBookmark, isFavorited: true }} />);
      const heartIcon = document.querySelector('.anticon-heart');
      expect(heartIcon?.className).toContain('text-red-500');
   });

   it('shows delete popconfirm on delete button click', async () => {
      renderWithProviders(<BookmarkCard bookmark={mockBookmark} />);
      const deleteBtn = screen.getByRole('button', { name: /^delete$/i });
      await userEvent.click(deleteBtn);
      expect(screen.getByText('Delete this bookmark?')).toBeDefined();
   });

   it('calls DELETE when popconfirm is confirmed', async () => {
      renderWithProviders(<BookmarkCard bookmark={mockBookmark} />);
      const deleteBtn = screen.getByRole('button', { name: /^delete$/i });
      await userEvent.click(deleteBtn);
      const confirmBtns = screen.getAllByRole('button', { name: /^delete$/i });
      await userEvent.click(confirmBtns[confirmBtns.length - 1]);
      await waitFor(() => {
         expect(deleteMock).toHaveBeenCalledWith('/bookmarks/1');
      });
   });

   it('opens edit modal on edit button click', async () => {
      renderWithProviders(<BookmarkCard bookmark={mockBookmark} />);
      const editBtn = screen.getByRole('button', { name: /^edit$/i });
      await userEvent.click(editBtn);
      await waitFor(() => {
         expect(screen.getByText('Edit Bookmark')).toBeDefined();
      });
   });
});
