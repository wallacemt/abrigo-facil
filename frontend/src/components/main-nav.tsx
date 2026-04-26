"use client";
import { Moon, Sun, Heart, } from "lucide-react";

import { motion } from "motion/react";
import { useTheme } from "next-themes";
import Image from "next/image";

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
          className="flex items-center gap-3 bg-background/80 backdrop-blur-md p-3 px-5 rounded-2xl shadow-sm border border-border"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg shadow-sm">
            <Image src={"/logo.png"} width={100} height={100} alt="app logo" />
          </div>
          <div className="flex flex-col ml-1">
            <span className="font-bold text-xl leading-none tracking-tight">
              Abrigo<span className="text-primary">Fácil</span>
            </span>
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
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
          </motion.div>
        </div>
      </div>
    </div>
  );
};
