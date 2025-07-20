# ChessNowBot Server

This is the server component of the ChessNowBot application, a real-time chess game platform.

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v16+)
- PostgreSQL (v14+)
- Docker and Docker Compose (optional, for running PostgreSQL)

## Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/ChessNowBot.git
cd ChessNowBot/server
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up the database**

You can either use a local PostgreSQL installation or use Docker:

```bash
# Start PostgreSQL using Docker
cd ..
docker-compose up -d
cd server
```

4. **Configure environment variables**

Create a `.env` file in the server directory with the following content:

```
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chessnow?schema=public"

# JWT Secret for authentication
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
```

5. **Generate Prisma client**

```bash
npm run prisma:generate
```

6. **Run database migrations**

```bash
npm run prisma:migrate
```

7. **Seed the database (optional)**

```bash
npm run prisma:seed
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user profile

### Games

- `GET /api/games/modes` - Get all game modes
- `GET /api/games/modes/:id` - Get a specific game mode
- `GET /api/games/user/games` - Get all games for the authenticated user
- `GET /api/games/user/games/active` - Get active games for the authenticated user
- `GET /api/games/user/games/completed` - Get completed games for the authenticated user
- `GET /api/games/:id` - Get a specific game
- `GET /api/games/user/stats` - Get user statistics

### Rooms

- `POST /api/rooms` - Create a new game room

## Database Schema

### UserProfile

- `id`: Integer (Primary Key)
- `email`: String (Unique)
- `password`: String (Hashed)
- `fullName`: String
- `username`: String (Optional, Unique)
- `verified`: Boolean
- `avatarURL`: String (Optional)
- `lastLogin`: DateTime (Optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### PlayedGame

- `id`: String (Primary Key)
- `timerEnabled`: Boolean
- `timerInit`: Integer
- `timerIncrement`: Integer
- `pgn`: String
- `resolution`: String
- `winner`: String (Optional)
- `whitePlayerID`: Integer (Foreign Key)
- `blackPlayerID`: Integer (Foreign Key)
- `gameMode`: String (Optional)
- `createdAt`: DateTime

## License

This project is licensed under the MIT License - see the LICENSE file for details.