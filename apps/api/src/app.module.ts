import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { CollectionsModule } from './collections/collections.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
         validationSchema: Joi.object({
            DATABASE_URL: Joi.string().required(),
            JWT_SECRET: Joi.string().required(),
            JWT_EXPIRES_IN: Joi.string().default('15m'),
            JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
            PORT: Joi.number().default(3001),
         }),
      }),
      ThrottlerModule.forRoot([
         {
            // Default: 100 requests per minute for all routes
            name: 'default',
            ttl: 60_000,
            limit: 100,
         },
         {
            // Strict: 10 requests per minute — applied explicitly on auth routes
            name: 'strict',
            ttl: 60_000,
            limit: 10,
         },
      ]),
      PrismaModule,
      AuthModule,
      BookmarksModule,
      CollectionsModule,
      HealthModule,
   ],
   providers: [
      // Apply default throttler globally to all routes
      { provide: APP_GUARD, useClass: ThrottlerGuard },
   ],
})
export class AppModule {}
