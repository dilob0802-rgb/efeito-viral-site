import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Iniciando diagnóstico de Banco de Dados...");
  try {
    // Tenta uma operação simples
    const userCount = await prisma.user.count();
    console.log("✅ Conexão com Banco de Dados: OK");
    console.log(`📊 Total de usuários encontrados: ${userCount}`);
    
    const firstUser = await prisma.user.findFirst({
        select: { email: true, youtubeChannelId: true }
    });
    console.log("👤 Teste de leitura de usuário: OK");
    console.log("📧 E-mail do primeiro usuário:", firstUser?.email || "Nenhum usuário");
    console.log("🆔 Channel ID:", firstUser?.youtubeChannelId || "Não conectado");

  } catch (error: any) {
    console.error("❌ ERRO DE CONEXÃO COM O BANCO:");
    console.error("Mensagem:", error.message);
    console.error("Código:", error.code);
  } finally {
    await prisma.$disconnect();
  }
}

main();
