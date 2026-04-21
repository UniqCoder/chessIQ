#include "../include/board.h"
#include <cctype>

Board::Board() {
    reset();
}

void Board::reset() {
    loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
}

void Board::loadFEN(const std::string& fen) {
    for(int r=0; r<8; ++r) {
        for(int c=0; c<8; ++c) {
            squares[r][c] = EMPTY;
        }
    }
    
    int row = 0;
    int col = 0;
    size_t i = 0;
    
    // Board
    for (; i < fen.length() && fen[i] != ' '; ++i) {
        char c = fen[i];
        if (c == '/') {
            row++;
            col = 0;
        } else if (isdigit(c)) {
            col += (c - '0');
        } else {
            int color = isupper(c) ? WHITE : BLACK;
            int type = EMPTY;
            char lc = tolower(c);
            if (lc == 'p') type = PAWN;
            else if (lc == 'n') type = KNIGHT;
            else if (lc == 'b') type = BISHOP;
            else if (lc == 'r') type = ROOK;
            else if (lc == 'q') type = QUEEN;
            else if (lc == 'k') type = KING;
            
            squares[row][col] = color | type;
            col++;
        }
    }
    
    // Turn
    ++i;
    isWhiteTurn = (fen[i] == 'w');
    i += 2;
    
    // Castling
    whiteCanCastleKingside = false;
    whiteCanCastleQueenside = false;
    blackCanCastleKingside = false;
    blackCanCastleQueenside = false;
    
    if (fen[i] == '-') {
        i++;
    } else {
        while (fen[i] != ' ') {
            if (fen[i] == 'K') whiteCanCastleKingside = true;
            if (fen[i] == 'Q') whiteCanCastleQueenside = true;
            if (fen[i] == 'k') blackCanCastleKingside = true;
            if (fen[i] == 'q') blackCanCastleQueenside = true;
            i++;
        }
    }
    
    // En Passant
    ++i;
    if (fen[i] == '-') {
        enPassantCol = -1;
        i++;
    } else {
        enPassantCol = fen[i] - 'a';
        i += 2;
    }
    
    // Clocks
    halfMoveClock = 0;
    fullMoveNumber = 1;
    moveHistory.clear();
}

std::string Board::getFEN() const {
    std::string fen = "";
    for (int r = 0; r < 8; ++r) {
        int emptyCount = 0;
        for (int c = 0; c < 8; ++c) {
            int p = squares[r][c];
            if (p == EMPTY) {
                emptyCount++;
            } else {
                if (emptyCount > 0) {
                    fen += std::to_string(emptyCount);
                    emptyCount = 0;
                }
                int type = p & 7;
                bool isWhite = (p & WHITE);
                char c_piece = ' ';
                if (type == PAWN) c_piece = 'p';
                if (type == KNIGHT) c_piece = 'n';
                if (type == BISHOP) c_piece = 'b';
                if (type == ROOK) c_piece = 'r';
                if (type == QUEEN) c_piece = 'q';
                if (type == KING) c_piece = 'k';
                
                if (isWhite) c_piece = toupper(c_piece);
                fen += c_piece;
            }
        }
        if (emptyCount > 0) fen += std::to_string(emptyCount);
        if (r < 7) fen += "/";
    }
    
    fen += (isWhiteTurn ? " w " : " b ");
    
    std::string castling = "";
    if (whiteCanCastleKingside) castling += "K";
    if (whiteCanCastleQueenside) castling += "Q";
    if (blackCanCastleKingside) castling += "k";
    if (blackCanCastleQueenside) castling += "q";
    if (castling.empty()) castling = "-";
    fen += castling + " ";
    
    if (enPassantCol == -1) {
        fen += "-";
    } else {
        char file = 'a' + enPassantCol;
        char rank = isWhiteTurn ? '6' : '3';
        fen += file;
        fen += rank;
    }
    
    fen += " " + std::to_string(halfMoveClock) + " " + std::to_string(fullMoveNumber);
    return fen;
}

