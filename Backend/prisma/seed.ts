import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  const mellkas = await prisma.izomcsoportok.upsert({ where: { nev: 'Mellkas' }, update: {}, create: { nev: 'Mellkas' } });
  const hat = await prisma.izomcsoportok.upsert({ where: { nev: 'Hát' }, update: {}, create: { nev: 'Hát' } });
  for (const [nev, primary] of [['Fekvenyomás', mellkas.id], ['Evezés rúddal', hat.id]] as const) {
    const existing = await prisma.gyakorlatok.findFirst({ where: { nev } });
    if (!existing) await prisma.gyakorlatok.create({ data: { nev, elsodleges_izomcsoport_id: primary } });
  }
}
main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
