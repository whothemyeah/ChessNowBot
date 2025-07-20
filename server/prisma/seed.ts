import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test users
  const password = await bcrypt.hash('password123', 10);

  const user1 = await prisma.userProfile.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      password,
      fullName: 'Test User 1',
      username: 'testuser1',
      verified: true,
      lastLogin: new Date(),
    },
  });

  const user2 = await prisma.userProfile.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      password,
      fullName: 'Test User 2',
      username: 'testuser2',
      verified: true,
      lastLogin: new Date(),
    },
  });

  console.log('Created users:', { user1, user2 });

  // Create some test games
  const game1 = await prisma.playedGame.upsert({
    where: { id: 'game1' },
    update: {},
    create: {
      id: 'game1',
      timerEnabled: true,
      timerInit: 300,
      timerIncrement: 2,
      pgn: '',
      resolution: 'in-progress',
      whitePlayerID: user1.id,
      blackPlayerID: user2.id,
      gameMode: 'blitz',
    },
  });

  const game2 = await prisma.playedGame.upsert({
    where: { id: 'game2' },
    update: {},
    create: {
      id: 'game2',
      timerEnabled: true,
      timerInit: 600,
      timerIncrement: 5,
      pgn: 'e4 e5 Nf3 Nc6 Bb5',
      resolution: 'checkmate',
      winner: 'white',
      whitePlayerID: user1.id,
      blackPlayerID: user2.id,
      gameMode: 'rapid',
    },
  });

  console.log('Created games:', { game1, game2 });

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });