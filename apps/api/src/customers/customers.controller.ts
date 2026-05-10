import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(RolesGuard)
@Roles('admin', 'sales')
@Controller('admin/customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  list(@Query('q') q?: string, @Query('limit') limit?: string) {
    return this.customers.search(q, limit ? Number(limit) : 50);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.customers.findOne(id);
  }

  @Post()
  create(@Body() dto: any) {
    return this.customers.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.customers.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customers.remove(id);
  }
}
