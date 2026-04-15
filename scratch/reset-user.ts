import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function reset() {
  try {
    const user = await prisma.user.update({
      where: { email: "dilob0802@gmail.com" },
      data: { 
        onboardingComplete: false,
        youtubeChannelId: null,
        youtubeChannelName: null,
        youtubeChannelAvatar: null
      }
    });
    console.log("Usuário resetado com sucesso:", user.email);
  } catch (e) {
    console.error("Erro ao resetar usuário:", e);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
