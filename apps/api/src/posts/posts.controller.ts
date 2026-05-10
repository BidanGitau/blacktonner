import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { RolesGuard } from '../auth/roles.guard';

@Controller()
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  // ── Public ─────────────────────────────────────────
  @Get('posts')
  listPublic(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    return this.posts.findAllPublic({
      category,
      search,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('posts/:slug')
  getPublic(@Param('slug') slug: string) {
    return this.posts.findOnePublic(slug);
  }

  // ── Admin ──────────────────────────────────────────
  @UseGuards(RolesGuard)
  @Get('admin/posts')
  listAdmin(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('status') status?: 'draft' | 'published' | 'all',
  ) {
    return this.posts.findAllAdmin({ category, search, status });
  }

  @UseGuards(RolesGuard)
  @Get('admin/posts/:id')
  getAdmin(@Param('id') id: string) {
    return this.posts.findOneAdmin(id);
  }

  @UseGuards(RolesGuard)
  @Post('admin/posts')
  create(@Body() dto: any) {
    return this.posts.create(dto);
  }

  @UseGuards(RolesGuard)
  @Patch('admin/posts/:id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.posts.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Delete('admin/posts/:id')
  remove(@Param('id') id: string) {
    return this.posts.remove(id);
  }
}
