const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.update({
    where: { email: 'dilob0802@gmail.com' },
    data: {
      subscribers: '57',
      videoCount: '47',
      viewCount: '8776'
    }
  });
  console.log('Estatísticas atualizadas para dilob0802@gmail.com:', result);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
