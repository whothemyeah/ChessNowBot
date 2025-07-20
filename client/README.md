# Chess Now Web App

A standalone web application for playing chess online with friends. Built with Next.js, TypeScript, and Material UI.

## Features

- User authentication with email/password
- Create and join chess games
- Real-time gameplay with Socket.IO
- Customizable game settings (timer, preferred color)
- Responsive design for desktop and mobile
- User profiles

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Material UI
- **State Management**: React Context API
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Chess Logic**: chess.js
- **Chess Board UI**: react-chessboard

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chess-now.git
   cd chess-now/nextclient
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nextclient/
├── public/            # Static assets
│   └── audio/         # Game sound effects
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   │   ├── auth/      # Authentication components
│   │   ├── game/      # Game-related components
│   │   └── ui/        # Reusable UI components
│   └── lib/           # Utility functions and hooks
│       ├── auth/      # Authentication utilities
│       └── game-client/# Game client and data models
├── .env.local         # Environment variables (create this file)
└── next.config.js     # Next.js configuration
```

## Deployment

The application can be deployed to any platform that supports Next.js applications, such as Vercel, Netlify, or a custom server.

### Build for Production

```bash
npm run build
# or
yarn build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
