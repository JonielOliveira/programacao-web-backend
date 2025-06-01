import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config(); //Carrega o .env automaticamente

const prisma = new PrismaClient();

async function main() {
  // Habilitar extensão pgcrypto (uso de UUID)
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    console.log('Extensão "pgcrypto" verificada/criada com sucesso.');
  } catch (error) {
    console.warn('Não foi possível criar a extensão pgcrypto. Verifique permissões ou crie manualmente.');
  }

  const {
    ADMIN_USERNAME,
    ADMIN_FULLNAME,
    ADMIN_EMAIL,
    ADMIN_PASSWORD
  } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_FULLNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Variáveis de ambiente do administrador não estão definidas corretamente no .env.');
  }

  const senhaCriptografada = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Criação de usuário admin padrão
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      username: ADMIN_USERNAME,
      fullName: ADMIN_FULLNAME,
      email: ADMIN_EMAIL,
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
