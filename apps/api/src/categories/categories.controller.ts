import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { RolesGuard } from '../auth/roles.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    return this.categoriesService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
  }

  @Get('count')
  count(@Query('search') search?: string) {
    return this.categoriesService.count(search);
  }

  @UseGuards(RolesGuard)
  @Post()
  create(@Body() body: { name: string; slug: string; description?: string }) {
    return this.categoriesService.create(body);
  }

  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; slug?: string; description?: string }) {
    return this.categoriesService.update(id, body);
  }

  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
