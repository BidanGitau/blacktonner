import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TeamService } from './team.service';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(RolesGuard) // defaults to admin-only
@Controller('admin/team')
export class TeamController {
  constructor(private readonly team: TeamService) {}

  @Get()
  list() {
    return this.team.list();
  }

  @Post()
  create(@Body() dto: any) {
    return this.team.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.team.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const currentId = (req as any).user?.sub as string;
    return this.team.remove(id, currentId);
  }
}
