import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
    @Query('active') active?: string,
  ) {
    return this.productsService.findAll({
      category,
      featured: featured !== undefined ? featured === 'true' : undefined,
      badge,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      active: active !== undefined ? active !== 'false' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post('import')
  importCsv(@Body() body: { csv: string }) {
    return this.productsService.importCsv(body.csv);
  }
}
