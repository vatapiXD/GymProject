import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKajaDto } from './dto/create-kaja.dto';
import { UpdateKajaDto } from './dto/update-kaja.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class KajaService {
  constructor(private readonly prisma: PrismaService) {}

  create(createKajaDto: CreateKajaDto) {
    return this.prisma.kaja.create({
      data: createKajaDto,
    });
  }

  findAll() {
    return this.prisma.kaja.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const kaja = await this.prisma.kaja.findUnique({
      where: {
        id,
      },
    });

    if (!kaja) {
      throw new NotFoundException(`Kaja ${id} nem található`);
    }

    return kaja;
  }

  async update(id: number, updateKajaDto: UpdateKajaDto) {
    await this.findOne(id);

    return this.prisma.kaja.update({
      where: {
        id,
      },
      data: updateKajaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.kaja.delete({
      where: {
        id,
      },
    });
  }
}
