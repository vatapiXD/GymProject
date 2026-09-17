import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/auth.decorators';
import type { AuthUser } from '../auth/auth.decorators';
import { PaginationDto } from '../common/pagination.dto';
import { AddExerciseDto, SetDto, StartWorkoutDto } from './workouts.dto';
import { WorkoutsService } from './workouts.service';
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly service: WorkoutsService) {}
  @Post() start(@Body() dto: StartWorkoutDto, @CurrentUser() u: AuthUser) { return this.service.start(u.id, dto); }
  @Get('current') current(@CurrentUser() u: AuthUser) { return this.service.current(u.id); }
  @Get('history') history(@Query() q: PaginationDto, @CurrentUser() u: AuthUser) { return this.service.history(u.id, q.page, q.limit); }
  @Get('stats') stats(@CurrentUser() u: AuthUser) { return this.service.stats(u.id); }
  @Get(':id') detail(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { return this.service['own'](id, u.id); }
  @Post(':id/exercises') addExercise(@Param('id', ParseIntPipe) id: number, @Body() dto: AddExerciseDto, @CurrentUser() u: AuthUser) { return this.service.addExercise(id, u.id, dto); }
  @Post(':id/exercises/:exerciseId/sets') addSet(@Param('id', ParseIntPipe) id: number, @Param('exerciseId', ParseIntPipe) exerciseId: number, @Body() dto: SetDto, @CurrentUser() u: AuthUser) { return this.service.addSet(id, exerciseId, u.id, dto); }
  @Patch(':id/sets/:setId') updateSet(@Param('id', ParseIntPipe) id: number, @Param('setId', ParseIntPipe) setId: number, @Body() dto: SetDto, @CurrentUser() u: AuthUser) { return this.service.updateSet(id, setId, u.id, dto); }
  @Delete(':id/sets/:setId') deleteSet(@Param('id', ParseIntPipe) id: number, @Param('setId', ParseIntPipe) setId: number, @CurrentUser() u: AuthUser) { return this.service.deleteSet(id, setId, u.id); }
  @Post(':id/finish') finish(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { return this.service.finish(id, u.id); }
  @Post(':id/cancel') cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { return this.service.finish(id, u.id, true); }
}
