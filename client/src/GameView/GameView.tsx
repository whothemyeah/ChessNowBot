import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, IconButton, AppBar, Toolbar, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import moveSound from "@/assets/audio/move.wav";
import { GameStatus } from "@/GameClient/DataModel";
import { ClientState, GameClient } from "@/GameClient/GameClient";
import { useAuth } from "@/Auth/AuthContext";

import { ConnectingPage, ErrorPage, GamePage, WaitingPage } from "./pages";

const moveSoundPlayer = new Audio(moveSound);

export const GameView: FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [client, setClient] = useState<GameClient | null>(null);
    const [clientState, setClientState] = useState<ClientState | null>(null);

    useEffect(() => {
        if (!roomId || !token) {
            navigate('/dashboard');
            return;
        }

        const gameClient = new GameClient(token, roomId);
        setClient(gameClient);

        const handleAnyUpdate = (state: ClientState) => {
            setClientState({...state});
        };

        const handleMove = () => {
            moveSoundPlayer.play();
        };

        gameClient.on("anyUpdate", handleAnyUpdate);
        gameClient.on("move", handleMove);

        return () => {
            gameClient.off("anyUpdate", handleAnyUpdate);
            gameClient.off("move", handleMove);
            gameClient.disconnect();
        };
    }, [roomId, token, navigate]);

    const handleBack = () => {
        navigate('/dashboard');
    };

    if (!client || !clientState) {
        return <ConnectingPage />;
    }

    const error = clientState.error;
    const connected = clientState.connected;
    const room = clientState.room;
    const makingMove = clientState.makingMove;

    if (error.isError) {
        return (
            <>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleBack}
                            aria-label="back"
                            sx={{ mr: 2 }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Chess Now
                        </Typography>
                    </Toolbar>
                </AppBar>
                <ErrorPage />
            </>
        );
    }

    if (!connected || !room) {
        return <ConnectingPage />;
    }

    if (room.gameState.status === GameStatus.NotStarted) {
        return (
            <>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleBack}
                            aria-label="back"
                            sx={{ mr: 2 }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Waiting for Opponent
                        </Typography>
                    </Toolbar>
                </AppBar>
                <WaitingPage room={room} />
            </>
        );
    }

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleBack}
                        aria-label="back"
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Game in Progress
                    </Typography>
                </Toolbar>
            </AppBar>
            <GamePage room={room} makingMove={makingMove} gameClient={client} />
        </>
    );
};
