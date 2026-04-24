"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Match {
  id: string;
  status: string;
  result: string | null;
  created_at: string;
  white_time?: number;
  black_time?: number;
}

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimeSelect, setShowTimeSelect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchMatches();
  }, []);

  const checkAuthAndFetchMatches = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    // Use localStorage for matches so no SQL setup is needed!
    try {
      const savedMatches = JSON.parse(localStorage.getItem('chessiq_matches') || '[]');
      // Filter matches to only show ones belonging to this user
      const userMatches = savedMatches.filter((m: any) => m.owner_user_id === session.user.id);
      // Sort by newest first
      userMatches.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMatches(userMatches);
    } catch (e) {
      setMatches([]);
    }
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8 text-white">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="text-[#85B54E]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.4"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <button 
            onClick={handleSignOut}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </header>

        <div className="space-y-12">
          {/* Hero Play Section */}
          <div className="bg-surface border border-white/5 p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#85B54E]/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              {!showTimeSelect ? (
                <>
                  <div className="w-20 h-20 bg-[#85B54E]/20 text-[#85B54E] rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-[#85B54E]/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Play Chess</h2>
                  <p className="text-gray-400 mb-8 max-w-sm text-center">Start a local pass-and-play match on the same device.</p>
                  
                  <button 
                    onClick={() => setShowTimeSelect(true)}
                    className="w-full max-w-sm bg-[#85B54E] text-white font-bold text-xl py-5 rounded-2xl hover:bg-[#72A040] hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(133,181,78,0.3)] flex items-center justify-center gap-3"
                  >
                    <span>Play Now</span>
                  </button>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-lg"
                >
                  <h2 className="text-2xl font-bold mb-8 text-center">Select Time Control</h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[10, 15, 30].map((time) => (
                      <Link key={time} href={`/play?time=${time}`}>
                        <button className="w-full bg-[#3A3836] border-2 border-white/5 hover:border-[#85B54E] hover:bg-[#4A4846] text-white py-8 rounded-2xl transition-all shadow-lg flex flex-col items-center justify-center group hover:-translate-y-1">
                          <svg className="w-8 h-8 mb-3 text-gray-400 group-hover:text-[#85B54E] transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <span className="text-2xl font-black mb-1">{time}</span>
                          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Min</span>
                        </button>
                      </Link>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowTimeSelect(false)}
                    className="text-sm font-medium text-gray-500 hover:text-white transition-colors mt-2"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Match History */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-[#A3A09E] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Recent Games
            </h2>
            
            {matches.length === 0 ? (
              <div className="bg-surface border border-white/5 rounded-2xl p-12 text-center text-gray-500 shadow-xl">
                <p className="text-lg">No matches found.</p>
                <p className="text-sm mt-2">Start your first local match!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <motion.div 
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#3A3836] border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:border-white/10 transition-colors shadow-lg"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${match.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                          {match.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                          {new Date(match.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {match.white_time && (
                          <span className="text-sm text-gray-400 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {Math.round(Math.max(match.white_time, match.black_time || 0) / 60)} min
                          </span>
                        )}
                      </div>
                      {match.result && (
                        <div className="text-sm font-bold text-[#85B54E]">
                          Result: {match.result.replace(/_/g, ' ').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <Link href={`/play?id=${match.id}`}>
                      <button className="w-full sm:w-auto px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors text-white whitespace-nowrap">
                        {match.status === 'in_progress' ? 'Resume Game' : 'View Game'}
                      </button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
