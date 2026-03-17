import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
   CreateBookmarkDto,
   ListBookmarksDto,
   SearchBookmarksDto,
   UpdateBookmarkDto,
} from '@bookmark-manager/types';
import { PrismaService } from '../prisma/prisma.service';
import { ScraperService } from './scraper.service';

@Injectable()
export class BookmarksService {
   constructor(
      private prisma: PrismaService,
      private scraper: ScraperService,
   ) {}

   async create(userId: string, dto: CreateBookmarkDto) {
      const scraped = await this.scraper.scrape(dto.url);

      const bookmark = await this.prisma.bookmark.create({
         data: {
            url: dto.url,
            title: dto.title ?? scraped.title,
            description: dto.description ?? scraped.description,
            ogImage: scraped.ogImage,
            favicon: scraped.favicon,
            userId,
            isFavorited: dto.isFavorited ?? false,
            collectionId: dto.collectionId ?? null,
            tags: dto.tags?.length
               ? {
                    connectOrCreate: dto.tags.map((name) => ({
                       where: { name_userId: { name, userId } },
                       create: { name, userId },
                    })),
                 }
               : undefined,
         },
         include: { tags: true },
      });

      await this.updateSearchVector(bookmark.id);

      return bookmark;
   }

   async findAll(userId: string, query: ListBookmarksDto) {
      const { page, limit, collectionId, tag, favorited } = query;
      const skip = (page - 1) * limit;

      const where = {
         userId,
         deletedAt: null,
         ...(collectionId !== undefined && { collectionId }),
         ...(favorited !== undefined && { isFavorited: favorited }),
         ...(tag && { tags: { some: { name: tag } } }),
      };

      const [items, total] = await this.prisma.$transaction([
         this.prisma.bookmark.findMany({
            where,
            include: { tags: true, collection: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
         }),
         this.prisma.bookmark.count({ where }),
      ]);

      return { items, total, page, limit };
   }

   async findBin(userId: string) {
      const items = await this.prisma.bookmark.findMany({
         where: { userId, deletedAt: { not: null } },
         include: { tags: true },
         orderBy: { deletedAt: 'desc' },
      });
      return { items, total: items.length };
   }

   async findOne(userId: string, id: string) {
      const bookmark = await this.prisma.bookmark.findUnique({
         where: { id },
         include: { tags: true, collection: { select: { id: true, name: true } } },
      });

      if (!bookmark) throw new NotFoundException('Bookmark not found');
      if (bookmark.userId !== userId) throw new ForbiddenException();

      return bookmark;
   }

   async update(userId: string, id: string, dto: UpdateBookmarkDto) {
      await this.findOne(userId, id);

      const bookmark = await this.prisma.bookmark.update({
         where: { id },
         data: {
            ...(dto.title !== undefined && { title: dto.title }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.collectionId !== undefined && { collectionId: dto.collectionId }),
            ...(dto.isFavorited !== undefined && { isFavorited: dto.isFavorited }),
            ...(dto.tags && {
               tags: {
                  set: [],
                  connectOrCreate: dto.tags.map((name) => ({
                     where: { name_userId: { name, userId } },
                     create: { name, userId },
                  })),
               },
            }),
         },
         include: { tags: true },
      });

      if (dto.title || dto.description) {
         await this.updateSearchVector(id);
      }

      return bookmark;
   }

   async softDelete(userId: string, id: string) {
      await this.findOne(userId, id);
      await this.prisma.bookmark.update({
         where: { id },
         data: { deletedAt: new Date() },
      });
   }

   async restore(userId: string, id: string) {
      await this.findOne(userId, id);
      await this.prisma.bookmark.update({
         where: { id },
         data: { deletedAt: null },
      });
   }

   async permanentDelete(userId: string, id: string) {
      await this.findOne(userId, id);
      await this.prisma.bookmark.delete({ where: { id } });
   }

   async emptyBin(userId: string) {
      await this.prisma.bookmark.deleteMany({
         where: { userId, deletedAt: { not: null } },
      });
   }

   async remove(userId: string, id: string) {
      await this.softDelete(userId, id);
   }

   async search(userId: string, query: SearchBookmarksDto) {
      const { q, page, limit } = query;
      const skip = (page - 1) * limit;

      const [items, total] = await this.prisma.$transaction([
         this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Bookmark"
        WHERE "userId" = ${userId}
          AND "deletedAt" IS NULL
          AND "searchVector" @@ plainto_tsquery('english', ${q})
        ORDER BY ts_rank("searchVector", plainto_tsquery('english', ${q})) DESC
        LIMIT ${limit} OFFSET ${skip}
      `,
         this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT count(*) FROM "Bookmark"
        WHERE "userId" = ${userId}
          AND "deletedAt" IS NULL
          AND "searchVector" @@ plainto_tsquery('english', ${q})
      `,
      ]);

      const ids = items.map((r) => r.id);
      const bookmarks = await this.prisma.bookmark.findMany({
         where: { id: { in: ids } },
         include: { tags: true },
         orderBy: { createdAt: 'desc' },
      });

      return {
         items: bookmarks,
         total: Number(total[0].count),
         page,
         limit,
      };
   }

   private async updateSearchVector(id: string) {
      await this.prisma.$executeRaw`
      UPDATE "Bookmark"
      SET "searchVector" = to_tsvector(
        'english',
        coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || url
      )
      WHERE id = ${id}
    `;
   }
}
