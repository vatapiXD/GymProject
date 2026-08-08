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
import { UserekService } from './userek.service';
import { CreateUserekDto } from './dto/create-userek.dto';
import { LoginUserekDto } from './dto/login-userek.dto';
import { UpdateUserekDto } from './dto/update-userek.dto';

@Controller('userek')
export class UserekController {
  constructor(private readonly userekService: UserekService) {}

  @Post()
  create(@Body() createUserekDto: CreateUserekDto) {
    return this.userekService.create(createUserekDto);
  }

  @Post('login')
  login(@Body() loginUserekDto: LoginUserekDto) {
    return this.userekService.login(loginUserekDto);
  }

  @Get()
  findAll() {
    return this.userekService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userekService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserekDto: UpdateUserekDto,
  ) {
    return this.userekService.update(id, updateUserekDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userekService.remove(id);
  }
}