bool Board::isSquareAttacked(int row, int col, int attackingSide) const {
    // Check pawns
    int pawnDir = (attackingSide == WHITE) ? 1 : -1;
    if (row + pawnDir >= 0 && row + pawnDir < 8) {
        if (col > 0 && squares[row + pawnDir][col - 1] == (attackingSide | PAWN)) return true;
        if (col < 7 && squares[row + pawnDir][col + 1] == (attackingSide | PAWN)) return true;
    }
    
    // Check Knights
    int nRow[] = {-2, -2, -1, -1, 1, 1, 2, 2};
    int nCol[] = {-1, 1, -2, 2, -2, 2, -1, 1};
    for(int i=0; i<8; ++i) {
        int r = row + nRow[i];
        int c = col + nCol[i];
        if (r>=0 && r<8 && c>=0 && c<8) {
            if (squares[r][c] == (attackingSide | KNIGHT)) return true;
        }
    }
    
    // Check Kings
    int kRow[] = {-1, -1, -1, 0, 0, 1, 1, 1};
    int kCol[] = {-1, 0, 1, -1, 1, -1, 0, 1};
    for(int i=0; i<8; ++i) {
        int r = row + kRow[i];
        int c = col + kCol[i];
        if (r>=0 && r<8 && c>=0 && c<8) {
            if (squares[r][c] == (attackingSide | KING)) return true;
        }
    }
    
    // Sliders
    int dRow[] = {-1, -1, -1, 0, 0, 1, 1, 1};
    int dCol[] = {-1, 0, 1, -1, 1, -1, 0, 1};
    
    for(int i=0; i<8; ++i) {
        bool isDiag = (dRow[i] != 0 && dCol[i] != 0);
        int r = row + dRow[i];
        int c = col + dCol[i];
        while (r>=0 && r<8 && c>=0 && c<8) {
            int p = squares[r][c];
            if (p != EMPTY) {
                if ((p & (WHITE|BLACK)) == attackingSide) {
                    int type = p & 7;
                    if (type == QUEEN) return true;
                    if (isDiag && type == BISHOP) return true;
                    if (!isDiag && type == ROOK) return true;
                }
                break;
            }
            r += dRow[i];
            c += dCol[i];
        }
    }
    return false;
}

bool Board::isCheck(int side) const {
    int kingRow = -1, kingCol = -1;
    for(int r=0; r<8; ++r) {
        for(int c=0; c<8; ++c) {
            if (squares[r][c] == (side | KING)) {
                kingRow = r;
                kingCol = c;
                break;
            }
        }
        if(kingRow != -1) break;
    }
    if (kingRow == -1) return false; // Should not happen in valid chess
    int attackingSide = (side == WHITE) ? BLACK : WHITE;
    return isSquareAttacked(kingRow, kingCol, attackingSide);
}

