import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { EdzesNapokService } from './edzes_napok.service';
import { CreateEdzesNapokDto } from './dto/create-edzes_napok.dto';
import { UpdateEdzesNapokDto } from './dto/update-edzes_napok.dto';

@Controller('edzes-napok')
export class EdzesNapokController {
  constructor(private readonly edzesNapokService: EdzesNapokService) {}

  @Post()
  create(@Body() createEdzesNapokDto: CreateEdzesNapokDto) {
    return this.edzesNapokService.create(createEdzesNapokDto);
  }

  @Get()
  findAll() {
    return this.edzesNapokService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.edzesNapokService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEdzesNapokDto: UpdateEdzesNapokDto,
  ) {
    return this.edzesNapokService.update(id, updateEdzesNapokDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.edzesNapokService.remove(id);
  }
}
