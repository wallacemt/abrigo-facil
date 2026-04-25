"use client"
import React from 'react';
import { Moon, Sun, MapPin, Heart, Home } from 'lucide-react';

import { motion } from 'motion/react';
import { useTheme } from 'next-themes';

export const MainNav = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        
        {/* Logo/Brand */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 bg-background/90 backdrop-blur-md p-3 px-5 rounded-2xl shadow-sm border border-border"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-sm">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
               {/* Location pin background */}
               <path d="M32 2C18.7 2 8 12.7 8 26C8 42.5 32 62 32 62C32 62 56 42.5 56 26C56 12.7 45.3 2 32 2Z" fill="white"/>
               {/* Inner circle */}
               <circle cx="32" cy="24" r="16" fill="currentColor" className="text-primary" />
               {/* House */}
               <path d="M32 12L20 22V36H28V28H36V36H44V22L32 12Z" fill="white" />
               <path d="M22 22V16H26V19L32 14L42 22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col ml-1">
            <span className="font-bold text-xl leading-none tracking-tight">Abrigo<span className="text-primary">Fácil</span></span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-background/90 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-border flex items-center gap-2"
          >
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="p-2 rounded-xl text-muted-foreground hover:bg-secondary/50 transition-colors"
            >
              <Heart size={20} />
            </button>
          </motion.div>
          
          {/* User Profile / Menu placeholder */}
          <motion.button
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-background/90 backdrop-blur-md shadow-sm border border-border text-foreground hover:bg-secondary/80 overflow-hidden ml-2"
          >
             <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="User" className="w-[85%] h-[85%] object-cover rounded-xl" />
          </motion.button>
        </div>

      </div>
    </div>
  );
};
