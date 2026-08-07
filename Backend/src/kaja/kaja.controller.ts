import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KajaService } from './kaja.service';
import { CreateKajaDto } from './dto/create-kaja.dto';
import { UpdateKajaDto } from './dto/update-kaja.dto';

@Controller('kaja')
export class KajaController {
  constructor(private readonly kajaService: KajaService) {}

  @Post()
  create(@Body() createKajaDto: CreateKajaDto) {
    return this.kajaService.create(createKajaDto);
  }

  @Get()
  findAll() {
    return this.kajaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kajaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKajaDto: UpdateKajaDto) {
    return this.kajaService.update(+id, updateKajaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kajaService.remove(+id);
  }
}
