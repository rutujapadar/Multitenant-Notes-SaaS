// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  const acme = await prisma.tenant.upsert({
    where: { slug: 'acme' },
    update: {},
    create: { name: 'Acme', slug: 'acme', plan: 'FREE' }
  });

  const globex = await prisma.tenant.upsert({
    where: { slug: 'globex' },
    update: {},
    create: { name: 'Globex', slug: 'globex', plan: 'FREE' }
  });

  const pw = await bcrypt.hash('password', 10);

  const users = [
    { email: 'admin@acme.test', role: 'ADMIN', tenantId: acme.id },
    { email: 'user@acme.test', role: 'MEMBER', tenantId: acme.id },
    { email: 'admin@globex.test', role: 'ADMIN', tenantId: globex.id },
    { email: 'user@globex.test', role: 'MEMBER', tenantId: globex.id }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: pw,
        role: u.role,
        tenantId: u.tenantId
      }
    });
  }

  // optionally add 1 note per tenant for demonstration
  await prisma.note.createMany({
    data: [
      { title: 'Welcome (Acme)', content: 'This is Acme note 1', tenantId: acme.id },
      { title: 'Welcome (Globex)', content: 'This is Globex note 1', tenantId: globex.id }
    ]
  });

  console.log('Seeding done.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
