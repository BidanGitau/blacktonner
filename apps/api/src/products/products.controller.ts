import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProductsService, type ImportRow } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from '../auth/roles.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('featured') featured?: string,
    @Query('badge') badge?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('active') active?: string,
  ) {
    return this.productsService.findAll({
      category,
      featured: featured !== undefined ? featured === 'true' : undefined,
      badge,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      active: active !== undefined ? active !== 'false' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @UseGuards(RolesGuard)
  @Post('import')
  importBulk(@Body() body: { rows: ImportRow[] }) {
    return this.productsService.importBulk(body.rows ?? []);
  }
}
