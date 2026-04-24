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
  isFlipped?: boolean;
  lastMove?: Move | null;
}

export default function ChessBoard({ fen, onMove, legalMoves, isWhiteTurn, status, isFlipped = false, lastMove }: ChessBoardProps) {
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
        const finalMove = move.promotion !== 0 ? { ...move, promotion: 5 } : move;
        onMove(finalMove);
        setSelectedSquare(null);
      } else {
        const piece = board[r][c];
        if (piece && ((isWhiteTurn && piece === piece.toUpperCase()) || (!isWhiteTurn && piece === piece.toLowerCase()))) {
          setSelectedSquare({ r, c });
        } else {
          setSelectedSquare(null);
        }
      }
    } else {
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

  const rowIndices = [0, 1, 2, 3, 4, 5, 6, 7];
  const colIndices = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="w-full max-w-[600px] aspect-square rounded-lg overflow-hidden border border-white/10 shadow-2xl relative">
      <motion.div 
        animate={{ rotate: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="grid grid-cols-8 grid-rows-8 w-full h-full"
      >
        {rowIndices.map((r) => 
          colIndices.map((c) => {
            const piece = board[r]?.[c] || '';
            const isDark = (r + c) % 2 === 1;
            const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;
            const isLegalDest = isLegalMoveDest(r, c);
            const isLastMove = lastMove && ((lastMove.fromRow === r && lastMove.fromCol === c) || (lastMove.toRow === r && lastMove.toCol === c));
            const highlightClass = isSelected ? 'bg-amber-500/50' : isLastMove ? 'bg-amber-500/30' : '';
            
            return (
              <div 
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`
                  relative flex items-center justify-center cursor-pointer select-none
                  ${isDark ? 'chess-square-dark' : 'chess-square-light'}
                  ${highlightClass}
                `}
              >
                {/* Coordinates */}
                {(isFlipped ? c === 7 : c === 0) && (
                  <span className={`absolute top-0.5 left-0.5 text-[10px] font-bold ${isDark ? 'text-[var(--color-board-light)]' : 'text-[var(--color-board-dark)]'} ${isFlipped ? 'rotate-180' : ''}`}>
                    {8 - r}
                  </span>
                )}
                {(isFlipped ? r === 0 : r === 7) && (
                  <span className={`absolute bottom-0.5 right-0.5 text-[10px] font-bold ${isDark ? 'text-[var(--color-board-light)]' : 'text-[var(--color-board-dark)]'} ${isFlipped ? 'rotate-180' : ''}`}>
                    {String.fromCharCode(97 + c)}
                  </span>
                )}

                {/* Legal move indicator */}
                {isLegalDest && (
                  <div className={`absolute rounded-full bg-black/20 z-10 ${piece ? 'w-12 h-12 border-[6px] border-black/20 bg-transparent' : 'w-5 h-5'}`} />
                )}
                
                {/* Piece */}
                {piece && (
                  <motion.div 
                    animate={{ rotate: isFlipped ? -180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
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
      </motion.div>
    </div>
  );
}
