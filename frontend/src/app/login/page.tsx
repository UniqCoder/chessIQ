"use client";

import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(searchParams?.get('tab') !== 'signup');
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
          router.push('/dashboard');
        } else {
          setIsLogin(true);
          setError("Check your email for the confirmation link, then sign in!");
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 premium-gradient">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative overflow-hidden"
      >
        <div className="text-center mb-8 flex flex-col items-center relative z-10">
          <div className="text-primary mb-4 text-4xl">
            ♕
          </div>
          <h2 className="text-3xl font-black mb-2 text-white tracking-widest uppercase">ChessIQ</h2>
          <p className="text-gray-400 font-medium">{isLogin ? 'Welcome back' : 'Create your account'}</p>
        </div>

        {error && (
          <div className={`p-4 rounded-xl mb-6 text-sm text-center font-bold ${error.includes('email') ? 'bg-primary/20 border border-primary/50 text-primary' : 'bg-red-500/10 border border-red-500/50 text-red-500'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors font-medium"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors font-medium"
              placeholder="Enter your password"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent text-background font-black text-lg py-4 rounded-xl hover:scale-[1.02] transition-all mt-6 shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 relative z-10 font-medium">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:text-accent transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen premium-gradient flex items-center justify-center text-primary font-bold">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
