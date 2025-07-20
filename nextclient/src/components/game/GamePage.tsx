'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Chessboard } from 'react-chessboard';
import { ClientRoom, GameClient, PossibleMove } from '@/lib/game-client/GameClient';
import { Color, GameStatus, Move, PieceSymbol, Square } from '@/lib/game-client/DataModel';
import PlayerBar from './PlayerBar';
import GameControlPanel from './GameControlPanel';
import GameResultPopup from './GameResultPopup';

interface GamePageProps {
  room: ClientRoom;
  makingMove: boolean;
  gameClient: GameClient;
}

const GamePage: React.FC<GamePageProps> = ({ room, makingMove, gameClient }) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<PossibleMove[]>([]);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ from: Square; to: Square } | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Set board orientation based on player color
  useEffect(() => {
    if (room.me.state.isPlayer && room.me.state.color) {
      setBoardOrientation(room.me.state.color === Color.White ? 'white' : 'black');
    }
  }, [room.me.state.isPlayer, room.me.state.color]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate board size based on window dimensions
  const getBoardSize = () => {
    const maxWidth = windowSize.width > 600 ? 600 : windowSize.width - 32;
    const maxHeight = windowSize.height - 300; // Account for headers, player bars, etc.
    return Math.min(maxWidth, maxHeight);
  };

  const handleSquareClick = (square: Square) => {
    // If we're waiting for a move to be processed, ignore clicks
    if (makingMove) return;

    // If game is finished, ignore clicks
    if (room.gameState.status === GameStatus.Finished) return;

    // If it's not our turn, ignore clicks
    if (
      room.me.state.isPlayer &&
      room.me.state.color !== room.gameState.turn
    ) return;

    // If we're not a player, ignore clicks
    if (!room.me.state.isPlayer) return;

    // If we already have a square selected
    if (selectedSquare) {
      // Check if the clicked square is a valid move
      const move = possibleMoves.find(m => m.to === square);
      
      if (move) {
        if (move.promotion) {
          // Handle promotion
          setPendingMove({ from: selectedSquare, to: square });
          setShowPromotionDialog(true);
        } else {
          // Make the move
          gameClient.makeMove({
            from: selectedSquare,
            to: square,
          });
        }
      }
      
      // Clear selection
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      // Check if the square has one of our pieces
      const pieceColor = gameClient.getPieceColor(square as Square);
      
      if (pieceColor === room.me.state.color) {
        // Select the square and get possible moves
        setSelectedSquare(square as Square);
        setPossibleMoves(gameClient.getPossibleMoves(square as Square));
      }
    }
  };

  const handlePromotionSelect = (piece: PieceSymbol) => {
    if (pendingMove) {
      gameClient.makeMove({
        from: pendingMove.from,
        to: pendingMove.to,
        promotion: piece,
      });
      
      setPendingMove(null);
      setShowPromotionDialog(false);
    }
  };

  const handleGiveUp = () => {
    if (window.confirm('Are you sure you want to give up?')) {
      gameClient.giveUp();
    }
  };

  // Custom pieces with highlights for selected square and possible moves
  const customPieces = () => {
    const pieces: Record<string, React.ReactNode> = {};
    
    // Highlight the selected square
    if (selectedSquare) {
      pieces[selectedSquare] = (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 0, 0.4)',
            borderRadius: '50%',
            zIndex: 1,
          }}
        />
      );
    }
    
    // Highlight possible moves
    possibleMoves.forEach(move => {
      pieces[move.to] = (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 255, 0, 0.3)',
            borderRadius: '50%',
            zIndex: 1,
          }}
        />
      );
    });
    
    // Highlight the last move
    if (room.gameState.lastMove) {
      const { from, to } = room.gameState.lastMove;
      pieces[from] = (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(173, 216, 230, 0.5)',
            zIndex: 1,
          }}
        />
      );
      pieces[to] = (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(173, 216, 230, 0.5)',
            zIndex: 1,
          }}
        />
      );
    }
    
    // Highlight check
    const checkSquare = gameClient.getCheck();
    if (checkSquare) {
      pieces[checkSquare] = (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 0, 0, 0.4)',
            borderRadius: '50%',
            zIndex: 1,
          }}
        />
      );
    }
    
    return pieces;
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
      {/* Top player bar */}
      <PlayerBar 
        player={boardOrientation === 'white' ? room.blackPlayer : room.whitePlayer}
        isMyTurn={room.gameState.turn === (boardOrientation === 'white' ? Color.Black : Color.White)}
        timer={room.gameState.timer ? (boardOrientation === 'white' ? room.gameState.timer.blackTimeLeft : room.gameState.timer.whiteTimeLeft) : undefined}
      />
      
      {/* Chessboard */}
      <Box sx={{ width: getBoardSize(), height: getBoardSize(), my: 2 }}>
        <Chessboard
          id="chess-board"
          position={room.gameState.fen}
          onSquareClick={handleSquareClick}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
          }}
          customSquareStyles={{}}
          customPieces={customPieces()}
          boardOrientation={boardOrientation}
        />
      </Box>
      
      {/* Bottom player bar */}
      <PlayerBar 
        player={boardOrientation === 'white' ? room.whitePlayer : room.blackPlayer}
        isMyTurn={room.gameState.turn === (boardOrientation === 'white' ? Color.White : Color.Black)}
        timer={room.gameState.timer ? (boardOrientation === 'white' ? room.gameState.timer.whiteTimeLeft : room.gameState.timer.blackTimeLeft) : undefined}
      />
      
      {/* Game controls */}
      <GameControlPanel 
        isMyTurn={room.me.state.isPlayer && room.me.state.color === room.gameState.turn}
        canGiveUp={room.me.state.isPlayer && room.gameState.status === GameStatus.InProgress}
        onGiveUp={handleGiveUp}
        gameStatus={room.gameState.status}
      />
      
      {/* Promotion dialog */}
      <Dialog open={showPromotionDialog} onClose={() => setShowPromotionDialog(false)}>
        <DialogTitle>Choose Promotion Piece</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select the piece you want to promote your pawn to:
          </DialogContentText>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
            <Button onClick={() => handlePromotionSelect(PieceSymbol.Queen)}>Queen</Button>
            <Button onClick={() => handlePromotionSelect(PieceSymbol.Rook)}>Rook</Button>
            <Button onClick={() => handlePromotionSelect(PieceSymbol.Bishop)}>Bishop</Button>
            <Button onClick={() => handlePromotionSelect(PieceSymbol.Knight)}>Knight</Button>
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Game result popup */}
      {room.gameState.status === GameStatus.Finished && (
        <GameResultPopup 
          resolution={room.gameState.resolution!}
          winner={room.gameState.winner}
          myUser={room.me.user}
        />
      )}
    </Box>
  );
};

export default GamePage;