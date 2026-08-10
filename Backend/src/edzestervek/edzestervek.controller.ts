import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEdzestervekDto } from './dto/create-edzestervek.dto';
import { UpdateEdzestervekDto } from './dto/update-edzestervek.dto';
import { EdzestervekService } from './edzestervek.service';

@Controller('edzestervek')
export class EdzestervekController {
  constructor(private readonly edzestervekService: EdzestervekService) {}

  private getUserId(@Headers('x-user-id') userIdHeader?: string): number | undefined {
    if (!userIdHeader) {
      return undefined;
    }

    const userId = Number(userIdHeader);

    if (Number.isNaN(userId)) {
      throw new UnauthorizedException('Érvénytelen felhasználó azonosító.');
    }

    return userId;
  }

  @Post()
  create(
    @Body() createEdzestervekDto: CreateEdzestervekDto,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = this.getUserId(userIdHeader);

    if (!userId) {
      throw new UnauthorizedException('Bejelentkezés szükséges az edzésterv létrehozásához.');
    }

    return this.edzestervekService.create(createEdzestervekDto, userId);
  }

  @Get()
  findAll(@Headers('x-user-id') userIdHeader?: string) {
    const userId = this.getUserId(userIdHeader);

    if (!userId) {
      throw new UnauthorizedException('Bejelentkezés szükséges az edzéstervek megtekintéséhez.');
    }

    return this.edzestervekService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = this.getUserId(userIdHeader);

    if (!userId) {
      throw new UnauthorizedException('Bejelentkezés szükséges az edzésterv megtekintéséhez.');
    }

    return this.edzestervekService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEdzestervekDto: UpdateEdzestervekDto,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = this.getUserId(userIdHeader);

    if (!userId) {
      throw new UnauthorizedException('Bejelentkezés szükséges az edzésterv módosításához.');
    }

    return this.edzestervekService.update(id, updateEdzestervekDto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = this.getUserId(userIdHeader);

    if (!userId) {
      throw new UnauthorizedException('Bejelentkezés szükséges az edzésterv törléséhez.');
    }

    return this.edzestervekService.remove(id, userId);
  }
}