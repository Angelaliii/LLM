import React from 'react';
import { motion } from 'framer-motion';
import { Hourglass } from 'lucide-react';
import { restoreLoaderPathTransition } from '../animations';

interface RestoreLoaderProps {
  progress: number;
}

export default function RestoreLoader({ progress }: RestoreLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
          <path
            className="text-stone-200"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <motion.path
            className="text-amber-600"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={restoreLoaderPathTransition}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Hourglass size={20} className="text-amber-700 opacity-80" />
        </div>
      </div>
      <p className="text-stone-500 font-serif tracking-widest text-sm animate-pulse">
        RESTORING ARCHIVES... {progress}%
      </p>
    </div>
  );
}
