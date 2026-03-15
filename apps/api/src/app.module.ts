import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default("15m"),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),
        PORT: Joi.number().default(3001),
      }),
    }),
    HealthModule,
  ],
})
export class AppModule {}
