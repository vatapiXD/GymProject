import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEdzestervGyakorlatokDto } from './dto/create-edzesterv_gyakorlatok.dto';
import { UpdateEdzestervGyakorlatokDto } from './dto/update-edzesterv_gyakorlatok.dto';

@Injectable()
export class EdzestervGyakorlatokService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEdzestervGyakorlatokDto) {
    return this.prisma.edzesterv_gyakorlatok.create({ data: dto });
  }

  findAll() {
    return this.prisma.edzesterv_gyakorlatok.findMany({
      orderBy: { id: 'asc' },
      include: {
        edzes_napok: true,
        gyakorlatok: true,
      },
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.edzesterv_gyakorlatok.findUnique({
      where: { id },
      include: {
        edzes_napok: true,
        gyakorlatok: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Edzés terv gyakorlat ${id} nem található`);
    }

    return record;
  }

  async update(id: number, dto: UpdateEdzestervGyakorlatokDto) {
    await this.findOne(id);

    return this.prisma.edzesterv_gyakorlatok.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.edzesterv_gyakorlatok.delete({ where: { id } });
  }
}
