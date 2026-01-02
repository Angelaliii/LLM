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
      className={`cursor-pointer group relative transition-all duration-300 h-full ${
        isSelected ? 'z-20' : 'z-10'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-xl border-2 bg-white shadow-lg transition-all duration-500 h-full flex flex-col ${
          isSelected
            ? 'border-primary-500 shadow-primary-900/20 ring-4 ring-primary-500/10 scale-105'
            : 'border-gray-200 hover:border-amber-400 hover:shadow-amber-900/20'
        }`}
      >
        {/* 背景圖 / 色塊 */}
        <div
          className={`npc-hero bg-gradient-to-br ${
            npc.color || 'from-primary-400 to-primary-600'
          } relative overflow-hidden flex-shrink-0`}
        >
          <div className="absolute inset-0 opacity-10 mix-blend-multiply" />
          {npc.avatar && (
            <div className="card-photo-wrapper">
              <img
                src={npc.avatar}
                alt={npc.name}
                className="card-img w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          )}
        </div>

        {/* 內容區 */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-dark-900 mb-1">
              {npc.name}
            </h3>
            <p className="text-xs font-semibold text-primary-600 mb-4">
              {npc.role}
            </p>

            <p className="text-dark-700 text-sm leading-relaxed mb-4">
              {npc.description}
            </p>
          </div>

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
            className="absolute bottom-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0"
          >
            ✓
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
