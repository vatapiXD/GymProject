import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGyakorlatokDto } from './dto/create-gyakorlatok.dto';
import { UpdateGyakorlatokDto } from './dto/update-gyakorlatok.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GyakorlatokService {
  constructor(private readonly prisma: PrismaService) {}

  create(createGyakorlatokDto: CreateGyakorlatokDto) {
    return this.prisma.gyakorlatok.create({
      data: createGyakorlatokDto,
    });
  }

  findAll() {
    return this.prisma.gyakorlatok.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        izomcsoportok_gyakorlatok_elsodleges_izomcsoport_idToizomcsoportok:
          true,
        izomcsoportok_gyakorlatok_masodlagos_izomcsoport_idToizomcsoportok:
          true,
      },
    });
  }

  async findOne(id: number) {
    const gyakorlat = await this.prisma.gyakorlatok.findUnique({
      where: {
        id,
      },
      include: {
        izomcsoportok_gyakorlatok_elsodleges_izomcsoport_idToizomcsoportok:
          true,
        izomcsoportok_gyakorlatok_masodlagos_izomcsoport_idToizomcsoportok:
          true,
      },
    });

    if (!gyakorlat) {
      throw new NotFoundException(`Gyakorlat ${id} nem található`);
    }

    return gyakorlat;
  }

  async update(id: number, updateGyakorlatokDto: UpdateGyakorlatokDto) {
    await this.findOne(id);

    return this.prisma.gyakorlatok.update({
      where: {
        id,
      },
      data: updateGyakorlatokDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.gyakorlatok.delete({
      where: {
        id,
      },
    });
  }
}
