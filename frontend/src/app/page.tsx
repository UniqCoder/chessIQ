"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.4"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);

const LogInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#2D2B2A] text-white font-sans overflow-hidden">
      {/* Navbar */}
      <header className="p-6 md:px-12 pt-8 flex items-center gap-3">
        <div className="text-[#85B54E]">
          <LogoIcon />
        </div>
        <span className="text-xl font-bold tracking-tight">ChessIQ</span>
      </header>
      
      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 pt-12 pb-24">
        
        {/* Left Column: Text & CTA */}
        <div className="flex-1 flex flex-col items-start z-10 w-full max-w-xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-[5.5rem] font-black leading-[1.05] tracking-tight mb-6"
          >
            <span className="block text-white">Master the</span>
            <span className="block text-[#85B54E]">Game of</span>
            <span className="block text-[#85B54E]">Kings.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#A3A09E] text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
          >
            Join the world's most intelligent chess community. Sharpen your tactics, analyze with grandmaster-level AI, and compete globally.
          </motion.p>
          
          {/* Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 w-full mb-12"
          >
            <Link href="/login?tab=signup" className="flex-1">
              <button className="w-full flex items-center justify-center gap-3 bg-[#85B54E] hover:bg-[#72A040] text-white font-bold py-4 px-6 rounded-xl transition-colors duration-300">
                <UserPlusIcon />
                <span>Sign Up Free</span>
              </button>
            </Link>
            <Link href="/login" className="flex-1">
              <button className="w-full flex items-center justify-center gap-3 bg-[#4A4846] hover:bg-[#5A5856] text-white font-bold py-4 px-6 rounded-xl transition-colors duration-300">
                <LogInIcon />
                <span>Sign In</span>
              </button>
            </Link>
          </motion.div>
          

        </div>
        
        {/* Right Column: Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex-1 w-full max-w-lg lg:max-w-xl relative"
        >
          {/* Subtly glowing dark container */}
          <div className="absolute -inset-1 bg-gradient-to-tr from-[#211F1E] to-[#363331] rounded-[2rem] blur opacity-50"></div>
          
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#211F1E] border border-white/5 shadow-2xl">
            <img 
              src="/hero.png" 
              alt="Elegant Wooden Chess Queen" 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
        
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-[#A3A09E]">
        © 2024 ChessIQ. All rights reserved.
      </footer>
    </div>
  );
}
