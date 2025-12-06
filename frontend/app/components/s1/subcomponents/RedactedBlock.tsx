import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { redactedBackdropAnim } from '../animations';

interface RedactedBlockProps {
  field: any;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

export default function RedactedBlock({ field, isHovered, onHover }: RedactedBlockProps) {
  if (!field) return null;

  return (
    <motion.span
      className={`relative inline-flex items-center justify-center h-8 mx-1 px-4 rounded-md cursor-help align-middle transition-all duration-500 overflow-hidden ${
        isHovered 
          ? 'bg-amber-100/50 text-amber-800 shadow-sm border border-amber-200' 
          : 'bg-stone-200/50 text-stone-400 border border-transparent'
      }`}
      onMouseEnter={() => onHover(field.id)}
      onMouseLeave={() => onHover(null)}
      whileHover={{ scale: 1.02 }}
      layout
    >
      {!isHovered && (
        <motion.span 
          className="absolute inset-0 bg-stone-300/30 backdrop-blur-[2px] block" 
          initial={redactedBackdropAnim.initial}
          animate={redactedBackdropAnim.animate}
          transition={redactedBackdropAnim.transition}
        />
      )}
      
      {isHovered ? (
        <motion.span 
          initial={{ opacity: 0, y: 5 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-serif font-bold tracking-wider flex items-center gap-2 relative z-10"
        >
          <Search size={14} className="text-amber-600" /> {field.label}
        </motion.span>
      ) : (
        <span className="flex items-center gap-1 relative z-10 opacity-60">
          <span className="tracking-[0.1em] text-xs font-serif italic">MISSING DATA</span>
        </span>
      )}
    </motion.span>
  );
}
