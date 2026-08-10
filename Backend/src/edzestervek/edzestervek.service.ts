import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEdzestervekDto } from './dto/create-edzestervek.dto';
import { UpdateEdzestervekDto } from './dto/update-edzestervek.dto';

@Injectable()
export class EdzestervekService {
  constructor(private readonly prisma: PrismaService) {}

  create(createEdzestervekDto: CreateEdzestervekDto, userId: number) {
    if (userId !== createEdzestervekDto.user_id) {
      throw new ForbiddenException('Csak a saját nevedben hozhatsz létre edzéstervet.');
    }

    return this.prisma.edzestervek.create({
      data: createEdzestervekDto,
    });
  }

  findAll(userId?: number) {
    if (!userId) {
      throw new UnauthorizedException('Bejelentkezés szükséges az edzéstervek megtekintéséhez.');
    }

    return this.prisma.edzestervek.findMany({
      where: {
        OR: [{ user_id: userId }, { publikus: true }],
      },
      orderBy: {
        id: 'asc',
      },
      include: {
        userek: true,
        edzes_napok: true,
      },
    });
  }

  async findOne(id: number, userId?: number) {
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

    if (!userId) {
      throw new UnauthorizedException('Bejelentkezés szükséges az edzésterv megtekintéséhez.');
    }

    if (plan.user_id !== userId && !plan.publikus) {
      throw new ForbiddenException('Ehhez az edzéstervhez nincs hozzáférésed.');
    }

    return plan;
  }

  async update(id: number, updateEdzestervekDto: UpdateEdzestervekDto, userId: number) {
    await this.findOne(id, userId);

    if (userId !== (updateEdzestervekDto.user_id ?? (await this.prisma.edzestervek.findUnique({ where: { id } }))?.user_id)) {
      throw new ForbiddenException('Csak a saját edzéstervedet módosíthatod.');
    }

    return this.prisma.edzestervek.update({
      where: { id },
      data: updateEdzestervekDto,
    });
  }

  async remove(id: number, userId: number) {
    const plan = await this.prisma.edzestervek.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Edzésterv ${id} nem található`);
    }

    if (plan.user_id !== userId) {
      throw new ForbiddenException('Csak a saját edzéstervedet törölheted.');
    }

    return this.prisma.edzestervek.delete({
      where: { id },
    });
  }
}