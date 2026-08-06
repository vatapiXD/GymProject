import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEdzesNapokDto } from './dto/create-edzes_napok.dto';
import { UpdateEdzesNapokDto } from './dto/update-edzes_napok.dto';

@Injectable()
export class EdzesNapokService {
  constructor(private readonly prisma: PrismaService) {}

  create(createEdzesNapokDto: CreateEdzesNapokDto) {
    return this.prisma.edzes_napok.create({
      data: createEdzesNapokDto,
    });
  }

  findAll() {
    return this.prisma.edzes_napok.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        edzestervek: true,
        edzesterv_gyakorlatok: true,
      },
    });
  }

  async findOne(id: number) {
    const day = await this.prisma.edzes_napok.findUnique({
      where: { id },
      include: {
        edzestervek: true,
        edzesterv_gyakorlatok: true,
      },
    });

    if (!day) {
      throw new NotFoundException(`Edzésnap ${id} nem található`);
    }

    return day;
  }

  async update(id: number, updateEdzesNapokDto: UpdateEdzesNapokDto) {
    await this.findOne(id);

    return this.prisma.edzes_napok.update({
      where: { id },
      data: updateEdzesNapokDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.edzes_napok.delete({
      where: { id },
    });
  }
}
