import config from "config";
import debug from "debug";
import http from "http";
import https from "https";
import * as SocketIO from "socket.io";

import {authController} from "@/Auth/AuthController";
import {authenticateSocket} from "@/Auth/AuthMiddleware";
import {UserProfile} from "@/GameServer/Database";
import {AuthPayload, ClientToServerEvents, GameRules, ServerToClientEvents, User} from "@/GameServer/DataModel";
import {AuthError, RoomNotFoundError} from "@/GameServer/Errors";
import {ServerRoom} from "@/GameServer/ServerRoom";
import {catchErrors} from "@/GameServer/SocketErrorHandler";

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
    Record<string, never>
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

        // Use our authentication middleware
        // this.io.use(authenticateSocket);

        this.io.on("connect", (socket: Socket) => {
            catchErrors(socket)(this.handleConnection)(socket);
        });

        log("GameServer instance was created");

        if (config.get<boolean>("gameServer.fakeRoom.create")) {
            const id = config.get<string>("gameServer.fakeRoom.id");
            const host = config.get<User>("gameServer.fakeRoom.host");
            const fakeRoomGameRules = config.get<GameRules>("gameServer.fakeRoom.gameRules");

            this.createRoom(host, fakeRoomGameRules, id);
            log('Fake room("%s") was created', id);
        }
    }

    public get roomCount(): number {
        return Object.keys(this.rooms).length;
    }

    public createRoom = (host: User, gameRules: GameRules, id?: string): ServerRoom => {
        const room = new ServerRoom(host, gameRules, id);
        this.rooms[room.id] = room;
        room.on("destroy", () => {
            this.handleRoomDestroy(room.id);
        });
        return room;
    };

    private handleRoomDestroy = async (roomID: string) => {
        delete this.rooms[roomID];
        log('Room("%s") was destroyed', roomID);
    };

    private handleConnection = async (socket: Socket) => {
        log("New connection");

        const authPayload = socket.handshake.auth as AuthPayload;
        const roomID = authPayload.roomId;

        if (!roomID) {
            throw new AuthError('Room ID not provided');
        }

        if (!this.rooms[roomID]) {
            throw new RoomNotFoundError(`Room with id "${roomID}" was not found`);
        }

        // Get user ID from socket data (set by authenticateSocket middleware)
        const userId = socket.data.userId;
        
        // Get user from database
        const userProfile = await UserProfile.findByPk(userId);
        if (!userProfile) {
            throw new AuthError("User not found");
        }

        const user: User = {
            id: userProfile.id,
            email: userProfile.email,
            fullName: userProfile.fullName,
            username: userProfile.username || undefined,
            avatarURL: userProfile.avatarURL || undefined,
        };

        log("User(%d: %s) trying to connect to room %s", user.id, user.fullName, roomID);

        if (socket.connected) {
            this.rooms[roomID].acceptConnection(socket, user);
        }
    };
}
