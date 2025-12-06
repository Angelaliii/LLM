import React from 'react';
import { motion } from 'framer-motion';

interface NpcCardProps {
  npc: any;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export default function NpcCard({ npc, isSelected, onClick, index }: NpcCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={`cursor-pointer group relative transition-all duration-300 ${
        isSelected ? 'z-20' : 'z-10'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-xl border-2 bg-white shadow-lg transition-all duration-500 ${
          isSelected
            ? 'border-primary-500 shadow-primary-900/20 ring-4 ring-primary-500/10 scale-105'
            : 'border-gray-200 hover:border-amber-400 hover:shadow-amber-900/20'
        }`}
      >
        {/* 背景圖 / 色塊 */}
        <div
          className={`h-40 bg-gradient-to-br ${
            npc.color || 'from-primary-400 to-primary-600'
          } relative overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-10 mix-blend-multiply" />
          {npc.avatar && (
            <img
              src={npc.avatar}
              alt={npc.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          )}
        </div>

        {/* 內容區 */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-dark-900 mb-1">
            {npc.name}
          </h3>
          <p className="text-sm font-semibold text-primary-600 mb-4">
            {npc.role}
          </p>

          <p className="text-dark-700 text-sm leading-relaxed mb-4">
            {npc.description}
          </p>

          {npc.traits && (
            <div className="flex flex-wrap gap-2">
              {npc.traits.map((trait: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 選擇指示器 */}
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl"
          >
            ✓
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
