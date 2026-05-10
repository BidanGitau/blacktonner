import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(RolesGuard)
@Roles('admin', 'sales')
@Controller('admin')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get('leads')
  list(
    @Query('status') status?: any,
    @Query('assignedToId') assignedToId?: string,
    @Query('source') source?: any,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leads.findAll({
      status,
      assignedToId,
      source,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('leads/pipeline')
  pipeline() {
    return this.leads.pipelineStats();
  }

  @Get('leads/agents')
  agents() {
    return this.leads.listAgents();
  }

  @Get('leads/:id')
  get(@Param('id') id: string) {
    return this.leads.findOne(id);
  }

  @Post('leads')
  create(@Body() dto: any) {
    return this.leads.create(dto);
  }

  @Patch('leads/:id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.leads.update(id, dto);
  }

  @Delete('leads/:id')
  remove(@Param('id') id: string) {
    return this.leads.remove(id);
  }

  @Post('leads/:id/activities')
  addActivity(@Param('id') id: string, @Body() dto: any) {
    return this.leads.addActivity(id, dto);
  }
}
