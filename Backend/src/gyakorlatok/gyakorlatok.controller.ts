import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import { GyakorlatokService } from './gyakorlatok.service';
import { CreateGyakorlatokDto } from './dto/create-gyakorlatok.dto';
import { UpdateGyakorlatokDto } from './dto/update-gyakorlatok.dto';
import { Public, Roles } from '../auth/auth.decorators';
import { userek_rang } from '@prisma/client';

@Controller('gyakorlatok')
export class GyakorlatokController {
  constructor(private readonly gyakorlatokService: GyakorlatokService) {}

  @Roles(userek_rang.admin) @Post()
  create(@Body() createGyakorlatokDto: CreateGyakorlatokDto) {
    return this.gyakorlatokService.create(createGyakorlatokDto);
  }

  @Public() @Get()
  findAll() {
    return this.gyakorlatokService.findAll();
  }

  @Public() @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gyakorlatokService.findOne(id);
  }

  @Roles(userek_rang.admin) @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGyakorlatokDto: UpdateGyakorlatokDto,
  ) {
    return this.gyakorlatokService.update(id, updateGyakorlatokDto);
  }

  @Roles(userek_rang.admin) @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gyakorlatokService.remove(id);
  }
}
