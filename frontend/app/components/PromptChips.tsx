import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Heart, MessageCircle } from 'lucide-react';

// 追問層次定義
export type InquiryLevel = 'fact' | 'conflict' | 'empathy';

// 提示結構（簡化版，直接接收 LLM 生成的 suggestions）
interface PromptChip {
  text: string;
  type: InquiryLevel;
}

interface PromptChipsProps {
  suggestions?: PromptChip[]; // 主要 prop：直接接收 LLM 生成的 suggestions
  onChipClick: (prompt: string, level: InquiryLevel) => void;
  disabled?: boolean;
}

export default function PromptChips({
  suggestions = [],
  onChipClick,
  disabled = false
}: PromptChipsProps) {
  const [isVisible, setIsVisible] = useState(true);

  // 當 suggestions 更新時，確保顯示狀態重置
  useEffect(() => {
    if (suggestions.length > 0) {
      setIsVisible(true);
    }
  }, [suggestions]);

  const getLevelConfig = (level: InquiryLevel) => {
    switch (level) {
      case 'fact':
        return {
          icon: Brain,
          color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
          label: '事實層',
          description: '詢問具體事件'
        };
      case 'conflict':
        return {
          icon: Zap,
          color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
          label: '衝突層',
          description: '詢問對立面'
        };
      case 'empathy':
        return {
          icon: Heart,
          color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
          label: '同理層',
          description: '詢問個人感受'
        };
    }
  };

  const handleChipClick = (prompt: PromptChip) => {
    if (disabled) return;
    
    onChipClick(prompt.text, prompt.type);
    
    // 點擊後隱藏一下子，給予反饋
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 1000);
  };

  if (!isVisible || !suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle size={16} className="text-gray-500" />
        <span className="text-sm text-gray-600 font-medium">追問建議</span>
      </div>
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-wrap gap-2"
        >
          {suggestions.map((prompt, index) => {
            const config = getLevelConfig(prompt.type);
            const Icon = config.icon;
            
            return (
              <motion.button
                key={`${prompt.type}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleChipClick(prompt)}
                disabled={disabled}
                className={`px-4 py-2.5 rounded-xl border transition-all duration-200 text-sm shadow-sm hover:shadow flex items-center gap-2 ${
                  config.color
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={config.description}
              >
                <Icon size={14} />
                {prompt.text}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}