void Board::generatePseudoLegalMoves(int side, CustomStack<Move>& moves) const {
    int oppSide = (side == WHITE) ? BLACK : WHITE;
    int pawnDir = (side == WHITE) ? -1 : 1;
    int startRow = (side == WHITE) ? 6 : 1;
    int promoRow = (side == WHITE) ? 0 : 7;
    
    for(int r=0; r<8; ++r) {
        for(int c=0; c<8; ++c) {
            int piece = squares[r][c];
            if (piece == EMPTY || (piece & (WHITE|BLACK)) != side) continue;
            
            int type = piece & 7;
            
            if (type == PAWN) {
                // Forward move
                if (r + pawnDir >= 0 && r + pawnDir < 8 && squares[r + pawnDir][c] == EMPTY) {
                    if (r + pawnDir == promoRow) {
                        moves.push(Move(r, c, r + pawnDir, c, piece, EMPTY, QUEEN));
                        moves.push(Move(r, c, r + pawnDir, c, piece, EMPTY, ROOK));
                        moves.push(Move(r, c, r + pawnDir, c, piece, EMPTY, BISHOP));
                        moves.push(Move(r, c, r + pawnDir, c, piece, EMPTY, KNIGHT));
                    } else {
                        moves.push(Move(r, c, r + pawnDir, c, piece));
                        // Double forward
                        if (r == startRow && squares[r + 2*pawnDir][c] == EMPTY) {
                            moves.push(Move(r, c, r + 2*pawnDir, c, piece));
                        }
                    }
                }
                // Captures
                for (int d = -1; d <= 1; d += 2) {
                    if (c + d >= 0 && c + d < 8) {
                        int targetR = r + pawnDir;
                        int targetC = c + d;
                        if (targetR >= 0 && targetR < 8) {
                            int targetPiece = squares[targetR][targetC];
                            if (targetPiece != EMPTY && (targetPiece & (WHITE|BLACK)) == oppSide) {
                                if (targetR == promoRow) {
                                    moves.push(Move(r, c, targetR, targetC, piece, targetPiece, QUEEN));
                                    moves.push(Move(r, c, targetR, targetC, piece, targetPiece, ROOK));
                                    moves.push(Move(r, c, targetR, targetC, piece, targetPiece, BISHOP));
                                    moves.push(Move(r, c, targetR, targetC, piece, targetPiece, KNIGHT));
                                } else {
                                    moves.push(Move(r, c, targetR, targetC, piece, targetPiece));
                                }
                            } else if (targetR == ((side == WHITE) ? 2 : 5) && targetC == enPassantCol) {
                                // En passant
                                moves.push(Move(r, c, targetR, targetC, piece, oppSide | PAWN, EMPTY, true));
                            }
                        }
                    }
                }
            } else if (type == KNIGHT) {
                int nRow[] = {-2, -2, -1, -1, 1, 1, 2, 2};
                int nCol[] = {-1, 1, -2, 2, -2, 2, -1, 1};
                for(int i=0; i<8; ++i) {
                    int tr = r + nRow[i];
                    int tc = c + nCol[i];
                    if (tr>=0 && tr<8 && tc>=0 && tc<8) {
                        int tp = squares[tr][tc];
                        if (tp == EMPTY || (tp & (WHITE|BLACK)) == oppSide) {
                            moves.push(Move(r, c, tr, tc, piece, tp));
                        }
                    }
                }
            } else if (type == KING) {
                int kRow[] = {-1, -1, -1, 0, 0, 1, 1, 1};
                int kCol[] = {-1, 0, 1, -1, 1, -1, 0, 1};
                for(int i=0; i<8; ++i) {
                    int tr = r + kRow[i];
                    int tc = c + kCol[i];
                    if (tr>=0 && tr<8 && tc>=0 && tc<8) {
                        int tp = squares[tr][tc];
                        if (tp == EMPTY || (tp & (WHITE|BLACK)) == oppSide) {
                            moves.push(Move(r, c, tr, tc, piece, tp));
                        }
                    }
                }
                // Castling
                if (side == WHITE && r == 7 && c == 4) {
                    if (whiteCanCastleKingside && squares[7][5] == EMPTY && squares[7][6] == EMPTY &&
                        !isSquareAttacked(7, 4, BLACK) && !isSquareAttacked(7, 5, BLACK) && !isSquareAttacked(7, 6, BLACK)) {
                        moves.push(Move(7, 4, 7, 6, piece, EMPTY, EMPTY, false, true));
                    }
                    if (whiteCanCastleQueenside && squares[7][3] == EMPTY && squares[7][2] == EMPTY && squares[7][1] == EMPTY &&
                        !isSquareAttacked(7, 4, BLACK) && !isSquareAttacked(7, 3, BLACK) && !isSquareAttacked(7, 2, BLACK)) {
                        moves.push(Move(7, 4, 7, 2, piece, EMPTY, EMPTY, false, true));
                    }
                } else if (side == BLACK && r == 0 && c == 4) {
                    if (blackCanCastleKingside && squares[0][5] == EMPTY && squares[0][6] == EMPTY &&
                        !isSquareAttacked(0, 4, WHITE) && !isSquareAttacked(0, 5, WHITE) && !isSquareAttacked(0, 6, WHITE)) {
                        moves.push(Move(0, 4, 0, 6, piece, EMPTY, EMPTY, false, true));
                    }
                    if (blackCanCastleQueenside && squares[0][3] == EMPTY && squares[0][2] == EMPTY && squares[0][1] == EMPTY &&
                        !isSquareAttacked(0, 4, WHITE) && !isSquareAttacked(0, 3, WHITE) && !isSquareAttacked(0, 2, WHITE)) {
                        moves.push(Move(0, 4, 0, 2, piece, EMPTY, EMPTY, false, true));
                    }
                }
            } else { // Sliders: BISHOP, ROOK, QUEEN
                int dRow[] = {-1, -1, -1, 0, 0, 1, 1, 1};
                int dCol[] = {-1, 0, 1, -1, 1, -1, 0, 1};
                for(int i=0; i<8; ++i) {
                    bool isDiag = (dRow[i] != 0 && dCol[i] != 0);
                    if (type == BISHOP && !isDiag) continue;
                    if (type == ROOK && isDiag) continue;
                    
                    int tr = r + dRow[i];
                    int tc = c + dCol[i];
                    while (tr>=0 && tr<8 && tc>=0 && tc<8) {
                        int tp = squares[tr][tc];
                        if (tp == EMPTY) {
                            moves.push(Move(r, c, tr, tc, piece, tp));
                        } else {
                            if ((tp & (WHITE|BLACK)) == oppSide) {
                                moves.push(Move(r, c, tr, tc, piece, tp));
                            }
                            break;
                        }
                        tr += dRow[i];
                        tc += dCol[i];
                    }
                }
            }
        }
    }
}

