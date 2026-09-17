import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, Public } from '../auth/auth.decorators';
import type { AuthUser } from '../auth/auth.decorators';
import { PaginationDto } from '../common/pagination.dto';
import { SavePlanDto } from './dto/save-plan.dto';
import { EdzestervekService } from './edzestervek.service';
@Controller('edzestervek')
export class EdzestervekController {
  constructor(private readonly service: EdzestervekService) {}
  @Post() create(@Body() dto: SavePlanDto, @CurrentUser() user: AuthUser) { return this.service.create(dto, user.id); }
  @Public() @Get() list(@Query() page: PaginationDto, @CurrentUser() user?: AuthUser) { return this.service.list(user?.id, page.page, page.limit); }
  @Public() @Get(':id') findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: AuthUser) { return this.service.findOne(id, user?.id); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: SavePlanDto, @CurrentUser() user: AuthUser) { return this.service.update(id, dto, user.id); }
  @Patch(':id/archive') archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) { return this.service.archive(id, user.id); }
  @Post(':id/copy') copy(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) { return this.service.copy(id, user.id); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) { return this.service.remove(id, user.id); }
}
