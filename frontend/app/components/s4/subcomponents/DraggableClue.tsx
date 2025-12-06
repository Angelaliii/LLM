import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GripHorizontal, Database } from 'lucide-react';
import '../s4.css';

interface ClueCard {
  id: string;
  text: string;
  type: 'key' | 'info';
  source: string;
}

interface DraggableClueProps {
  clue: ClueCard;
  onDragStart?: () => void;
  onDragEnd?: (fieldId: string) => void;
  index: number;
}

export default function DraggableClue({
  clue,
  onDragStart,
  onDragEnd,
  index
}: DraggableClueProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('clueId', clue.id);
    onDragStart?.();
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    
    // 尋找被拖放到的 DropZone
    const dropZoneElement = document.elementFromPoint(e.clientX, e.clientY);
    if (dropZoneElement) {
      const fieldId = dropZoneElement.getAttribute('data-field-id');
      if (fieldId) {
        onDragEnd?.(fieldId);
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      draggable
      onDragStartCapture={handleDragStart}
      onDragEndCapture={handleDragEnd}
      className={`draggable-clue p-4 bg-gradient-to-br rounded-lg border-2 cursor-move transition-all hover:shadow-lg ${
        clue.type === 'key'
          ? 'from-amber-100 via-amber-50 to-white border-amber-400 hover:border-amber-600 shadow-md'
          : 'from-blue-50 via-blue-50 to-white border-blue-300 hover:border-blue-500 shadow-sm'
      } ${isDragging ? 'opacity-60 scale-95' : 'hover:scale-105'}`}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <div className="flex gap-3 items-start">
        <GripHorizontal size={16} className="text-gray-400 flex-shrink-0 mt-1" />
        
        <div className="flex-1 min-w-0">
          <p className={`font-bold leading-tight break-words ${
            clue.type === 'key' ? 'text-amber-900 text-base' : 'text-blue-900 text-sm'
          }`}>
            {clue.text}
          </p>
          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
            <Database size={12} className="opacity-60" />
            {clue.source}
          </p>
        </div>

        <div className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${
          clue.type === 'key' 
            ? 'bg-amber-200 text-amber-900' 
            : 'bg-blue-200 text-blue-900'
        }`}>
          {clue.type === 'key' ? 'KEY' : 'INFO'}
        </div>
      </div>
    </motion.div>
  );
}
