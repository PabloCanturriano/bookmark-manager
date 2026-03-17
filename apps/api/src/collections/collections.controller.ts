import {
   Body,
   Controller,
   Delete,
   Get,
   HttpCode,
   Param,
   Patch,
   Post,
   Req,
   UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
   CreateCollectionDto,
   CreateCollectionSchema,
   UpdateCollectionDto,
   UpdateCollectionSchema,
} from '@bookmark-manager/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CollectionsService } from './collections.service';

interface AuthRequest extends Request {
   user: { id: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('collections')
export class CollectionsController {
   constructor(private collectionsService: CollectionsService) {}

   @Get()
   findAll(@Req() req: AuthRequest) {
      return this.collectionsService.findAll(req.user.id);
   }

   @Get(':id')
   findOne(@Req() req: AuthRequest, @Param('id') id: string) {
      return this.collectionsService.findOne(req.user.id, id);
   }

   @Post()
   create(
      @Req() req: AuthRequest,
      @Body(new ZodValidationPipe(CreateCollectionSchema)) dto: CreateCollectionDto,
   ) {
      return this.collectionsService.create(req.user.id, dto);
   }

   @Patch(':id')
   update(
      @Req() req: AuthRequest,
      @Param('id') id: string,
      @Body(new ZodValidationPipe(UpdateCollectionSchema)) dto: UpdateCollectionDto,
   ) {
      return this.collectionsService.update(req.user.id, id, dto);
   }

   @Delete(':id')
   @HttpCode(204)
   remove(@Req() req: AuthRequest, @Param('id') id: string) {
      return this.collectionsService.remove(req.user.id, id);
   }
}
