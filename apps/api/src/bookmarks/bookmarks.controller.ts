import {
   Body,
   Controller,
   Delete,
   Get,
   HttpCode,
   Param,
   Patch,
   Post,
   Query,
   Req,
   UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
   CreateBookmarkDto,
   CreateBookmarkSchema,
   ListBookmarksDto,
   ListBookmarksSchema,
   SearchBookmarksDto,
   SearchBookmarksSchema,
   UpdateBookmarkDto,
   UpdateBookmarkSchema,
} from '@bookmark-manager/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthRequest } from '../common/types/auth.types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { BookmarksService } from './bookmarks.service';

@ApiTags('bookmarks')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
   constructor(private bookmarksService: BookmarksService) {}

   @ApiOperation({ summary: 'Save a bookmark', description: 'Scrapes title, description, cover image, and favicon automatically from the URL.' })
   @Post()
   create(
      @Req() req: AuthRequest,
      @Body(new ZodValidationPipe(CreateBookmarkSchema)) dto: CreateBookmarkDto,
   ) {
      return this.bookmarksService.create(req.user.id, dto);
   }

   @ApiOperation({ summary: 'List soft-deleted bookmarks (bin)' })
   @Get('bin')
   findBin(@Req() req: AuthRequest) {
      return this.bookmarksService.findBin(req.user.id);
   }

   @ApiOperation({ summary: 'Permanently delete all bookmarks in the bin' })
   @Delete('bin')
   @HttpCode(204)
   emptyBin(@Req() req: AuthRequest) {
      return this.bookmarksService.emptyBin(req.user.id);
   }

   @ApiOperation({ summary: 'Restore a bookmark from the bin' })
   @Patch(':id/restore')
   restore(@Req() req: AuthRequest, @Param('id') id: string) {
      return this.bookmarksService.restore(req.user.id, id);
   }

   @ApiOperation({ summary: 'Permanently delete a single bookmark' })
   @Delete(':id/permanent')
   @HttpCode(204)
   permanentDelete(@Req() req: AuthRequest, @Param('id') id: string) {
      return this.bookmarksService.permanentDelete(req.user.id, id);
   }

   @ApiOperation({ summary: 'Full-text search across title, description, and URL' })
   @Get('search')
   search(
      @Req() req: AuthRequest,
      @Query(new ZodValidationPipe(SearchBookmarksSchema)) query: SearchBookmarksDto,
   ) {
      return this.bookmarksService.search(req.user.id, query);
   }

   @ApiOperation({ summary: 'List bookmarks with pagination, collection, and favourite filters' })
   @Get()
   findAll(
      @Req() req: AuthRequest,
      @Query(new ZodValidationPipe(ListBookmarksSchema)) query: ListBookmarksDto,
   ) {
      return this.bookmarksService.findAll(req.user.id, query);
   }

   @ApiOperation({ summary: 'Get a single bookmark by ID' })
   @Get(':id')
   findOne(@Req() req: AuthRequest, @Param('id') id: string) {
      return this.bookmarksService.findOne(req.user.id, id);
   }

   @ApiOperation({ summary: 'Update title, description, collection, or favourite status' })
   @Patch(':id')
   update(
      @Req() req: AuthRequest,
      @Param('id') id: string,
      @Body(new ZodValidationPipe(UpdateBookmarkSchema)) dto: UpdateBookmarkDto,
   ) {
      return this.bookmarksService.update(req.user.id, id, dto);
   }

   @ApiOperation({ summary: 'Soft-delete a bookmark (moves to bin)' })
   @Delete(':id')
   @HttpCode(204)
   remove(@Req() req: AuthRequest, @Param('id') id: string) {
      return this.bookmarksService.remove(req.user.id, id);
   }
}
