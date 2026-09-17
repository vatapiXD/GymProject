import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, userek_rang } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { SavePlanDto } from './dto/save-plan.dto';

const planInclude = { edzes_napok: { orderBy: { sorrend: 'asc' as const }, include: { edzesterv_gyakorlatok: { orderBy: { sorrend: 'asc' as const }, include: { gyakorlatok: { select: { id: true, nev: true } } } } } }, userek: { select: { id: true, nev: true, username: true, avatar_url: true } } } satisfies Prisma.edzestervekInclude;

@Injectable()
export class EdzestervekService {
  constructor(private readonly prisma: PrismaService) {}
  private async owner(planId: number, userId: number) {
    const plan = await this.prisma.edzestervek.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Az edzésterv nem található.');
    if (plan.user_id !== userId) throw new ForbiddenException('Csak a saját edzéstervedet módosíthatod.');
    return plan;
  }
  private async assertPublishing(userId: number, requested?: boolean) {
    if (!requested) return;
    const user = await this.prisma.userek.findUnique({ where: { id: userId }, select: { rang: true } });
    if (!user || (user.rang !== userek_rang.edzo && user.rang !== userek_rang.admin)) throw new ForbiddenException('Publikus tervet csak edző vagy admin hozhat létre.');
  }
  private validate(dto: SavePlanDto) {
    if (new Set(dto.napok.map((day) => day.sorrend)).size !== dto.napok.length) throw new ForbiddenException('A napok sorrendje nem lehet azonos.');
    for (const day of dto.napok) {
      if (day.gyakorlatok.some((exercise) => exercise.ismetlesszam_min > exercise.ismetlesszam_max)) throw new ForbiddenException('Az ismétléstartomány érvénytelen.');
      if (new Set(day.gyakorlatok.map((x) => x.sorrend)).size !== day.gyakorlatok.length) throw new ForbiddenException('A gyakorlatok sorrendje nem lehet azonos.');
    }
  }
  private data(dto: SavePlanDto, userId: number) {
    return { user_id: userId, nev: dto.nev.trim(), leiras: dto.leiras?.trim() || null, aktiv: dto.aktiv ?? true, publikus: dto.publikus ?? false, edzes_napok: { create: dto.napok.map((day) => ({ nev: day.nev.trim(), sorrend: day.sorrend, edzesterv_gyakorlatok: { create: day.gyakorlatok.map((exercise) => ({ ...exercise, megjegyzese: exercise.megjegyzese?.trim() || null })) } })) } };
  }
  async create(dto: SavePlanDto, userId: number) { this.validate(dto); await this.assertPublishing(userId, dto.publikus); return this.prisma.edzestervek.create({ data: this.data(dto, userId), include: planInclude }); }
  async update(id: number, dto: SavePlanDto, userId: number) {
    await this.owner(id, userId); this.validate(dto); await this.assertPublishing(userId, dto.publikus);
    return this.prisma.$transaction(async (tx) => {
      await tx.edzestervek.update({ where: { id }, data: { nev: dto.nev.trim(), leiras: dto.leiras?.trim() || null, aktiv: dto.aktiv ?? true, publikus: dto.publikus ?? false } });
      await tx.edzes_napok.deleteMany({ where: { edzesterv_id: id } });
      return tx.edzestervek.update({ where: { id }, data: { edzes_napok: { create: dto.napok.map((day) => ({ nev: day.nev.trim(), sorrend: day.sorrend, edzesterv_gyakorlatok: { create: day.gyakorlatok.map((exercise) => ({ ...exercise, megjegyzese: exercise.megjegyzese?.trim() || null })) } })) } }, include: planInclude });
    });
  }
  async list(userId: number | undefined, page: number, limit: number) {
    const where = userId ? { OR: [{ user_id: userId }, { publikus: true }] } : { publikus: true };
    const [items, total] = await this.prisma.$transaction([this.prisma.edzestervek.findMany({ where, include: planInclude, orderBy: [{ letrehozva: 'desc' }, { id: 'desc' }], skip: (page - 1) * limit, take: limit }), this.prisma.edzestervek.count({ where })]);
    return { items, total, page, limit };
  }
  async findOne(id: number, userId?: number) { const plan = await this.prisma.edzestervek.findUnique({ where: { id }, include: planInclude }); if (!plan) throw new NotFoundException('Az edzésterv nem található.'); if (!plan.publikus && plan.user_id !== userId) throw new ForbiddenException('Ez az edzésterv privát.'); return plan; }
  async archive(id: number, userId: number) { await this.owner(id, userId); return this.prisma.edzestervek.update({ where: { id }, data: { aktiv: false } }); }
  async remove(id: number, userId: number) { await this.owner(id, userId); return this.prisma.edzestervek.delete({ where: { id } }); }
  async copy(id: number, userId: number) { const plan = await this.findOne(id, userId); return this.prisma.edzestervek.create({ data: { user_id: userId, nev: `${plan.nev} (másolat)`, leiras: plan.leiras, aktiv: true, publikus: false, edzes_napok: { create: plan.edzes_napok.map((day) => ({ nev: day.nev, sorrend: day.sorrend, edzesterv_gyakorlatok: { create: day.edzesterv_gyakorlatok.map((item) => ({ gyakorlat_id: item.gyakorlat_id, sorrend: item.sorrend, sorozatszam: item.sorozatszam, ismetlesszam_min: item.ismetlesszam_min, ismetlesszam_max: item.ismetlesszam_max, piheno_masodperc: item.piheno_masodperc, megjegyzese: item.megjegyzese })) } })) } }, include: planInclude }); }
}
