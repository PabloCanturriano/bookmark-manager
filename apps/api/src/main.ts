import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');
import { AppModule } from './app.module';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   app.use(cookieParser());
   app.setGlobalPrefix('api');
   app.enableCors({
      origin: process.env.WEB_URL ?? 'http://localhost:3000',
      credentials: true,
   });

   const swaggerConfig = new DocumentBuilder()
      .setTitle('Bookmark Manager API')
      .setDescription(
         'REST API for saving, organizing, and searching bookmarks. ' +
            'Authentication uses httpOnly cookies — call POST /api/auth/login first, ' +
            'then all subsequent requests are automatically authenticated.',
      )
      .setVersion('1.0')
      .addTag('auth', 'Register, login, logout, token refresh')
      .addTag('bookmarks', 'Bookmark CRUD, search, bin, favourites')
      .addTag('collections', 'Collection management')
      .addTag('health', 'Service health check')
      .addCookieAuth('accessToken')
      .build();

   const document = SwaggerModule.createDocument(app, swaggerConfig);
   SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
   });

   const port = process.env.PORT ?? 3001;
   await app.listen(port);
   console.log(`API running on http://localhost:${port}/api`);
   console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
