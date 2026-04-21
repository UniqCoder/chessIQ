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
}

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
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
      <div className="max-w-5xl mx-auto">
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

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-surface border border-white/5 p-6 rounded-2xl sticky top-8 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-[#A3A09E]">Actions</h2>
              <Link href="/play">
                <button className="w-full bg-[#85B54E] text-white font-bold py-4 rounded-xl hover:bg-[#72A040] transition-colors shadow-lg shadow-[#85B54E]/20 flex items-center justify-center gap-2">
                  <span>Start Local Match</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-surface border border-white/5 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-semibold mb-6 text-[#A3A09E]">Match History</h2>
              
              {matches.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No matches found.</p>
                  <p className="text-sm mt-2">Start your first local match!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <motion.div 
                      key={match.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#3A3836] border border-white/5 p-4 rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${match.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {match.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-400">
                            {new Date(match.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {match.result && (
                          <div className="text-sm font-bold text-[#85B54E]">
                            Result: {match.result.replace('_', ' ').toUpperCase()}
                          </div>
                        )}
                      </div>
                      <Link href={`/play?id=${match.id}`}>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                          {match.status === 'in_progress' ? 'Resume' : 'View'}
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
    </div>
  );
}
