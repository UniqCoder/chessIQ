"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import ChessBoard from '@/components/ChessBoard';
import Link from 'next/link';
import { motion } from 'framer-motion';

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Algebraic notation helpers
const getPieceNotation = (fen: string, row: number, col: number) => {
  const board = fen.split(' ')[0];
  const ranks = board.split('/');
  const rankStr = ranks[row];
  let c = 0;
  for (let i = 0; i < rankStr.length; i++) {
    const char = rankStr[i];
    if (isNaN(parseInt(char))) {
      if (c === col) return char.toUpperCase();
      c++;
    } else {
      c += parseInt(char);
      if (c > col) return '';
    }
  }
  return '';
};

const getColName = (col: number) => String.fromCharCode('a'.charCodeAt(0) + col);
const getRowName = (row: number) => (8 - row).toString();

const generateNotation = (fen: string, fromRow: number, fromCol: number, toRow: number, toCol: number) => {
  const piece = getPieceNotation(fen, fromRow, fromCol);
  if (piece === 'P' || piece === '') {
    return `${getColName(toCol)}${getRowName(toRow)}`;
  }
  return `${piece}${getColName(toCol)}${getRowName(toRow)}`;
};

// Material calculation
const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, P: 1, N: 3, B: 3, R: 5, Q: 9 };
const pieceSymbols: Record<string, string> = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕' };

const getMaterial = (fen: string) => {
  const board = fen.split(' ')[0];
  const counts: Record<string, number> = { p:0, n:0, b:0, r:0, q:0, P:0, N:0, B:0, R:0, Q:0 };
  for (const char of board) {
    if (counts[char] !== undefined) counts[char]++;
  }
  
  const startCounts: Record<string, number> = { p:8, n:2, b:2, r:2, q:1, P:8, N:2, B:2, R:2, Q:1 };
  const capturedByWhite = [];
  const capturedByBlack = [];
  let whiteScore = 0;
  let blackScore = 0;

  for (const p of ['q', 'r', 'b', 'n', 'p']) {
    const missing = startCounts[p] - counts[p];
    for(let i=0; i<missing; i++) {
      capturedByWhite.push(p);
      whiteScore += pieceValues[p];
    }
  }
  for (const p of ['Q', 'R', 'B', 'N', 'P']) {
    const missing = startCounts[p] - counts[p];
    for(let i=0; i<missing; i++) {
      capturedByBlack.push(p);
      blackScore += pieceValues[p];
    }
  }

  const whiteAdvantage = whiteScore - blackScore;
  
  return { capturedByWhite, capturedByBlack, whiteAdvantage };
};

