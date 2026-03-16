import { Module } from '@nestjs/common';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { ScraperService } from './scraper.service';

@Module({
   controllers: [BookmarksController],
   providers: [BookmarksService, ScraperService],
})
export class BookmarksModule {}
