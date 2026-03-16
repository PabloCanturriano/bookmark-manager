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
} from "@nestjs/common";
import { Request } from "express";
import {
  CreateBookmarkDto,
  CreateBookmarkSchema,
  ListBookmarksDto,
  ListBookmarksSchema,
  SearchBookmarksDto,
  SearchBookmarksSchema,
  UpdateBookmarkDto,
  UpdateBookmarkSchema,
} from "@bookmark-manager/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { BookmarksService } from "./bookmarks.service";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller("bookmarks")
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @Post()
  create(
    @Req() req: AuthRequest,
    @Body(new ZodValidationPipe(CreateBookmarkSchema)) dto: CreateBookmarkDto,
  ) {
    return this.bookmarksService.create(req.user.id, dto);
  }

  @Get("search")
  search(
    @Req() req: AuthRequest,
    @Query(new ZodValidationPipe(SearchBookmarksSchema)) query: SearchBookmarksDto,
  ) {
    return this.bookmarksService.search(req.user.id, query);
  }

  @Get()
  findAll(
    @Req() req: AuthRequest,
    @Query(new ZodValidationPipe(ListBookmarksSchema)) query: ListBookmarksDto,
  ) {
    return this.bookmarksService.findAll(req.user.id, query);
  }

  @Get(":id")
  findOne(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.bookmarksService.findOne(req.user.id, id);
  }

  @Patch(":id")
  update(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateBookmarkSchema)) dto: UpdateBookmarkDto,
  ) {
    return this.bookmarksService.update(req.user.id, id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.bookmarksService.remove(req.user.id, id);
  }
}
