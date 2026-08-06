import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEdzestervekDto } from './dto/create-edzestervek.dto';
import { UpdateEdzestervekDto } from './dto/update-edzestervek.dto';

@Injectable()
export class EdzestervekService {
  constructor(private readonly prisma: PrismaService) {}

  create(createEdzestervekDto: CreateEdzestervekDto) {
    return this.prisma.edzestervek.create({
      data: createEdzestervekDto,
    });
  }

  findAll() {
    return this.prisma.edzestervek.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        userek: true,
        edzes_napok: true,
      },
    });
  }

  async findOne(id: number) {
    const plan = await this.prisma.edzestervek.findUnique({
      where: { id },
      include: {
        userek: true,
        edzes_napok: true,
      },
    });

    if (!plan) {
      throw new NotFoundException(`Edzésterv ${id} nem található`);
    }

    return plan;
  }

  async update(id: number, updateEdzestervekDto: UpdateEdzestervekDto) {
    await this.findOne(id);

    return this.prisma.edzestervek.update({
      where: { id },
      data: updateEdzestervekDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.edzestervek.delete({
      where: { id },
    });
  }
}
