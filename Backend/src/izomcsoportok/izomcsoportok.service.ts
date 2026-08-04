import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIzomcsoportokDto } from './dto/create-izomcsoportok.dto';
import { UpdateIzomcsoportokDto } from './dto/update-izomcsoportok.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class IzomcsoportokService {
  constructor(private readonly prisma: PrismaService) {}

  create(createIzomcsoportokDto: CreateIzomcsoportokDto) {
    return this.prisma.izomcsoportok.create({
      data: createIzomcsoportokDto,
    });
  }

  findAll() {
    return this.prisma.izomcsoportok.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        gyakorlatok_gyakorlatok_elsodleges_izomcsoport_idToizomcsoportok:
          true,
        gyakorlatok_gyakorlatok_masodlagos_izomcsoport_idToizomcsoportok:
          true,
      },
    });
  }

  async findOne(id: number) {
    const izomcsoport = await this.prisma.izomcsoportok.findUnique({
      where: {
        id,
      },
      include: {
        gyakorlatok_gyakorlatok_elsodleges_izomcsoport_idToizomcsoportok:
          true,
        gyakorlatok_gyakorlatok_masodlagos_izomcsoport_idToizomcsoportok:
          true,
      },
    });

    if (!izomcsoport) {
      throw new NotFoundException(`Izomcsoport ${id} nem található`);
    }

    return izomcsoport;
  }

  async update(id: number, updateIzomcsoportokDto: UpdateIzomcsoportokDto) {
    await this.findOne(id);

    return this.prisma.izomcsoportok.update({
      where: {
        id,
      },
      data: updateIzomcsoportokDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.izomcsoportok.delete({
      where: {
        id,
      },
    });
  }
}
