# Database Migration: SQLite to PostgreSQL with Prisma

This document outlines the migration process from SQLite with Sequelize ORM to PostgreSQL with Prisma ORM.

## Migration Steps

1. **Install Required Dependencies**
   ```bash
   npm install prisma @prisma/client pg --save
   ```

2. **Initialize Prisma**
   ```bash
   npx prisma init
   ```

3. **Configure Database Connection**
   - Update the `.env` file with PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chessnow?schema=public"
   ```

4. **Create Prisma Schema**
   - Define models in `prisma/schema.prisma` based on existing Sequelize models
   - Models created:
     - UserProfile
     - PlayedGame

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Create Database Migration**
   ```bash
   npx prisma migrate dev --name init
   ```

7. **Create Prisma Client Singleton**
   - Created `src/lib/prisma.ts` for application-wide Prisma client access

8. **Update Authentication System**
   - Created `src/Auth/PrismaAuthController.ts` to replace Sequelize-based auth
   - Created `src/Auth/PrismaAuthMiddleware.ts` for JWT authentication

9. **Create Game Service**
   - Created `src/GameServer/GameService.ts` for game-related operations
   - Implemented predefined game modes (Bullet, Blitz, Rapid, Classical)

10. **Create API Routes**
    - Created `src/routes/authRoutes.ts` for authentication endpoints
    - Created `src/routes/gameRoutes.ts` for game-related endpoints

11. **Update Server Entry Point**
    - Created `src/index.prisma.ts` as the new entry point using Prisma

12. **Add Database Seeding**
    - Created `prisma/seed.ts` for initial data seeding

## Running the Migrated Application

1. **Start PostgreSQL Database**
   ```bash
   # Using Docker
   docker-compose up -d
   ```

2. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

3. **Run Migrations**
   ```bash
   npm run prisma:migrate
   ```

4. **Seed Database (Optional)**
   ```bash
   npm run prisma:seed
   ```

5. **Start the Server**
   ```bash
   npm run dev
   ```

## Benefits of the Migration

1. **Type Safety**: Prisma provides full type safety with generated TypeScript types
2. **Better Schema Management**: Prisma Migrate makes database schema changes safer and more predictable
3. **Production-Ready Database**: PostgreSQL is more suitable for production environments
4. **Improved Query Performance**: PostgreSQL offers better performance for complex queries
5. **Connection Pooling**: Better handling of database connections
6. **Advanced Features**: PostgreSQL supports advanced features like JSON fields, full-text search, etc.

## Next Steps

1. Complete the integration with the existing game server
2. Update the frontend to use the new API endpoints
3. Add comprehensive tests for the new database layer
4. Set up database backups and monitoring