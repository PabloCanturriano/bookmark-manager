import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { BookmarksService } from './bookmarks.service';
import { ScraperService } from './scraper.service';

const makeBookmark = (overrides = {}) => ({
   id: 'bk-1',
   url: 'https://nestjs.com',
   title: 'NestJS',
   description: 'A progressive Node.js framework',
   ogImage: null,
   favicon: null,
   isFavorited: false,
   collectionId: null,
   userId: 'user-1',
   deletedAt: null,
   createdAt: new Date(),
   updatedAt: new Date(),
   searchVector: null,
   ...overrides,
});

const prismaMock = {
   bookmark: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
   },
   $transaction: jest.fn(),
   $executeRaw: jest.fn(),
   $queryRaw: jest.fn(),
};

const scraperMock = {
   scrape: jest.fn().mockResolvedValue({
      title: 'Scraped Title',
      description: 'Scraped description',
      ogImage: null,
      favicon: null,
   }),
};

describe('BookmarksService', () => {
   let service: BookmarksService;

   beforeEach(async () => {
      const module = await Test.createTestingModule({
         providers: [
            BookmarksService,
            { provide: PrismaService, useValue: prismaMock },
            { provide: ScraperService, useValue: scraperMock },
         ],
      }).compile();

      service = module.get(BookmarksService);
      jest.clearAllMocks();
   });

   describe('create', () => {
      it('scrapes metadata and persists the bookmark', async () => {
         const bookmark = makeBookmark();
         prismaMock.bookmark.create.mockResolvedValue(bookmark);
         prismaMock.$executeRaw.mockResolvedValue(1);

         const result = await service.create('user-1', { url: 'https://nestjs.com' });

         expect(scraperMock.scrape).toHaveBeenCalledWith('https://nestjs.com');
         expect(prismaMock.bookmark.create).toHaveBeenCalledWith(
            expect.objectContaining({
               data: expect.objectContaining({ url: 'https://nestjs.com', userId: 'user-1' }),
            }),
         );
         expect(result).toEqual(bookmark);
      });

      it('uses provided title over scraped title', async () => {
         const bookmark = makeBookmark({ title: 'My custom title' });
         prismaMock.bookmark.create.mockResolvedValue(bookmark);
         prismaMock.$executeRaw.mockResolvedValue(1);

         await service.create('user-1', { url: 'https://nestjs.com', title: 'My custom title' });

         expect(prismaMock.bookmark.create).toHaveBeenCalledWith(
            expect.objectContaining({
               data: expect.objectContaining({ title: 'My custom title' }),
            }),
         );
      });

      it('throws ConflictException on duplicate URL for same user', async () => {
         prismaMock.bookmark.create.mockRejectedValue(
            Object.assign(new Error('Unique constraint'), { code: 'P2002' }),
         );

         await expect(service.create('user-1', { url: 'https://nestjs.com' })).rejects.toThrow(
            ConflictException,
         );
      });
   });

   describe('update', () => {
      it('updates the bookmark and refreshes the search vector', async () => {
         const updated = makeBookmark({ title: 'Updated' });
         prismaMock.bookmark.updateMany.mockResolvedValue({ count: 1 });
         prismaMock.bookmark.findUnique.mockResolvedValue(updated);
         prismaMock.$executeRaw.mockResolvedValue(1);

         const result = await service.update('user-1', 'bk-1', { title: 'Updated' });

         expect(prismaMock.bookmark.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'bk-1', userId: 'user-1' } }),
         );
         expect(prismaMock.$executeRaw).toHaveBeenCalled();
         expect(result).toEqual(updated);
      });

      it('throws NotFoundException when bookmark does not belong to user', async () => {
         prismaMock.bookmark.updateMany.mockResolvedValue({ count: 0 });

         await expect(service.update('other-user', 'bk-1', { title: 'x' })).rejects.toThrow(
            NotFoundException,
         );
      });
   });

   describe('softDelete', () => {
      it('sets deletedAt on the bookmark', async () => {
         prismaMock.bookmark.updateMany.mockResolvedValue({ count: 1 });

         await service.softDelete('user-1', 'bk-1');

         expect(prismaMock.bookmark.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
               where: { id: 'bk-1', userId: 'user-1' },
               data: expect.objectContaining({ deletedAt: expect.any(Date) }),
            }),
         );
      });

      it('throws NotFoundException for a bookmark that does not belong to user', async () => {
         prismaMock.bookmark.updateMany.mockResolvedValue({ count: 0 });

         await expect(service.softDelete('other-user', 'bk-1')).rejects.toThrow(NotFoundException);
      });
   });

   describe('restore', () => {
      it('clears deletedAt', async () => {
         prismaMock.bookmark.updateMany.mockResolvedValue({ count: 1 });

         await service.restore('user-1', 'bk-1');

         expect(prismaMock.bookmark.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
               where: { id: 'bk-1', userId: 'user-1' },
               data: { deletedAt: null },
            }),
         );
      });

      it('throws NotFoundException when not found', async () => {
         prismaMock.bookmark.updateMany.mockResolvedValue({ count: 0 });
         await expect(service.restore('user-1', 'bk-1')).rejects.toThrow(NotFoundException);
      });
   });

   describe('permanentDelete', () => {
      it('deletes the bookmark from the database', async () => {
         prismaMock.bookmark.deleteMany.mockResolvedValue({ count: 1 });

         await service.permanentDelete('user-1', 'bk-1');

         expect(prismaMock.bookmark.deleteMany).toHaveBeenCalledWith({
            where: { id: 'bk-1', userId: 'user-1' },
         });
      });

      it('throws NotFoundException when not found', async () => {
         prismaMock.bookmark.deleteMany.mockResolvedValue({ count: 0 });
         await expect(service.permanentDelete('user-1', 'bk-1')).rejects.toThrow(NotFoundException);
      });
   });

   describe('emptyBin', () => {
      it('deletes all soft-deleted bookmarks for the user', async () => {
         prismaMock.bookmark.deleteMany.mockResolvedValue({ count: 3 });

         await service.emptyBin('user-1');

         expect(prismaMock.bookmark.deleteMany).toHaveBeenCalledWith({
            where: { userId: 'user-1', deletedAt: { not: null } },
         });
      });
   });
});
