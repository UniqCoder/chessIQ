#ifndef BOARD_H
#define BOARD_H

#include <string>
#include "stack.h"

// Piece definitions
const int EMPTY = 0;
const int PAWN = 1;
const int KNIGHT = 2;
const int BISHOP = 3;
const int ROOK = 4;
const int QUEEN = 5;
const int KING = 6;

const int WHITE = 8;
const int BLACK = 16;

struct Move {
    int fromRow;
    int fromCol;
    int toRow;
    int toCol;
    int movedPiece;
    int capturedPiece;
    int promotion;
    bool isEnPassant;
    bool isCastling;

    Move() : fromRow(-1), fromCol(-1), toRow(-1), toCol(-1), 
             movedPiece(EMPTY), capturedPiece(EMPTY), promotion(EMPTY), 
             isEnPassant(false), isCastling(false) {}
             
    Move(int fr, int fc, int tr, int tc, int mp, int cp = EMPTY, int promo = EMPTY, bool ep = false, bool cstl = false)
        : fromRow(fr), fromCol(fc), toRow(tr), toCol(tc), 
          movedPiece(mp), capturedPiece(cp), promotion(promo), 
          isEnPassant(ep), isCastling(cstl) {}
};

class Board {
public:
    int squares[8][8];
    bool whiteCanCastleKingside;
    bool whiteCanCastleQueenside;
    bool blackCanCastleKingside;
    bool blackCanCastleQueenside;
    int enPassantCol; // -1 if none
    int halfMoveClock;
    int fullMoveNumber;
    bool isWhiteTurn;

    CustomStack<Move> moveHistory;

    Board();
    void reset();
    void loadFEN(const std::string& fen);
    std::string getFEN() const;

    bool isLegalMove(const Move& move) const;
    bool makeMove(const Move& move);
    void unmakeMove(const Move& move);
    
    // Core game state
    bool isCheck(int side) const;
    bool isCheckmate(int side);
    bool isStalemate(int side);

    // Helpers
    int getPiece(int row, int col) const { return squares[row][col]; }
    void setPiece(int row, int col, int piece) { squares[row][col] = piece; }

private:
    bool isPseudoLegalMove(const Move& move) const;
    bool isSquareAttacked(int row, int col, int attackingSide) const;
    void generatePseudoLegalMoves(int side, CustomStack<Move>& moves) const;
};

#endif // BOARD_H
