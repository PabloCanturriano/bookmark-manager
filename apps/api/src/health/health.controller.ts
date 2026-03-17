import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
   constructor(private prisma: PrismaService) {}

   @Get()
   @ApiOperation({ summary: 'Service and database health check' })
   async check() {
      let db: 'ok' | 'error' = 'ok';

      try {
         await this.prisma.$queryRaw`SELECT 1`;
      } catch {
         db = 'error';
      }

      return {
         status: db === 'ok' ? 'ok' : 'degraded',
         db,
      };
   }
}
