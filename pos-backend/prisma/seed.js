require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const passwordHash = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role: 'SUPER_ADMIN', businessName: 'Super Admin' },
  });
  console.log('Super Admin ready:', email);
  await prisma.$disconnect();
})();
