import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import '../s4.css';

interface ArchiveField {
  id: string;
  label: string;
  correctText: string;
  correctClueId: string;
}

interface DropZoneProps {
  fieldId: string;
  status: 'empty' | 'filled';
  config: ArchiveField;
  highlight?: boolean;
}

export default function DropZone({
  fieldId,
  status,
  config,
  highlight = false
}: DropZoneProps) {
  const handleDragOver = (e: React.DragEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <motion.span
      id={`dropzone-${fieldId}`}
      data-field-id={fieldId}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg font-bold transition-all border-2 ${
        status === 'empty'
          ? `border-dashed border-amber-400 bg-amber-50/30 ${
              highlight ? 'ring-2 ring-amber-500 shadow-lg scale-105' : 'hover:bg-amber-100/50'
            }`
          : 'border-solid border-green-500 bg-green-50 shadow-sm'
      }`}
      whileHover={status === 'empty' ? { scale: 1.05 } : {}}
    >
      <AnimatePresence mode="wait">
        {status === 'empty' ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 text-amber-600"
          >
            <HelpCircle size={16} className="animate-pulse" />
            <span className="text-sm font-semibold text-amber-700">[待修復]</span>
          </motion.div>
        ) : (
          <motion.div
            key="filled"
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="flex items-center gap-1"
          >
            <CheckCircle2 size={16} className="text-green-600" />
            <span className="text-sm font-bold text-green-700 inline-block">
              {config.correctText}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.span>
  );
}
