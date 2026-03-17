import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollectionDto, UpdateCollectionDto } from '@bookmark-manager/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionsService {
   constructor(private prisma: PrismaService) {}

   findAll(userId: string) {
      return this.prisma.collection.findMany({
         where: { userId },
         include: { children: { select: { id: true, name: true } }, _count: { select: { bookmarks: true } } },
         orderBy: { createdAt: 'desc' },
      });
   }

   async findOne(userId: string, id: string) {
      const collection = await this.prisma.collection.findUnique({
         where: { id },
         include: { children: { select: { id: true, name: true } }, _count: { select: { bookmarks: true } } },
      });

      if (!collection) throw new NotFoundException('Collection not found');
      if (collection.userId !== userId) throw new ForbiddenException();

      return collection;
   }

   create(userId: string, dto: CreateCollectionDto) {
      return this.prisma.collection.create({
         data: { ...dto, userId },
      });
   }

   async update(userId: string, id: string, dto: UpdateCollectionDto) {
      await this.findOne(userId, id);
      return this.prisma.collection.update({ where: { id }, data: dto });
   }

   async remove(userId: string, id: string) {
      await this.findOne(userId, id);
      await this.prisma.collection.delete({ where: { id } });
   }
}
