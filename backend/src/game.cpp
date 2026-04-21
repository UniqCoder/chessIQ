#include "../include/game.h"
#include <iostream>

Game::Game() : state(GameState::IN_PROGRESS) {
    board.reset();
}

void Game::reset() {
    board.reset();
    state = GameState::IN_PROGRESS;
}

bool Game::applyMove(int fromRow, int fromCol, int toRow, int toCol, int promotion) {
    if (state != GameState::IN_PROGRESS) return false;

    int movedPiece = board.getPiece(fromRow, fromCol);
    if (movedPiece == EMPTY) return false;
    
    int side = board.isWhiteTurn ? WHITE : BLACK;
    if ((movedPiece & (WHITE|BLACK)) != side) return false;

    int capturedPiece = board.getPiece(toRow, toCol);
    
    // Check for En Passant and Castling special cases based on move geometry
    bool isEnPassant = false;
    if ((movedPiece & 7) == PAWN && toCol != fromCol && capturedPiece == EMPTY) {
        isEnPassant = true;
    }
    
    bool isCastling = false;
    if ((movedPiece & 7) == KING && std::abs(toCol - fromCol) > 1) {
        isCastling = true;
    }

    Move move(fromRow, fromCol, toRow, toCol, movedPiece, capturedPiece, promotion, isEnPassant, isCastling);

    if (board.isLegalMove(move)) {
        board.makeMove(move);
        
        // Update Game State
        int nextSide = board.isWhiteTurn ? WHITE : BLACK;
        if (board.isCheckmate(nextSide)) {
            state = board.isWhiteTurn ? GameState::BLACK_WON_CHECKMATE : GameState::WHITE_WON_CHECKMATE;
        } else if (board.isStalemate(nextSide)) {
            state = GameState::DRAW_STALEMATE;
        } else if (board.halfMoveClock >= 100) {
            state = GameState::DRAW_FIFTY_MOVE;
        }
        return true;
    }
    return false;
}

std::string Game::getBoardFEN() const {
    return board.getFEN();
}

GameState Game::getGameState() const {
    return state;
}

std::string Game::getGameStateString() const {
    switch(state) {
        case GameState::IN_PROGRESS: return "in_progress";
        case GameState::WHITE_WON_CHECKMATE: return "white_won_checkmate";
        case GameState::BLACK_WON_CHECKMATE: return "black_won_checkmate";
        case GameState::WHITE_WON_RESIGNATION: return "white_won_resignation";
        case GameState::BLACK_WON_RESIGNATION: return "black_won_resignation";
        case GameState::DRAW_STALEMATE: return "draw_stalemate";
        case GameState::DRAW_AGREEMENT: return "draw_agreement";
        case GameState::DRAW_FIFTY_MOVE: return "draw_fifty_move";
        case GameState::DRAW_REPETITION: return "draw_repetition";
        case GameState::DRAW_INSUFFICIENT_MATERIAL: return "draw_insufficient_material";
    }
    return "unknown";
}

bool Game::isWhiteTurn() const {
    return board.isWhiteTurn;
}

void Game::resign(bool isWhiteResigning) {
    if (state == GameState::IN_PROGRESS) {
        state = isWhiteResigning ? GameState::BLACK_WON_RESIGNATION : GameState::WHITE_WON_RESIGNATION;
    }
}

void Game::agreeDraw() {
    if (state == GameState::IN_PROGRESS) {
        state = GameState::DRAW_AGREEMENT;
    }
}

std::string Game::generateLegalMovesJSON() const {
    // Basic JSON string builder since we can't use STL/JSON libs
    std::string json = "[";
    int side = board.isWhiteTurn ? WHITE : BLACK;
    bool first = true;
    
    for (int fr = 0; fr < 8; ++fr) {
        for (int fc = 0; fc < 8; ++fc) {
            int piece = board.getPiece(fr, fc);
            if (piece != EMPTY && (piece & (WHITE|BLACK)) == side) {
                for (int tr = 0; tr < 8; ++tr) {
                    for (int tc = 0; tc < 8; ++tc) {
                        for (int promo : {EMPTY, QUEEN, ROOK, BISHOP, KNIGHT}) {
                            // Only check promos if pawn reaching last rank
                            if ((piece & 7) == PAWN && (tr == 0 || tr == 7)) {
                                if (promo == EMPTY) continue;
                            } else {
                                if (promo != EMPTY) continue;
                            }

                            Move testMove(fr, fc, tr, tc, piece, EMPTY, promo);
                            if (board.isLegalMove(testMove)) {
                                if (!first) json += ",";
                                json += "{\"fromRow\":" + std::to_string(fr) + 
                                        ",\"fromCol\":" + std::to_string(fc) + 
                                        ",\"toRow\":" + std::to_string(tr) + 
                                        ",\"toCol\":" + std::to_string(tc) + 
                                        ",\"promotion\":" + std::to_string(promo) + "}";
                                first = false;
                            }
                        }
                    }
                }
            }
        }
    }
    json += "]";
    return json;
}
