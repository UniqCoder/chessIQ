"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data.session) {
          // If email confirmation is disabled, session is returned immediately
          router.push('/dashboard');
        } else {
          // Since we can't redirect without a session, just switch to the login tab
          // so the user can try logging in once they are confirmed or if they disable confirmations.
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-white/5 p-8 rounded-2xl w-full max-w-md shadow-2xl"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="text-[#85B54E] mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.4"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-white">ChessIQ</h2>
          <p className="text-[#A3A09E]">{isLogin ? 'Welcome back' : 'Create your account'}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#A3A09E] mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#3A3836] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#85B54E] transition-colors"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#A3A09E] mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#3A3836] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#85B54E] transition-colors"
              placeholder="Enter your password"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#85B54E] text-white font-bold py-3 rounded-xl hover:bg-[#72A040] transition-colors mt-4 shadow-lg shadow-[#85B54E]/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#A3A09E]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#85B54E] font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
