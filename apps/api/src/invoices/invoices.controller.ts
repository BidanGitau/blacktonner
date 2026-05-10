import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(RolesGuard)
@Roles('admin', 'sales')
@Controller('admin/invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get('stats')
  stats() {
    return this.invoices.stats();
  }

  @Get()
  list(
    @Query('status') status?: any,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
  ) {
    return this.invoices.findAll({ status, customerId, search });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.invoices.findOne(id);
  }

  @Post()
  create(@Body() dto: any) {
    return this.invoices.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.invoices.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoices.remove(id);
  }
}
