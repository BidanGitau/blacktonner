import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(RolesGuard)
@Roles('admin', 'sales', 'technician')
@Controller('admin')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get('tickets/stats')
  stats() { return this.tickets.stats(); }

  @Get('tickets/technicians')
  technicians() { return this.tickets.listTechnicians(); }

  @Get('tickets')
  list(
    @Query('status') status?: any,
    @Query('assignedToId') assignedToId?: string,
    @Query('customerId') customerId?: string,
    @Query('priority') priority?: any,
    @Query('search') search?: string,
  ) {
    return this.tickets.findAll({ status, assignedToId, customerId, priority, search });
  }

  @Get('tickets/:id')
  get(@Param('id') id: string) { return this.tickets.findOne(id); }

  @Post('tickets')
  create(@Body() dto: any) { return this.tickets.create(dto); }

  @Patch('tickets/:id')
  update(@Param('id') id: string, @Body() dto: any) { return this.tickets.update(id, dto); }

  @Delete('tickets/:id')
  remove(@Param('id') id: string) { return this.tickets.remove(id); }

  @Post('tickets/:id/updates')
  addUpdate(@Param('id') id: string, @Body() dto: any) { return this.tickets.addUpdate(id, dto); }
}
