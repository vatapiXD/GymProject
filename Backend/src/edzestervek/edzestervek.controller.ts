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
import { CreateEdzestervekDto } from './dto/create-edzestervek.dto';
import { UpdateEdzestervekDto } from './dto/update-edzestervek.dto';
import { EdzestervekService } from './edzestervek.service';

@Controller('edzestervek')
export class EdzestervekController {
  constructor(private readonly edzestervekService: EdzestervekService) {}

  @Post()
  create(@Body() createEdzestervekDto: CreateEdzestervekDto) {
    return this.edzestervekService.create(createEdzestervekDto);
  }

  @Get()
  findAll() {
    return this.edzestervekService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.edzestervekService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEdzestervekDto: UpdateEdzestervekDto,
  ) {
    return this.edzestervekService.update(id, updateEdzestervekDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.edzestervekService.remove(id);
  }
}
