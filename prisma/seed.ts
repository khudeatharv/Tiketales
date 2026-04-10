import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_USERNAME = 'atharv1441';
const ADMIN_EMAIL = 'atharv1441@admin.com';
const ADMIN_PASSWORD = 'admin123';

const sampleMovies = [
  { title: 'Avengers: Endgame', price: 250, seatsAvailable: 80 },
  { title: 'Interstellar', price: 220, seatsAvailable: 60 },
  { title: 'Inception', price: 200, seatsAvailable: 50 },
  { title: 'The Dark Knight', price: 230, seatsAvailable: 70 },
  { title: 'Dune: Part Two', price: 280, seatsAvailable: 90 },
];

async function seedAdmin() {
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: ADMIN_USERNAME,
      password,
      role: 'admin',
      status: 'approved',
    },
    create: {
      name: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password,
      role: 'admin',
      status: 'approved',
    },
  });
}

async function seedMovies() {
  for (const movie of sampleMovies) {
    await prisma.movie.upsert({
      where: { title: movie.title },
      update: movie,
      create: movie,
    });
  }
}

async function main() {
  await seedAdmin();
  await seedMovies();
  console.log(`Seed completed. Admin username: ${ADMIN_USERNAME}, password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
