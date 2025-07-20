import "dotenv/config";
import "@/i18n";

import config from "config";
import * as fs from "fs";
import http from "http";
import https from "https";
import express from "express";
import cors from "cors";
import serveStatic from "serve-static";
import path from "path";

import {GameServer} from "@/GameServer/GameServer";
import authRoutes from "@/Auth/AuthRoutes";
import roomRoutes from "@/GameServer/RoomRoutes";
import gameRoutes from "@/GameServer/GameRoutes";
import { setGameServerInstance } from "@/GameServer/RoomRoutes";

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/game-modes', (req, res) => {
    const { getAllGameModes } = require('@/GameServer/GameModes');
    res.json({ gameModes: getAllGameModes() });
});

// Serve static files
if (config.get<boolean>("server.static")) {
    app.use(serveStatic("public", {
        index: ["index.html"],
    }));
    
    // For SPA routing - serve index.html for any non-API routes
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.resolve('public', 'index.html'));
        } else {
            res.status(404).json({ error: 'API endpoint not found' });
        }
    });
}

// Create HTTP/HTTPS server
let server: http.Server | https.Server;

if (config.get<boolean>("server.https")) {
    const options = {
        key: fs.readFileSync(config.get<string>("server.key")),
        cert: fs.readFileSync(config.get<string>("server.cert")),
    };

    server = https.createServer(options, app);
} else {
    server = http.createServer(app);
}

// Initialize game server
const gameServer = new GameServer(server);

// Set the game server instance for the room routes
setGameServerInstance(gameServer);

// Start server
const port = process.env.PORT ? parseInt(process.env.PORT) : config.get<number>("server.port");
server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
