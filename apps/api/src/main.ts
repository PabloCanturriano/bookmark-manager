import { NestFactory } from '@nestjs/core';
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

   const port = process.env.PORT ?? 3001;
   await app.listen(port);
   console.log(`API running on http://localhost:${port}/api`);
}

bootstrap();
