import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Habilitar extensão pgcrypto (opcional, dependendo do uso de UUID)
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    console.log('Extensão "pgcrypto" verificada/criada com sucesso.');
  } catch (error) {
    console.warn('Não foi possível criar a extensão pgcrypto. Verifique permissões ou crie manualmente.');
  }

  const senhaCriptografada = await bcrypt.hash('admin123', 10);

  // Criação de usuário admin padrão
  const admin = await prisma.user.upsert({
    where: { email: 'admin@exemplo.com' },
    update: {},
    create: {
      username: 'admin',
      fullName: 'System Administrator',
      email: 'admin@exemplo.com',
      role: '0', // 0 = Admin
      status: 'A',
      passwords: {
        create: {
          passwordHash: senhaCriptografada,
          isTemp: false
        }
      }
    },
  });

  console.log('Usuário admin criado (ou já existia):', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
