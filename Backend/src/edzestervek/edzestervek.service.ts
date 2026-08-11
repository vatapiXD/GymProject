import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { userek_rang } from 'generated/prisma/enums';
import { PrismaService } from '../prisma.service';
import { CreateEdzestervekDto } from './dto/create-edzestervek.dto';
import { UpdateEdzestervekDto } from './dto/update-edzestervek.dto';

@Injectable()
export class EdzestervekService {
  constructor(private readonly prisma: PrismaService) {}

  private canPublish(rang?: userek_rang | null) {
    return rang === userek_rang.edzo || rang === userek_rang.admin;
  }

  private async getUserRang(userId: number): Promise<userek_rang | null> {
    const user = await this.prisma.userek.findUnique({
      where: { id: userId },
      select: { rang: true },
    });

    if (!user) {
      throw new NotFoundException(`Felhasználó ${userId} nem található`);
    }

    return user.rang;
  }

  private async assertCanSetPublic(userId: number) {
    const rang = await this.getUserRang(userId);

    if (!this.canPublish(rang)) {
      throw new ForbiddenException(
        'Csak edző vagy admin rangú felhasználó publikálhat edzéstervet.',
      );
    }
  }

  async create(createEdzestervekDto: CreateEdzestervekDto, userId: number) {
    const rang = await this.getUserRang(userId);
    const isCoach = this.canPublish(rang);

    // Regular users can only create plans in their own name.
    // Coaches/admins can create plans for any user (sharing).
    if (!isCoach && userId !== createEdzestervekDto.user_id) {
      throw new ForbiddenException('Csak a saját nevedben hozhatsz létre edzéstervet.');
    }

    if (createEdzestervekDto.publikus) {
      await this.assertCanSetPublic(userId);
    }

    return this.prisma.edzestervek.create({
      data: createEdzestervekDto,
    });
  }

  findAll(userId?: number) {
    // If not logged in, only public plans are visible.
    if (!userId) {
      return this.prisma.edzestervek.findMany({
        where: {
          publikus: true,
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
      if (!plan.publikus) {
        throw new UnauthorizedException('Bejelentkezés szükséges az edzésterv megtekintéséhez.');
      }
      return plan;
    }

    if (plan.user_id !== userId && !plan.publikus) {
      throw new ForbiddenException('Ehhez az edzéstervhez nincs hozzáférésed.');
    }

    return plan;
  }

  async update(id: number, updateEdzestervekDto: UpdateEdzestervekDto, userId: number) {
    const plan = await this.findOne(id, userId);
    const rang = await this.getUserRang(userId);
    const isCoach = this.canPublish(rang);

    // Regular users can only update their own plans.
    // Coaches/admins can update any plan.
    if (!isCoach && userId !== (updateEdzestervekDto.user_id ?? plan.user_id)) {
      throw new ForbiddenException('Csak a saját edzéstervedet módosíthatod.');
    }

    if (updateEdzestervekDto.publikus) {
      await this.assertCanSetPublic(userId);
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

    const rang = await this.getUserRang(userId);
    const isCoach = this.canPublish(rang);

    // Regular users can only delete their own plans.
    // Coaches/admins can delete any plan.
    if (!isCoach && plan.user_id !== userId) {
      throw new ForbiddenException('Csak a saját edzéstervedet törölheted.');
    }

    return this.prisma.edzestervek.delete({
      where: { id },
    });
  }
}