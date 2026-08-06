import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserekDto } from './dto/create-userek.dto';
import { UpdateUserekDto } from './dto/update-userek.dto';

@Injectable()
export class UserekService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserekDto: CreateUserekDto) {
    return this.prisma.userek.create({
      data: createUserekDto,
    });
  }

  findAll() {
    return this.prisma.userek.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        edzestervek: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.userek.findUnique({
      where: { id },
      include: {
        edzestervek: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Felhasználó ${id} nem található`);
    }

    return user;
  }

  async update(id: number, updateUserekDto: UpdateUserekDto) {
    await this.findOne(id);

    return this.prisma.userek.update({
      where: { id },
      data: updateUserekDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.userek.delete({
      where: { id },
    });
  }
}
