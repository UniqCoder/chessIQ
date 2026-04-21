#ifndef GAME_H
#define GAME_H

#include "board.h"
#include <string>

enum class GameState {
    IN_PROGRESS,
    WHITE_WON_CHECKMATE,
    BLACK_WON_CHECKMATE,
    WHITE_WON_RESIGNATION,
    BLACK_WON_RESIGNATION,
    DRAW_STALEMATE,
    DRAW_AGREEMENT,
    DRAW_FIFTY_MOVE,
    DRAW_REPETITION,
    DRAW_INSUFFICIENT_MATERIAL
};

class Game {
private:
    Board board;
    GameState state;

public:
    Game();
    void reset();
    bool applyMove(int fromRow, int fromCol, int toRow, int toCol, int promotion = EMPTY);
    bool applyMoveAlgebraic(const std::string& algebraic);
    
    std::string getBoardFEN() const;
    GameState getGameState() const;
    std::string getGameStateString() const;
    bool isWhiteTurn() const;
    
    void resign(bool isWhiteResigning);
    void agreeDraw();

    // Utility
    std::string generateLegalMovesJSON() const;
};

#endif // GAME_H
