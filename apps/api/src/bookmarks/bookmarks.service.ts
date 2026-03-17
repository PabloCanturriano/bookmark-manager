import {
   ConflictException,
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import {
   CreateBookmarkDto,
   ListBookmarksDto,
   SearchBookmarksDto,
   UpdateBookmarkDto,
} from '@bookmark-manager/types';
import { Prisma } from '@prisma/client';
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

      try {
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
            },
         });

         await this.updateSearchVector(bookmark.id);

         return bookmark;
      } catch (err) {
         if ((err as Prisma.PrismaClientKnownRequestError)?.code === 'P2002') {
            throw new ConflictException('You already saved this URL');
         }
         throw err;
      }
   }

   async findAll(userId: string, query: ListBookmarksDto) {
      const { page, limit, collectionId, favorited } = query;
      const skip = (page - 1) * limit;

      const where = {
         userId,
         deletedAt: null,
         ...(collectionId !== undefined && { collectionId }),
         ...(favorited !== undefined && { isFavorited: favorited }),
      };

      const [items, total] = await this.prisma.$transaction([
         this.prisma.bookmark.findMany({
            where,
            include: { collection: { select: { id: true, name: true } } },
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
         orderBy: { deletedAt: 'desc' },
      });
      return { items, total: items.length };
   }

   async findOne(userId: string, id: string) {
      const bookmark = await this.prisma.bookmark.findUnique({
         where: { id },
         include: { collection: { select: { id: true, name: true } } },
      });

      if (!bookmark) throw new NotFoundException('Bookmark not found');
      if (bookmark.userId !== userId) throw new ForbiddenException();

      return bookmark;
   }

   async update(userId: string, id: string, dto: UpdateBookmarkDto) {
      const result = await this.prisma.bookmark.updateMany({
         where: { id, userId },
         data: {
            ...(dto.title !== undefined && { title: dto.title }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.collectionId !== undefined && { collectionId: dto.collectionId }),
            ...(dto.isFavorited !== undefined && { isFavorited: dto.isFavorited }),
         },
      });

      if (result.count === 0) throw new NotFoundException('Bookmark not found');

      await this.updateSearchVector(id);

      return this.prisma.bookmark.findUnique({ where: { id } });
   }

   async softDelete(userId: string, id: string) {
      const result = await this.prisma.bookmark.updateMany({
         where: { id, userId },
         data: { deletedAt: new Date() },
      });
      if (result.count === 0) throw new NotFoundException('Bookmark not found');
   }

   async restore(userId: string, id: string) {
      const result = await this.prisma.bookmark.updateMany({
         where: { id, userId },
         data: { deletedAt: null },
      });
      if (result.count === 0) throw new NotFoundException('Bookmark not found');
   }

   async permanentDelete(userId: string, id: string) {
      const result = await this.prisma.bookmark.deleteMany({
         where: { id, userId },
      });
      if (result.count === 0) throw new NotFoundException('Bookmark not found');
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
         this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT count(*) FROM "Bookmark"
        WHERE "userId" = ${userId}
          AND "deletedAt" IS NULL
          AND "searchVector" @@ plainto_tsquery('english', ${q})
      `,
      ]);

      const ids = items.map((r) => r.id);
      const bookmarks = await this.prisma.bookmark.findMany({
         where: { id: { in: ids } },
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
