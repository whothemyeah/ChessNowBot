"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { GameStatus } from "@/lib/game-client/DataModel";
import { ClientState, GameClient } from "@/lib/game-client/GameClient";
import { useAuth } from "@/lib/auth/auth-context";

// We'll create these components later
import ConnectingPage from "@/components/game/ConnectingPage";
import ErrorPage from "@/components/game/ErrorPage";
import WaitingPage from "@/components/game/WaitingPage";
import GamePage from "@/components/game/GamePage";

export default function GameRoom({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const { token } = useAuth();
  const [client, setClient] = useState<GameClient | null>(null);
  const [clientState, setClientState] = useState<ClientState | null>(null);
  const [moveSound, setMoveSound] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio("/audio/move.wav");
    setMoveSound(audio);

    return () => {
      // Clean up audio
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!roomId || !token) {
      router.push("/dashboard");
      return;
    }

    const gameClient = new GameClient(token, roomId);
    setClient(gameClient);

    const handleAnyUpdate = (state: ClientState) => {
      setClientState({ ...state });
    };

    const handleMove = () => {
      if (moveSound) {
        moveSound
          .play()
          .catch((err) => console.error("Error playing sound:", err));
      }
    };

    gameClient.on("anyUpdate", handleAnyUpdate);
    gameClient.on("move", handleMove);

    return () => {
      gameClient.off("anyUpdate", handleAnyUpdate);
      gameClient.off("move", handleMove);
      gameClient.disconnect();
    };
  }, [roomId, token, router, moveSound]);

  const handleBack = () => {
    router.push("/dashboard");
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
        <ErrorPage errorName={error.name} errorMessage={error.message} />
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
}
