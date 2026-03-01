const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const defaultUsers = [
    { username: 'pelaksana1', password: 'password123', fullName: 'Reta Siska Azzahra', nip: '', role: 'pelaksana_inspeksi' },
    { username: 'pelaksana2', password: 'password123', fullName: 'Zainul', nip: '', role: 'pelaksana_inspeksi' },
    { username: 'kepala1', password: 'password123', fullName: 'Mukhlisin', nip: '19870723 200604 1 001', role: 'kepala_bagian' },
    { username: 'kepala2', password: 'password123', fullName: 'Linda Maya Pebrianti', nip: '', role: 'kepala_bagian' },
  ];

  for (const user of defaultUsers) {
    const existing = await prisma.user.findUnique({ where: { username: user.username } });
    if (!existing) {
      const hash = await bcrypt.hashSync(user.password, 10);
      await prisma.user.create({
        data: {
          username: user.username,
          password: hash,
          fullName: user.fullName,
          nip: user.nip,
          role: user.role,
        },
      });
      console.log(`✅ User '${user.username}' created (${user.role})`);
    } else {
      console.log(`⏭️  User '${user.username}' already exists`);
    }
  }

  await prisma.$disconnect();
  console.log('\n🎉 Seed completed!');
}

main().catch(e => { console.error('❌ Seed failed:', e); process.exit(1); });
