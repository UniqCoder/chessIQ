"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Premium SVG piece mapping
const pieceImages: Record<string, string> = {
  'p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  'n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  'b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  'r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  'q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  'k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
  'P': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  'N': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  'B': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  'R': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  'Q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  'K': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg'
};

interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  promotion: number;
}

interface ChessBoardProps {
  fen: string;
  onMove: (move: Move) => void;
  legalMoves: Move[];
  isWhiteTurn: boolean;
  status: string;
}

export default function ChessBoard({ fen, onMove, legalMoves, isWhiteTurn, status }: ChessBoardProps) {
  const [board, setBoard] = useState<string[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<{r: number, c: number} | null>(null);

  useEffect(() => {
    // Parse FEN
    const fenBoard = fen.split(' ')[0];
    const rows = fenBoard.split('/');
    const newBoard: string[][] = [];
    
    for (let r = 0; r < 8; r++) {
      const row: string[] = [];
      for (let i = 0; i < rows[r].length; i++) {
        const char = rows[r][i];
        if (!isNaN(parseInt(char))) {
          const emptyCount = parseInt(char);
          for (let j = 0; j < emptyCount; j++) row.push('');
        } else {
          row.push(char);
        }
      }
      newBoard.push(row);
    }
    setBoard(newBoard);
  }, [fen]);

  const handleSquareClick = (r: number, c: number) => {
    if (status !== 'in_progress') return;

    if (selectedSquare) {
      // Try to move
      const move = legalMoves.find(m => 
        m.fromRow === selectedSquare.r && 
        m.fromCol === selectedSquare.c && 
        m.toRow === r && 
        m.toCol === c
      );

      if (move) {
        // If promotion is possible (pawn reaching end), we should theoretically show UI.
        // For MVP, if multiple moves exist with same coords but different promotions, auto-queen (5).
        const finalMove = move.promotion !== 0 ? { ...move, promotion: 5 } : move;
        onMove(finalMove);
        setSelectedSquare(null);
      } else {
        // Change selection if clicked on own piece
        const piece = board[r][c];
        if (piece && ((isWhiteTurn && piece === piece.toUpperCase()) || (!isWhiteTurn && piece === piece.toLowerCase()))) {
          setSelectedSquare({ r, c });
        } else {
          setSelectedSquare(null);
        }
      }
    } else {
      // Select
      const piece = board[r][c];
      if (piece && ((isWhiteTurn && piece === piece.toUpperCase()) || (!isWhiteTurn && piece === piece.toLowerCase()))) {
        setSelectedSquare({ r, c });
      }
    }
  };

  const isLegalMoveDest = (r: number, c: number) => {
    if (!selectedSquare) return false;
    return legalMoves.some(m => 
      m.fromRow === selectedSquare.r && 
      m.fromCol === selectedSquare.c && 
      m.toRow === r && 
      m.toCol === c
    );
  };

  return (
    <div className="w-full max-w-[600px] aspect-square rounded-lg overflow-hidden border-4 border-[#171717] shadow-2xl relative">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {board.map((row, r) => 
          row.map((piece, c) => {
            const isDark = (r + c) % 2 === 1;
            const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;
            const isLegalDest = isLegalMoveDest(r, c);
            
            return (
              <div 
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`
                  relative flex items-center justify-center cursor-pointer select-none
                  ${isDark ? 'chess-square-dark' : 'chess-square-light'}
                  ${isSelected ? 'bg-yellow-500/40' : ''}
                `}
              >
                {/* Legal move indicator */}
                {isLegalDest && (
                  <div className="absolute w-4 h-4 rounded-full bg-yellow-500/50 z-10" />
                )}
                
                {/* Piece */}
                {piece && (
                  <motion.div 
                    layoutId={`piece-${piece}-${r}-${c}`}
                    className="w-full h-full p-[10%] z-20 flex items-center justify-center pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
                  >
                    <img 
                      src={pieceImages[piece]} 
                      alt={piece} 
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  </motion.div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Pass and Play Overlay */}
      {/* Could add a state for turn transition overlay here */}
    </div>
  );
}
