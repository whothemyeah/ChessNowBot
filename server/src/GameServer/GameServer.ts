import config from "config";
import debug from "debug";
import http from "http";
import https from "https";
import * as SocketIO from "socket.io";

import { authController } from "@/Auth/PrismaAuthController";
import { prisma } from "@/lib/prisma";
import { AuthPayload, ClientToServerEvents, GameRules, ServerToClientEvents, User } from "@/GameServer/DataModel";
import { AuthError, RoomNotFoundError } from "@/GameServer/Errors";
import { ServerRoom } from "@/GameServer/ServerRoom";
import { catchErrors } from "@/GameServer/SocketErrorHandler";

const log = debug("GameServer");

export type Server = SocketIO.Server<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    Record<string, never>
>;
export type Socket = SocketIO.Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    {
        userId?: number;
    }
>;

export class GameServer {
    private readonly io: Server;

    private readonly rooms: {[key: string]: ServerRoom};

    private readonly validateInitData: boolean;

    constructor(server?: http.Server | https.Server) {
        this.io = new SocketIO.Server(server, {
            cors: {
                origin: "*",
            },
            pingInterval: 2000,
            pingTimeout: 2000,
            transports: ["polling", "websocket"],
        });

        this.rooms = {};

        this.validateInitData = false; // No longer using Telegram validation

        this.io.on("connection", this.handleConnection.bind(this));
    }

    /**
     * Handle new socket connection
     */
    private async handleConnection(socket: Socket) {
        log("New connection: %s", socket.id);

        // Authenticate the connection
        socket.on(
            "auth",
            catchErrors(socket, async (payload: AuthPayload) => {
                try {
                    // Verify the JWT token
                    const tokenPayload = authController.verifyToken(payload.token);
                    
                    // Get user from database
                    const user = await prisma.userProfile.findUnique({
                        where: { id: tokenPayload.userId }
                    });
                    
                    if (!user) {
                        throw new AuthError("User not found");
                    }

                    // Store user ID in socket data
                    socket.data.userId = user.id;

                    // Send auth success event
                    socket.emit("auth:success", {
                        id: user.id,
                        fullName: user.fullName,
                        username: user.username || undefined,
                        avatarURL: user.avatarURL || undefined,
                    });

                    // Set up event handlers for authenticated socket
                    this.setupAuthenticatedSocket(socket);
                } catch (error) {
                    if (error instanceof AuthError) {
                        socket.emit("auth:error", { message: error.message });
                    } else {
                        throw error;
                    }
                }
            })
        );
    }

    /**
     * Set up event handlers for authenticated socket
     */
    private setupAuthenticatedSocket(socket: Socket) {
        // Join room
        socket.on(
            "room:join",
            catchErrors(socket, async (roomId: string) => {
                const room = this.rooms[roomId];
                if (!room) {
                    throw new RoomNotFoundError(roomId);
                }

                // Get user from database
                const user = await prisma.userProfile.findUnique({
                    where: { id: socket.data.userId! }
                });
                
                if (!user) {
                    throw new AuthError("User not found");
                }

                // Join the room
                const userModel: User = {
                    id: user.id,
                    fullName: user.fullName,
                    username: user.username || undefined,
                    avatarURL: user.avatarURL || undefined,
                };
                
                await room.join(socket, userModel);
            })
        );

        // Create room
        socket.on(
            "room:create",
            catchErrors(socket, async (rules: GameRules) => {
                // Get user from database
                const user = await prisma.userProfile.findUnique({
                    where: { id: socket.data.userId! }
                });
                
                if (!user) {
                    throw new AuthError("User not found");
                }

                // Create user model
                const userModel: User = {
                    id: user.id,
                    fullName: user.fullName,
                    username: user.username || undefined,
                    avatarURL: user.avatarURL || undefined,
                };

                // Create the room
                const room = new ServerRoom(this.io, rules);
                this.rooms[room.id] = room;

                // Join the room
                await room.join(socket, userModel);

                // Return room ID
                socket.emit("room:created", room.id);
            })
        );

        // Disconnect handler
        socket.on("disconnect", () => {
            log("Socket disconnected: %s", socket.id);
        });
    }

    /**
     * Get a room by ID
     */
    public getRoom(roomId: string): ServerRoom | undefined {
        return this.rooms[roomId];
    }

    /**
     * Create a new room with the given rules
     */
    public createRoom(rules: GameRules): ServerRoom {
        const room = new ServerRoom(this.io, rules);
        this.rooms[room.id] = room;
        return room;
    }

    /**
     * Delete a room
     */
    public deleteRoom(roomId: string): void {
        delete this.rooms[roomId];
    }
}