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
import { CreateEdzestervGyakorlatokDto } from './dto/create-edzesterv_gyakorlatok.dto';
import { UpdateEdzestervGyakorlatokDto } from './dto/update-edzesterv_gyakorlatok.dto';
import { EdzestervGyakorlatokService } from './edzesterv_gyakorlatok.service';

@Controller('edzesterv-gyakorlatok')
export class EdzestervGyakorlatokController {
  constructor(private readonly service: EdzestervGyakorlatokService) {}

  @Post()
  create(@Body() dto: CreateEdzestervGyakorlatokDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEdzestervGyakorlatokDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
