import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleMovies = [
  { title: 'Avengers: Endgame', price: 250, seatsAvailable: 80 },
  { title: 'Interstellar', price: 220, seatsAvailable: 60 },
  { title: 'Inception', price: 200, seatsAvailable: 50 },
  { title: 'The Dark Knight', price: 230, seatsAvailable: 70 },
  { title: 'Dune: Part Two', price: 280, seatsAvailable: 90 },
];

async function main() {
  for (const movie of sampleMovies) {
    await prisma.movie.upsert({
      where: { title: movie.title },
      update: movie,
      create: movie,
    });
  }

  console.log('Seed completed with sample movies.');
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
