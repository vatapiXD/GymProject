import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe } from '@nestjs/common';
import { IzomcsoportokService } from './izomcsoportok.service';
import { CreateIzomcsoportokDto } from './dto/create-izomcsoportok.dto';
import { UpdateIzomcsoportokDto } from './dto/update-izomcsoportok.dto';
import { Public, Roles } from '../auth/auth.decorators';
import { userek_rang } from '@prisma/client';

@Controller('izomcsoportok')
export class IzomcsoportokController {
  constructor(private readonly izomcsoportokService: IzomcsoportokService) {}

  @Roles(userek_rang.admin) @Post()
  create(@Body() createIzomcsoportokDto: CreateIzomcsoportokDto) {
    return this.izomcsoportokService.create(createIzomcsoportokDto);
  }

  @Public() @Get()
  findAll() {
    return this.izomcsoportokService.findAll();
  }

  @Public() @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.izomcsoportokService.findOne(id);
  }

  @Roles(userek_rang.admin) @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateIzomcsoportokDto: UpdateIzomcsoportokDto) {
    return this.izomcsoportokService.update(id, updateIzomcsoportokDto);
  }

  @Roles(userek_rang.admin) @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.izomcsoportokService.remove(id);
  }
}
