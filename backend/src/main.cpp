#include <iostream>
#include <string>
#include <cmath>
#include "../include/game.h"

// Simple JSON extraction helper
std::string extractJsonValue(const std::string& json, const std::string& key) {
    std::string searchKey = "\"" + key + "\":";
    size_t pos = json.find(searchKey);
    if (pos == std::string::npos) {
        searchKey = "\"" + key + "\" :";
        pos = json.find(searchKey);
    }
    if (pos == std::string::npos) return "";

    pos += searchKey.length();
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\n' || json[pos] == '\r')) pos++;
    
    if (pos >= json.length()) return "";

    if (json[pos] == '\"') {
        pos++;
        size_t endPos = json.find("\"", pos);
        if (endPos != std::string::npos) return json.substr(pos, endPos - pos);
    } else {
        size_t endPos = pos;
        while (endPos < json.length() && json[endPos] != ',' && json[endPos] != '}' && json[endPos] != ' ' && json[endPos] != '\n' && json[endPos] != '\r') {
            endPos++;
        }
        return json.substr(pos, endPos - pos);
    }
    return "";
}

int main() {
    // Read JSON payload from stdin
    std::string input;
    std::string line;
    while (std::getline(std::cin, line)) {
        input += line;
    }

    if (input.empty()) {
        std::cerr << "Error: No input provided" << std::endl;
        return 1;
    }

    std::string command = extractJsonValue(input, "command");
    std::string fen = extractJsonValue(input, "fen");

    if (fen.empty()) {
        std::cout << "{\"error\":\"Missing FEN\"}" << std::endl;
        return 1;
    }

    Board board;
    board.loadFEN(fen);

    if (command == "legal_moves") {
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
                                if ((piece & 7) == PAWN && (tr == 0 || tr == 7)) {
                                    if (promo == EMPTY) continue;
                                } else {
                                    if (promo != EMPTY) continue;
                                }

                                Move testMove(fr, fc, tr, tc, piece, board.getPiece(tr, tc), promo);
                                if ((piece & 7) == PAWN && tc != fc && board.getPiece(tr, tc) == EMPTY) testMove.isEnPassant = true;
                                if ((piece & 7) == KING && std::abs(tc - fc) > 1) testMove.isCastling = true;

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
        std::cout << "{\"moves\":" << json << "}" << std::endl;

    } else if (command == "validate_move") {
        std::string fromRowStr = extractJsonValue(input, "fromRow");
        std::string fromColStr = extractJsonValue(input, "fromCol");
        std::string toRowStr = extractJsonValue(input, "toRow");
        std::string toColStr = extractJsonValue(input, "toCol");
        std::string promoStr = extractJsonValue(input, "promotion");

        if (fromRowStr.empty() || toRowStr.empty()) {
            std::cout << "{\"error\":\"Missing move coordinates\"}" << std::endl;
            return 1;
        }

        int fromRow = std::stoi(fromRowStr);
        int fromCol = std::stoi(fromColStr);
        int toRow = std::stoi(toRowStr);
        int toCol = std::stoi(toColStr);
        int promotion = promoStr.empty() ? EMPTY : std::stoi(promoStr);

        int movedPiece = board.getPiece(fromRow, fromCol);
        if (movedPiece == EMPTY) {
            std::cout << "{\"valid\":false,\"error\":\"No piece at source\"}" << std::endl;
            return 0;
        }

        Move testMove(fromRow, fromCol, toRow, toCol, movedPiece, board.getPiece(toRow, toCol), promotion);
        
        // Handle Castling and En Passant state
        if ((movedPiece & 7) == PAWN && toCol != fromCol && board.getPiece(toRow, toCol) == EMPTY) testMove.isEnPassant = true;
        if ((movedPiece & 7) == KING && std::abs(toCol - fromCol) > 1) testMove.isCastling = true;

        if (board.isLegalMove(testMove)) {
            board.makeMove(testMove);
            std::string newFen = board.getFEN();
            
            // Check game over
            int nextSide = board.isWhiteTurn ? WHITE : BLACK;
            std::string status = "in_progress";
            if (board.isCheckmate(nextSide)) {
                status = board.isWhiteTurn ? "black_won_checkmate" : "white_won_checkmate";
            } else if (board.isStalemate(nextSide)) {
                status = "draw_stalemate";
            } else if (board.halfMoveClock >= 100) {
                status = "draw_fifty_move";
            }
            
            std::cout << "{\"valid\":true,\"fen\":\"" << newFen << "\",\"status\":\"" << status << "\"}" << std::endl;
        } else {
            std::cout << "{\"valid\":false}" << std::endl;
        }
    } else {
        std::cout << "{\"error\":\"Unknown command\"}" << std::endl;
        return 1;
    }

    return 0;
}
