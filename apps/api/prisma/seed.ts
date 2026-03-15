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

   const devCollection = await prisma.collection.upsert({
      where: { id: 'seed-collection-dev' },
      update: {},
      create: {
         id: 'seed-collection-dev',
         name: 'Development',
         description: 'Web development resources',
         isPublic: true,
         userId: alice.id,
      },
   });

   const nestjsCollection = await prisma.collection.upsert({
      where: { id: 'seed-collection-nestjs' },
      update: {},
      create: {
         id: 'seed-collection-nestjs',
         name: 'NestJS',
         description: 'NestJS specific resources',
         isPublic: false,
         userId: alice.id,
         parentId: devCollection.id,
      },
   });

   // ─── Tags ─────────────────────────────────────────────────────────────────

   const tagBackend = await prisma.tag.upsert({
      where: { name_userId: { name: 'backend', userId: alice.id } },
      update: {},
      create: { name: 'backend', userId: alice.id },
   });

   const tagTypeScript = await prisma.tag.upsert({
      where: { name_userId: { name: 'typescript', userId: alice.id } },
      update: {},
      create: { name: 'typescript', userId: alice.id },
   });

   const tagTools = await prisma.tag.upsert({
      where: { name_userId: { name: 'tools', userId: alice.id } },
      update: {},
      create: { name: 'tools', userId: alice.id },
   });

   // ─── Bookmarks ────────────────────────────────────────────────────────────

   await prisma.bookmark.upsert({
      where: { id: 'seed-bookmark-nestjs' },
      update: {},
      create: {
         id: 'seed-bookmark-nestjs',
         url: 'https://docs.nestjs.com',
         title: 'NestJS Documentation',
         description:
            'A progressive Node.js framework for building efficient and scalable server-side applications.',
         ogImage: 'https://docs.nestjs.com/assets/logo-small.svg',
         isFavorited: true,
         userId: alice.id,
         collectionId: nestjsCollection.id,
         tags: { connect: [{ id: tagBackend.id }, { id: tagTypeScript.id }] },
      },
   });

   await prisma.bookmark.upsert({
      where: { id: 'seed-bookmark-prisma' },
      update: {},
      create: {
         id: 'seed-bookmark-prisma',
         url: 'https://www.prisma.io/docs',
         title: 'Prisma Documentation',
         description: 'Next-generation ORM for Node.js and TypeScript.',
         isFavorited: false,
         userId: alice.id,
         collectionId: devCollection.id,
         tags: { connect: [{ id: tagBackend.id }, { id: tagTypeScript.id }] },
      },
   });

   await prisma.bookmark.upsert({
      where: { id: 'seed-bookmark-turbo' },
      update: {},
      create: {
         id: 'seed-bookmark-turbo',
         url: 'https://turbo.build/repo/docs',
         title: 'Turborepo Documentation',
         description: 'High-performance build system for JavaScript and TypeScript codebases.',
         isFavorited: false,
         userId: alice.id,
         collectionId: devCollection.id,
         tags: { connect: [{ id: tagTools.id }] },
      },
   });
}

main()
   .catch(() => {
      process.exit(1);
   })
   .finally(() => prisma.$disconnect());