function PlayMatchContent() {
  const [fen, setFen] = useState(START_FEN);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<any[]>([]);
  const [status, setStatus] = useState('in_progress');
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [whiteTime, setWhiteTime] = useState<number | null>(null);
  const [blackTime, setBlackTime] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<any>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyScrollRef = useRef<HTMLDivElement>(null);

  const isWhiteTurn = fen.split(' ')[1] === 'w';
  const { capturedByWhite, capturedByBlack, whiteAdvantage } = getMaterial(fen);

  useEffect(() => {
    setIsFlipped(!isWhiteTurn);
  }, [isWhiteTurn]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && status === 'in_progress') {
      interval = setInterval(() => {
        if (isWhiteTurn) {
          setWhiteTime(prev => {
            if (prev === null) return null;
            if (prev <= 1) { handleTimeout('white'); return 0; }
            return prev - 1;
          });
        } else {
          setBlackTime(prev => {
            if (prev === null) return null;
            if (prev <= 1) { handleTimeout('black'); return 0; }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, status, isWhiteTurn]);

  useEffect(() => {
    if (!matchId || whiteTime === null || blackTime === null) return;
    const savedMatches = JSON.parse(localStorage.getItem('chessiq_matches') || '[]');
    const matchIndex = savedMatches.findIndex((m: any) => m.id === matchId);
    if (matchIndex !== -1) {
      savedMatches[matchIndex].white_time = whiteTime;
      savedMatches[matchIndex].black_time = blackTime;
      localStorage.setItem('chessiq_matches', JSON.stringify(savedMatches));
    }
  }, [whiteTime, blackTime, matchId]);

  useEffect(() => {
    if (historyScrollRef.current) {
      historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
    }
  }, [moveHistory]);

  const handleTimeout = (timedOutColor: 'white' | 'black') => {
    const newStatus = timedOutColor === 'white' ? 'black_wins_on_time' : 'white_wins_on_time';
    setStatus(newStatus);
    
    if (matchId) {
       const savedMatches = JSON.parse(localStorage.getItem('chessiq_matches') || '[]');
       const matchIndex = savedMatches.findIndex((m: any) => m.id === matchId);
       if (matchIndex !== -1) {
         savedMatches[matchIndex].status = newStatus;
         if (timedOutColor === 'white') savedMatches[matchIndex].white_time = 0;
         else savedMatches[matchIndex].black_time = 0;
         localStorage.setItem('chessiq_matches', JSON.stringify(savedMatches));
       }
    }
  };

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
    const timeParam = searchParams.get('time');
    const savedMatches = JSON.parse(localStorage.getItem('chessiq_matches') || '[]');
    
    if (id) {
      const match = savedMatches.find((m: any) => m.id === id);
      if (match) {
        setMatchId(match.id);
        setFen(match.board_state);
        setStatus(match.status);
        if (match.white_time !== undefined) setWhiteTime(match.white_time);
        if (match.black_time !== undefined) setBlackTime(match.black_time);
        if (match.move_history) setMoveHistory(match.move_history);
        if (match.history && match.history.length > 1) setGameStarted(true);
        fetchLegalMoves(match.board_state);
      } else {
        router.push('/dashboard');
      }
    } else {
      const newMatchId = crypto.randomUUID();
      const initialTime = timeParam ? parseInt(timeParam) * 60 : 600;
      const newMatch = {
        id: newMatchId,
        owner_user_id: session.user.id,
        board_state: START_FEN,
        history: [START_FEN],
        status: 'in_progress',
        white_time: initialTime,
        black_time: initialTime,
        created_at: new Date().toISOString()
      };
      
      savedMatches.push(newMatch);
      localStorage.setItem('chessiq_matches', JSON.stringify(savedMatches));
      
      setMatchId(newMatchId);
      setFen(START_FEN);
      setWhiteTime(initialTime);
      setBlackTime(initialTime);
      setMoveHistory([]);
      setLastMove(null);
      setGameStarted(false);
      fetchLegalMoves(START_FEN);
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
          command: 'validate_move', fen, 
          fromRow: move.fromRow, fromCol: move.fromCol, 
          toRow: move.toRow, toCol: move.toCol, promotion: move.promotion || 0
        })
      });
      const data = await res.json();
      
      if (data.valid) {
        setFen(data.fen);
        setStatus(data.status);
        
        if (matchId) {
          const savedMatches = JSON.parse(localStorage.getItem('chessiq_matches') || '[]');
          const matchIndex = savedMatches.findIndex((m: any) => m.id === matchId);
          if (matchIndex !== -1) {
            savedMatches[matchIndex].board_state = data.fen;
            savedMatches[matchIndex].status = data.status;
            savedMatches[matchIndex].history = savedMatches[matchIndex].history || [START_FEN];
            savedMatches[matchIndex].history.push(data.fen);
            
            const notation = generateNotation(fen, move.fromRow, move.fromCol, move.toRow, move.toCol);
            const newHistory = [...moveHistory, notation];
            
            savedMatches[matchIndex].move_history = newHistory;
            localStorage.setItem('chessiq_matches', JSON.stringify(savedMatches));
            
            setMoveHistory(newHistory);
            setLastMove(move);
          }
        }

        if (!gameStarted) setGameStarted(true);
        if (data.status === 'in_progress') fetchLegalMoves(data.fen);
      }
    } catch (e) {
      console.error("Move failed", e);
    }
  };

  const handleUndo = () => {
    if (!matchId || status !== 'in_progress') return; 
    const savedMatches = JSON.parse(localStorage.getItem('chessiq_matches') || '[]');
    const matchIndex = savedMatches.findIndex((m: any) => m.id === matchId);
    if (matchIndex !== -1) {
      const match = savedMatches[matchIndex];
      if (match.history && match.history.length > 1) {
        match.history.pop(); 
        const prevFen = match.history[match.history.length - 1];
        
        const newHistory = [...(match.move_history || [])];
        if (newHistory.length > 0) newHistory.pop();
        match.move_history = newHistory;
        
        match.board_state = prevFen;
        match.status = 'in_progress';
        localStorage.setItem('chessiq_matches', JSON.stringify(savedMatches));
        
        setFen(prevFen);
        setStatus('in_progress');
        setMoveHistory(newHistory);
        setLastMove(null);
        if (match.history.length === 1) setGameStarted(false);
        fetchLegalMoves(prevFen);
      }
    }
  };

  const handleResign = () => {
    if (status !== 'in_progress' || !matchId) return;
    const newStatus = isWhiteTurn ? 'black_wins_by_resignation' : 'white_wins_by_resignation';
    setStatus(newStatus);
    
    const savedMatches = JSON.parse(localStorage.getItem('chessiq_matches') || '[]');
    const matchIndex = savedMatches.findIndex((m: any) => m.id === matchId);
    if (matchIndex !== -1) {
      savedMatches[matchIndex].status = newStatus;
      savedMatches[matchIndex].result = newStatus;
      localStorage.setItem('chessiq_matches', JSON.stringify(savedMatches));
    }
    setGameStarted(false);
  };

  const handleDraw = () => {
    if (status !== 'in_progress' || !matchId) return;
    const newStatus = 'draw_by_agreement';
    setStatus(newStatus);
    
    const savedMatches = JSON.parse(localStorage.getItem('chessiq_matches') || '[]');
    const matchIndex = savedMatches.findIndex((m: any) => m.id === matchId);
    if (matchIndex !== -1) {
      savedMatches[matchIndex].status = newStatus;
      savedMatches[matchIndex].result = newStatus;
      localStorage.setItem('chessiq_matches', JSON.stringify(savedMatches));
    }
    setGameStarted(false);
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="min-h-screen premium-gradient flex items-center justify-center text-primary font-bold">Loading Match...</div>;

  const whitePlayerCard = (
    <div className="w-full flex justify-between items-end bg-transparent p-2">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="text-white font-bold text-sm md:text-base flex items-center gap-2">
            White <span className="text-gray-400 font-medium text-xs">(1500)</span>
          </div>
          <div className="flex items-center gap-1 min-h-[20px]">
            {capturedByWhite.map((p, i) => <span key={i} className="text-gray-400 text-sm">{pieceSymbols[p]}</span>)}
            {whiteAdvantage > 0 && <span className="text-xs text-primary font-bold ml-1">+{whiteAdvantage}</span>}
          </div>
        </div>
      </div>
      <div className={`glass-panel px-4 py-2 text-3xl font-mono font-black ${isWhiteTurn && status === 'in_progress' ? 'bg-primary/20 text-primary border-primary/50' : 'text-gray-300'}`}>
        {formatTime(whiteTime)}
      </div>
    </div>
  );

  const blackPlayerCard = (
    <div className="w-full flex justify-between items-start bg-transparent p-2">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="text-white font-bold text-sm md:text-base flex items-center gap-2">
            Black <span className="text-gray-400 font-medium text-xs">(1500)</span>
          </div>
          <div className="flex items-center gap-1 min-h-[20px]">
            {capturedByBlack.map((p, i) => <span key={i} className="text-gray-400 text-sm">{pieceSymbols[p]}</span>)}
            {whiteAdvantage < 0 && <span className="text-xs text-primary font-bold ml-1">+{Math.abs(whiteAdvantage)}</span>}
          </div>
        </div>
      </div>
      <div className={`glass-panel px-4 py-2 text-3xl font-mono font-black ${!isWhiteTurn && status === 'in_progress' ? 'bg-primary/20 text-primary border-primary/50' : 'text-gray-300'}`}>
        {formatTime(blackTime)}
      </div>
    </div>
  );

  // Group move history into pairs
  const groupedHistory = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    groupedHistory.push({ w: moveHistory[i], b: moveHistory[i+1] });
  }

  return (
    <div className="min-h-screen premium-gradient text-white flex flex-col overflow-hidden">
      {/* Navbar Minimal */}
      <header className="p-4 border-b border-white/10 bg-background/50 backdrop-blur-md flex justify-between items-center z-20">
        <Link href="/dashboard" className="text-gray-400 hover:text-primary font-medium flex items-center gap-2 transition-colors">
          ← Dashboard
        </Link>
        <div className="text-lg font-black tracking-[0.2em] uppercase text-white">Match</div>
        <div className="w-24" /> {/* Spacer for centering */}
      </header>

      <main className="flex-1 flex flex-col xl:flex-row items-center xl:items-start justify-center gap-6 p-4 md:p-8 relative z-10 max-w-[1400px] mx-auto w-full">
        
        {/* Left Panel - Hidden on small screens */}
        <div className="hidden xl:flex w-64 glass-panel h-[660px] flex-col p-6">
          <h2 className="text-lg font-bold uppercase tracking-widest text-primary mb-4 border-b border-white/10 pb-2">Match Info</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Format</div>
              <div className="font-bold">10 | 0 Rapid</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Type</div>
              <div className="font-bold text-accent">Unrated Local</div>
            </div>
          </div>
        </div>

        {/* Center Board Column */}
        <div className="flex flex-col items-center w-full max-w-[520px] shrink-0">
          
          {status !== 'in_progress' && (
            <div className="w-full text-center text-xl font-bold text-white mb-4 p-4 glass-panel border-primary/50 text-primary">
              {status.replace(/_/g, ' ').toUpperCase()}
            </div>
          )}

          {/* Top Player */}
          {isFlipped ? whitePlayerCard : blackPlayerCard}

          {/* Board */}
          <div className="w-full my-2 relative">
            <ChessBoard 
              fen={fen} 
              onMove={handleMove} 
              legalMoves={legalMoves} 
              isWhiteTurn={isWhiteTurn} 
              status={status}
              isFlipped={isFlipped}
              lastMove={lastMove}
            />
          </div>

          {/* Bottom Player */}
          {isFlipped ? blackPlayerCard : whitePlayerCard}

        </div>

        {/* Right Panel - Move History & Controls */}
        <div className="w-full max-w-[520px] xl:max-w-[320px] glass-panel h-[400px] xl:h-[660px] flex flex-col overflow-hidden shrink-0">
          <div className="bg-background/40 p-4 border-b border-white/10 flex justify-between items-center">
            <span className="font-bold text-sm tracking-widest uppercase text-gray-400">Moves</span>
            <button onClick={handleUndo} className="text-xs font-bold uppercase tracking-widest text-primary hover:text-accent transition-colors bg-white/5 px-3 py-1 rounded">
              Undo
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2" ref={historyScrollRef}>
            {groupedHistory.map((turn, i) => (
              <div key={i} className="flex p-2 hover:bg-white/5 rounded transition-colors text-sm font-mono">
                <div className="w-8 text-gray-500">{i + 1}.</div>
                <div className="w-24 font-bold text-white">{turn.w}</div>
                <div className="w-24 font-bold text-gray-400">{turn.b || ''}</div>
              </div>
            ))}
            {groupedHistory.length === 0 && (
              <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                Make a move to start
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10 flex gap-2">
            <button onClick={handleResign} className="flex-1 glass-panel py-3 text-sm font-bold hover:border-primary transition-colors hover:text-primary">
              Resign
            </button>
            <button onClick={handleDraw} className="flex-1 glass-panel py-3 text-sm font-bold hover:border-primary transition-colors hover:text-primary">
              Draw
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function PlayMatch() {
  return (
    <Suspense fallback={<div className="min-h-screen premium-gradient flex items-center justify-center text-primary font-bold">Loading Match...</div>}>
      <PlayMatchContent />
    </Suspense>
  );
}
