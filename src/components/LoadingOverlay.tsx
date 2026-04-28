"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingOverlayProps {
  onComplete: () => void;
}

export default function LoadingOverlay({ onComplete }: LoadingOverlayProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      // 0ms - 1000ms: Logo slowly fades in
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPhase(1);

      // 1000ms - 1800ms: Scanning line
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPhase(2);

      // 1800ms - 2500ms: Reveal
      await new Promise((resolve) => setTimeout(resolve, 700));
      onComplete();
    };

    sequence();
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: phase >= 0 ? 1 : 0, 
            scale: 1,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-white text-3xl md:text-5xl font-mono tracking-[0.2em] font-light"
          style={{
            textShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
          }}
        >
          <motion.span
            animate={{ 
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            SMART README
          </motion.span>
        </motion.div>

        {/* Scanning Line */}
        {phase === 1 && (
          <motion.div
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 0.8, ease: "linear" }}
            className="absolute left-[-10%] right-[-10%] h-[2px] bg-accent-primary shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
          />
        )}
      </div>

      {/* Background Dimmer for Reveal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 2 ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        className="absolute inset-0 bg-transparent"
      />
    </motion.div>
  );
}
