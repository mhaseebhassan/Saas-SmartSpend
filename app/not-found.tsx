"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function FloatingParticles() {
  const [particles, setParticles] = useState<any[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setParticles(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 4,
        opacity: Math.random() * 0.3 + 0.05,
        randomX: Math.random() > 0.5 ? 15 : -15,
      }))
    );
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, p.randomX, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 bg-transparent overflow-hidden">
      {/* Floating particles */}
      <FloatingParticles />

      {/* Pulsing glow behind the 404 */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-white/[0.03] blur-[100px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.06, 0.03],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 404 text with gradient */}
      <motion.h1
        className="relative text-[10rem] sm:text-[14rem] md:text-[18rem] font-extrabold leading-none tracking-tighter select-none"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        404
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="relative text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight -mt-4 sm:-mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        Page not found
      </motion.p>

      {/* Description */}
      <motion.p
        className="relative text-sm sm:text-base text-white/50 max-w-md text-center mt-4 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </motion.p>

      {/* Buttons */}
      <motion.div
        className="relative flex flex-col sm:flex-row items-center gap-3 mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href="/"
          className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-black bg-white rounded-xl hover:bg-white/90 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Go Home
        </Link>

        <Link
          href="/dashboard"
          className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white/80 bg-white/[0.06] border border-white/[0.08] rounded-xl hover:bg-white/[0.1] hover:text-white hover:border-white/[0.15] transition-all duration-200 backdrop-blur-sm"
        >
          Go to Dashboard
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </motion.div>

      {/* Decorative bottom line */}
      <motion.div
        className="absolute bottom-12 w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      />
    </div>
  );
}