bool Board::makeMove(const Move& move) {
    int side = isWhiteTurn ? WHITE : BLACK;
    int oppSide = isWhiteTurn ? BLACK : WHITE;
    
    // Apply move to board temporarily
    squares[move.toRow][move.toCol] = move.promotion != EMPTY ? (side | move.promotion) : move.movedPiece;
    squares[move.fromRow][move.fromCol] = EMPTY;
    
    if (move.isEnPassant) {
        squares[move.fromRow][move.toCol] = EMPTY; // remove pawn
    } else if (move.isCastling) {
        if (move.toCol == 6) { // Kingside
            squares[move.toRow][5] = squares[move.toRow][7];
            squares[move.toRow][7] = EMPTY;
        } else if (move.toCol == 2) { // Queenside
            squares[move.toRow][3] = squares[move.toRow][0];
            squares[move.toRow][0] = EMPTY;
        }
    }
    
    if (isCheck(side)) {
        // Illegal move, unmake and return false
        unmakeMove(move);
        return false;
    }
    
    // Move is legal. Update states
    if (move.movedPiece == (WHITE|KING)) {
        whiteCanCastleKingside = false;
        whiteCanCastleQueenside = false;
    } else if (move.movedPiece == (BLACK|KING)) {
        blackCanCastleKingside = false;
        blackCanCastleQueenside = false;
    } else if (move.movedPiece == (WHITE|ROOK)) {
        if (move.fromRow == 7 && move.fromCol == 7) whiteCanCastleKingside = false;
        if (move.fromRow == 7 && move.fromCol == 0) whiteCanCastleQueenside = false;
    } else if (move.movedPiece == (BLACK|ROOK)) {
        if (move.fromRow == 0 && move.fromCol == 7) blackCanCastleKingside = false;
        if (move.fromRow == 0 && move.fromCol == 0) blackCanCastleQueenside = false;
    }
    
    if (move.capturedPiece == (WHITE|ROOK)) {
        if (move.toRow == 7 && move.toCol == 7) whiteCanCastleKingside = false;
        if (move.toRow == 7 && move.toCol == 0) whiteCanCastleQueenside = false;
    } else if (move.capturedPiece == (BLACK|ROOK)) {
        if (move.toRow == 0 && move.toCol == 7) blackCanCastleKingside = false;
        if (move.toRow == 0 && move.toCol == 0) blackCanCastleQueenside = false;
    }
    
    if ((move.movedPiece & 7) == PAWN && std::abs(move.toRow - move.fromRow) == 2) {
        enPassantCol = move.fromCol;
    } else {
        enPassantCol = -1;
    }
    
    if ((move.movedPiece & 7) == PAWN || move.capturedPiece != EMPTY) {
        halfMoveClock = 0;
    } else {
        halfMoveClock++;
    }
    
    if (!isWhiteTurn) fullMoveNumber++;
    isWhiteTurn = !isWhiteTurn;
    
    moveHistory.push(move);
    return true;
}

void Board::unmakeMove(const Move& move) {
    // This is a simplified unmake just to undo the temporary board state for validation.
    // A full unmake would need to restore castling rights, EP, clocks.
    squares[move.fromRow][move.fromCol] = move.movedPiece;
    squares[move.toRow][move.toCol] = move.capturedPiece;
    
    if (move.isEnPassant) {
        squares[move.toRow][move.toCol] = EMPTY;
        squares[move.fromRow][move.toCol] = isWhiteTurn ? (BLACK|PAWN) : (WHITE|PAWN); // this is reversed because unmake implies we are undoing current turn
    } else if (move.isCastling) {
        if (move.toCol == 6) {
            squares[move.toRow][7] = squares[move.toRow][5];
            squares[move.toRow][5] = EMPTY;
        } else if (move.toCol == 2) {
            squares[move.toRow][0] = squares[move.toRow][3];
            squares[move.toRow][3] = EMPTY;
        }
    }
}

bool Board::isLegalMove(const Move& move) const {
    CustomStack<Move> pseudoMoves;
    generatePseudoLegalMoves(isWhiteTurn ? WHITE : BLACK, pseudoMoves);
    
    bool found = false;
    while (!pseudoMoves.empty()) {
        Move m = pseudoMoves.top();
        pseudoMoves.pop();
        if (m.fromRow == move.fromRow && m.fromCol == move.fromCol &&
            m.toRow == move.toRow && m.toCol == move.toCol && m.promotion == move.promotion) {
            found = true;
            break;
        }
    }
    if (!found) return false;
    
    // Temporarily make it to see if it leaves king in check
    Board tempBoard = *this;
    return tempBoard.makeMove(move);
}

bool Board::isCheckmate(int side) {
    if (!isCheck(side)) return false;
    
    CustomStack<Move> pseudoMoves;
    generatePseudoLegalMoves(side, pseudoMoves);
    
    while (!pseudoMoves.empty()) {
        Move m = pseudoMoves.top();
        pseudoMoves.pop();
        Board temp = *this;
        if (temp.makeMove(m)) return false;
    }
    return true;
}

bool Board::isStalemate(int side) {
    if (isCheck(side)) return false;
    
    CustomStack<Move> pseudoMoves;
    generatePseudoLegalMoves(side, pseudoMoves);
    
    while (!pseudoMoves.empty()) {
        Move m = pseudoMoves.top();
        pseudoMoves.pop();
        Board temp = *this;
        if (temp.makeMove(m)) return false;
    }
    return true;
}
