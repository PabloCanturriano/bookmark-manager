import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
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
      PrismaModule,
      AuthModule,
      HealthModule,
   ],
})
export class AppModule {}
