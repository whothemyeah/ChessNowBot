# Chess Now Web Application

Chess Now is a web-based chess application that allows users to play chess games online. This application was originally built as a Telegram Mini App and has been converted to a standalone web application using Next.js.

## Features

- User authentication with email/password
- Create and join chess games
- Real-time gameplay with Socket.IO
- Customizable game settings (time controls, preferred color)
- User profiles
- Responsive design for desktop and mobile

## Technology Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS, Material UI, Socket.io Client
- **Backend**: Node.js, Express, Socket.io, Sequelize (SQLite)
- **Authentication**: JWT (JSON Web Tokens)
- **Chess Logic**: chess.js
- **Chess Board UI**: react-chessboard

## Project Structure

- `/client` - Next.js frontend application
  - `/src/app` - Next.js app router pages
  - `/src/components` - React components
    - `/game` - Game-related components
  - `/src/lib` - Utility functions and hooks
    - `/auth` - Authentication utilities
    - `/game-client` - Game client logic and WebSocket communication

- `/server` - Node.js backend application
  - `/src/Auth` - Authentication controllers and middleware
  - `/src/GameServer` - Game server logic and WebSocket handling
  - `/src/config` - Application configuration

## Getting Started

### Prerequisites

- Node.js (v18.17 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/chess-now.git
   cd chess-now
   ```

2. Install server dependencies
   ```
   cd server
   npm install
   ```

3. Install client dependencies
   ```
   cd ../client
   npm install
   ```

### Configuration

1. Create a `.env` file in the server directory with the following variables:
   ```
   JWT_SECRET=your_jwt_secret_key
   PORT=8080
   ```

2. Create a `.env.local` file in the client directory with the following variables:
   ```
   NEXT_PUBLIC_SERVER_URL=http://localhost:8080
   ```

### Running the Application

1. Start the server
   ```
   cd server
   npm run dev
   ```

2. Start the client
   ```
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Authentication Flow

1. User registers with email, password, and optional username
2. User logs in with email and password
3. Server issues a JWT token
4. Client stores the token in localStorage
5. Token is used for API requests and WebSocket authentication

## Game Flow

1. User creates a game with custom settings
2. System generates a unique room ID
3. Creator shares the room ID with an opponent
4. Opponent joins the game using the room ID
5. Game starts when both players are connected
6. Players make moves in real-time
7. Game ends when checkmate, stalemate, or time runs out

## Deployment

The application can be deployed to any platform that supports Next.js applications, such as Vercel, Netlify, or a custom server.

### Build for Production

```bash
# Build the client
cd client
npm run build

# Build the server
cd ../server
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Original Project

This project was originally developed as a Telegram Mini App called ChessNowBot. The original version won first place in the Telegram Mini App Contest. The original README with setup instructions for the Telegram version can be found in README.original.md.