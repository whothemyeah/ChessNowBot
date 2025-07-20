"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/generated/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new prisma_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Seeding database...');
        // Create test users
        const password = yield bcrypt_1.default.hash('password123', 10);
        const user1 = yield prisma.userProfile.upsert({
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
        const user2 = yield prisma.userProfile.upsert({
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
        const game1 = yield prisma.playedGame.upsert({
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
        const game2 = yield prisma.playedGame.upsert({
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
    });
}
main()
    .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
