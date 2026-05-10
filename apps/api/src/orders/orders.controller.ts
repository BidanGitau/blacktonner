import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RolesGuard } from '../auth/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(RolesGuard)
  @Get('stats')
  getStats() {
    return this.ordersService.getStats();
  }

  @UseGuards(RolesGuard)
  @Get()
  findAll(@Query() q: QueryOrdersDto) {
    return this.ordersService.findAll({
      status: q.status,
      search: q.search,
      from: q.from,
      to: q.to,
      page: q.page ? +q.page : 1,
      limit: q.limit ? +q.limit : 20,
    });
  }

  @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.ordersService.confirm(id);
  }
}
