import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = "admin@efeitoviral.com"
  const adminPassword = "senha_mestra_123"

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Lobato',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('-----------------------------------------')
  console.log('✅ Usuário Administrador criado com sucesso!')
  console.log(`📧 E-mail: ${adminEmail}`)
  console.log(`🔑 Senha: ${adminPassword}`)
  console.log('-----------------------------------------')
  console.log('⚠️  Lembre-se de alterar sua senha no futuro.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
