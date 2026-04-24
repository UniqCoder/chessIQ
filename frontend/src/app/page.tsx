"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.4"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col premium-gradient text-white font-sans overflow-x-hidden relative">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed w-full z-50 p-4 px-6 md:px-12 flex items-center justify-between glass-panel rounded-none border-t-0 border-l-0 border-r-0 border-b-white/10 bg-background/50">
        <div className="flex items-center gap-3 text-primary">
          <LogoIcon />
          <span className="text-2xl font-black tracking-widest uppercase text-white">ChessIQ</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest text-gray-400">
          <a href="#play" className="hover:text-primary transition-colors">Play</a>
          <a href="#puzzles" className="hover:text-primary transition-colors">Puzzles</a>
          <a href="#learn" className="hover:text-primary transition-colors">Learn</a>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <button className="px-6 py-2 rounded-xl text-sm font-bold text-white border border-white/20 hover:border-primary hover:text-primary transition-all duration-300">
              Log In
            </button>
          </Link>
          <Link href="/login?tab=signup">
            <button className="px-6 py-2 rounded-xl text-sm font-bold bg-primary text-background hover:bg-accent transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              Sign Up
            </button>
          </Link>
        </div>
      </nav>
      
      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 flex flex-col items-center justify-center pt-32 pb-24 relative z-10 min-h-[90vh]">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center w-full max-w-4xl"
        >
          <h1 className="text-6xl md:text-[6rem] font-black leading-[1.1] tracking-tight mb-6 drop-shadow-2xl">
            <span className="block text-white">The Premium</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Chess Experience</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-2xl leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
            Join the world's most elegant chess platform. Sharpen your mind, climb the ranks, and master the game of kings.
          </p>
          
          <div className="glass-panel p-8 md:p-12 max-w-2xl mx-auto rounded-[2rem] flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Ready to Play?</h2>
            <Link href="/login?tab=signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-[300px] flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-accent text-background font-black text-xl py-5 px-8 rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.5)]">
                Play Now
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Floating Chess Pieces (Decorative) */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-[20%] left-[5%] md:left-[10%] text-8xl opacity-20 pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
        >
          ♕
        </motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[5%] md:right-[10%] text-8xl opacity-20 pointer-events-none drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] text-primary"
        >
          ♞
        </motion.div>

      </main>



      {/* Footer */}
      <footer className="w-full text-center py-12 text-sm font-bold uppercase tracking-widest text-gray-600 relative z-10">
        © 2024 ChessIQ. Crafted with Precision.
      </footer>
    </div>
  );
}
