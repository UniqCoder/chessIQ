"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import ChessBoard from '@/components/ChessBoard';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function PlayMatch() {
  const [fen, setFen] = useState(START_FEN);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<any[]>([]);
  const [status, setStatus] = useState('in_progress');
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    initMatch();
  }, []);

  const initMatch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const id = searchParams.get('id');
    const savedMatches = JSON.parse(localStorage.getItem('chessiq_matches') || '[]');
    
    if (id) {
      // Resume from localStorage
      const match = savedMatches.find((m: any) => m.id === id);
      if (match) {
        setMatchId(match.id);
        setFen(match.board_state);
        setStatus(match.status);
        fetchLegalMoves(match.board_state);
      } else {
        alert("Match not found!");
        router.push('/dashboard');
      }
    } else {
      // New match in localStorage
      const newMatchId = crypto.randomUUID();
      const newMatch = {
        id: newMatchId,
        owner_user_id: session.user.id,
        board_state: START_FEN,
        history: [START_FEN],
        status: 'in_progress',
        created_at: new Date().toISOString()
      };
      
      savedMatches.push(newMatch);
      localStorage.setItem('chessiq_matches', JSON.stringify(savedMatches));
      
      setMatchId(newMatchId);
      setFen(START_FEN);
      fetchLegalMoves(START_FEN);
      // Clean URL
      window.history.replaceState({}, '', `/play?id=${newMatchId}`);
    }
    setLoading(false);
  };

  const fetchLegalMoves = async (currentFen: string) => {
    try {
      const res = await fetch('/api/chess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'legal_moves', fen: currentFen })
      });
      const data = await res.json();
      if (data.moves) setLegalMoves(data.moves);
    } catch (e) {
      console.error("Failed to fetch legal moves", e);
    }
  };

  const handleMove = async (move: any) => {
    try {
      const res = await fetch('/api/chess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command: 'validate_move', 
          fen, 
          fromRow: move.fromRow, 
          fromCol: move.fromCol, 
          toRow: move.toRow, 
          toCol: move.toCol,
          promotion: move.promotion || 0
        })
      });
      const data = await res.json();
      
      if (data.valid) {
        setFen(data.fen);
        setStatus(data.status);
        
        // Save to localStorage
        if (matchId) {
          const savedMatches = JSON.parse(localStorage.getItem('chessiq_matches') || '[]');
          const matchIndex = savedMatches.findIndex((m: any) => m.id === matchId);
          if (matchIndex !== -1) {
            savedMatches[matchIndex].board_state = data.fen;
            savedMatches[matchIndex].status = data.status;
            savedMatches[matchIndex].history = savedMatches[matchIndex].history || [START_FEN];
            savedMatches[matchIndex].history.push(data.fen);
            localStorage.setItem('chessiq_matches', JSON.stringify(savedMatches));
          }
        }

        if (data.status === 'in_progress') {
          fetchLegalMoves(data.fen);
        }
      }
    } catch (e) {
      console.error("Move failed", e);
    }
  };

  const handleUndo = () => {
    if (!matchId || status !== 'in_progress') return; // For MVP, allow undo if in progress. (Or even if game over, just reset to in_progress)
    const savedMatches = JSON.parse(localStorage.getItem('chessiq_matches') || '[]');
    const matchIndex = savedMatches.findIndex((m: any) => m.id === matchId);
    if (matchIndex !== -1) {
      const match = savedMatches[matchIndex];
      if (match.history && match.history.length > 1) {
        match.history.pop(); // remove current state
        const prevFen = match.history[match.history.length - 1];
        match.board_state = prevFen;
        match.status = 'in_progress';
        localStorage.setItem('chessiq_matches', JSON.stringify(savedMatches));
        
        setFen(prevFen);
        setStatus('in_progress');
        fetchLegalMoves(prevFen);
      }
    }
  };

  const isWhiteTurn = fen.split(' ')[1] === 'w';

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <header className="p-4 border-b border-white/5 flex justify-between items-center bg-surface shadow-md">
        <Link href="/dashboard" className="text-[#A3A09E] hover:text-white flex items-center gap-2 transition-colors">
          ← Back to Dashboard
        </Link>
        <div className="text-xl font-bold tracking-tight text-white">Local Match</div>
        <div className="w-auto flex gap-4 items-center">
          <button 
            onClick={handleUndo}
            className="px-4 py-2 bg-[#3A3836] hover:bg-[#5A5856] border border-white/5 rounded-lg text-sm transition-colors text-[#A3A09E] shadow-md"
          >
            Undo Move
          </button>
          <span className={`px-4 py-2 rounded-full text-sm shadow-md font-medium ${isWhiteTurn ? 'bg-[#85B54E] text-white' : 'bg-[#3A3836] text-[#A3A09E] border border-white/5'}`}>
            {isWhiteTurn ? 'White to Move' : 'Black to Move'}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="mb-4 text-center">
          {status !== 'in_progress' && (
            <div className="text-2xl font-bold text-white mb-2 p-4 bg-[#85B54E]/20 rounded-xl border border-[#85B54E]/50 shadow-lg shadow-[#85B54E]/10">
              Game Over: {status.replace(/_/g, ' ').toUpperCase()}
            </div>
          )}
        </div>

        <ChessBoard 
          fen={fen} 
          onMove={handleMove} 
          legalMoves={legalMoves} 
          isWhiteTurn={isWhiteTurn} 
          status={status}
        />

      </main>
    </div>
  );
}
