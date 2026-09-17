import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KajaService } from './kaja.service';
import { CreateKajaDto } from './dto/create-kaja.dto';
import { UpdateKajaDto } from './dto/update-kaja.dto';
import { Public, Roles } from '../auth/auth.decorators';
import { userek_rang } from '@prisma/client';

@Controller('kaja')
export class KajaController {
  constructor(private readonly kajaService: KajaService) {}

  @Roles(userek_rang.admin) @Post()
  create(@Body() createKajaDto: CreateKajaDto) {
    return this.kajaService.create(createKajaDto);
  }

  @Public() @Get()
  findAll() {
    return this.kajaService.findAll();
  }

  @Public() @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kajaService.findOne(+id);
  }

  @Roles(userek_rang.admin) @Patch(':id')
  update(@Param('id') id: string, @Body() updateKajaDto: UpdateKajaDto) {
    return this.kajaService.update(+id, updateKajaDto);
  }

  @Roles(userek_rang.admin) @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kajaService.remove(+id);
  }
}
