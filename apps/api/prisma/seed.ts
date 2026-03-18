import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
   const passwordHash = await bcrypt.hash('password123', 10);

   const alice = await prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
         email: 'alice@example.com',
         name: 'Alice',
         passwordHash,
      },
   });

   await prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
         email: 'bob@example.com',
         name: 'Bob',
         passwordHash,
      },
   });

   // ─── Collections ──────────────────────────────────────────────────────────

   let devCollection = await prisma.collection.findFirst({
      where: { userId: alice.id, name: 'Development' },
   });

   if (!devCollection) {
      devCollection = await prisma.collection.create({
         data: {
            name: 'Development',
            description: 'Web development resources',
            isPublic: true,
            userId: alice.id,
         },
      });
   }

   let nestjsCollection = await prisma.collection.findFirst({
      where: { userId: alice.id, name: 'NestJS' },
   });

   if (!nestjsCollection) {
      nestjsCollection = await prisma.collection.create({
         data: {
            name: 'NestJS',
            description: 'NestJS specific resources',
            isPublic: false,
            userId: alice.id,
            parentId: devCollection.id,
         },
      });
   }

   // ─── Bookmarks ────────────────────────────────────────────────────────────

   await prisma.bookmark.upsert({
      where: { userId_url: { userId: alice.id, url: 'https://docs.nestjs.com' } },
      update: {},
      create: {
         url: 'https://docs.nestjs.com',
         title: 'NestJS Documentation',
         description:
            'A progressive Node.js framework for building efficient and scalable server-side applications.',
         ogImage: 'https://docs.nestjs.com/assets/logo-small.svg',
         isFavorited: true,
         userId: alice.id,
         collectionId: nestjsCollection.id,
      },
   });

   await prisma.bookmark.upsert({
      where: { userId_url: { userId: alice.id, url: 'https://www.prisma.io/docs' } },
      update: {},
      create: {
         url: 'https://www.prisma.io/docs',
         title: 'Prisma Documentation',
         description: 'Next-generation ORM for Node.js and TypeScript.',
         isFavorited: false,
         userId: alice.id,
         collectionId: devCollection.id,
      },
   });

   await prisma.bookmark.upsert({
      where: { userId_url: { userId: alice.id, url: 'https://turbo.build/repo/docs' } },
      update: {},
      create: {
         url: 'https://turbo.build/repo/docs',
         title: 'Turborepo Documentation',
         description: 'High-performance build system for JavaScript and TypeScript codebases.',
         isFavorited: false,
         userId: alice.id,
         collectionId: devCollection.id,
      },
   });

   await prisma.$executeRaw`
      UPDATE "Bookmark"
      SET "searchVector" = to_tsvector(
         'english',
         coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || url
      )
   `;
}

main()
   .catch(() => {
      process.exit(1);
   })
   .finally(() => prisma.$disconnect());
