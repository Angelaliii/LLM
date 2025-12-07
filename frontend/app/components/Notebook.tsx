import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotebookStore, type Clue, type InformationGap } from '../store/useNotebookStore';
import { 
  BookOpen, 
  X, 
  Lock, 
  CheckCircle, 
  Lightbulb, 
  User,
  Calendar,
  ArrowRight,
  GripVertical
} from 'lucide-react';

interface NotebookProps {
  className?: string;
}

export default function Notebook({ className = '' }: NotebookProps) {
  const { 
    informationGaps, 
    collectedClues, 
    isOpen, 
    selectedClueId,
    actions 
  } = useNotebookStore();
  
  const [activeTab, setActiveTab] = useState<'gaps' | 'clues'>('gaps');
  
  const gaps = Object.values(informationGaps);
  const clues = Object.values(collectedClues);
  const unlockedClues = clues.filter(clue => clue.unlocked);

  const getGapStatusIcon = (gap: InformationGap) => {
    switch (gap.status) {
      case 'locked':
        return <Lock size={16} className="text-gray-400" />;
      case 'filled':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Lightbulb size={16} className="text-amber-500" />;
    }
  };

  const getClueTypeColor = (type: Clue['type']) => {
    switch (type) {
      case 'fact':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'conflict':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'empathy':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getClueTypeLabel = (type: Clue['type']) => {
    switch (type) {
      case 'fact':
        return '事實';
      case 'conflict':
        return '衝突';
      case 'empathy':
        return '同理';
      default:
        return '背景';
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={actions.toggleNotebook}
        className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-primary-500 text-white p-3 rounded-l-lg shadow-lg hover:bg-primary-600 transition-colors ${className}`}
      >
        <BookOpen size={20} />
        {unlockedClues.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -left-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
          >
            {unlockedClues.length}
          </motion.div>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200 ${className}`}
    >
      {/* 頂部標題列 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-primary-600" />
          <h2 className="text-lg font-bold text-dark-900">調查筆記</h2>
        </div>
        <button
          onClick={actions.toggleNotebook}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* 標籤切換 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('gaps')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'gaps'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          待修復 ({gaps.length})
        </button>
        <button
          onClick={() => setActiveTab('clues')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'clues'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          線索 ({unlockedClues.length})
        </button>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'gaps' ? (
            <motion.div
              key="gaps"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {gaps.map((gap) => (
                <div key={gap.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getGapStatusIcon(gap)}
                    <h3 className="font-medium text-dark-900">{gap.label}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{gap.description}</p>
                  
                  {gap.status === 'locked' ? (
                    <div className="text-xs text-gray-500 italic">
                      需要收集線索解鎖
                    </div>
                  ) : gap.status === 'filled' ? (
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <div className="text-sm font-medium text-green-800">
                        ✅ {gap.correctAnswer}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded p-2">
                      <div className="text-sm text-amber-700">
                        已解鎖 • 可拖拉線索填入
                      </div>
                      {gap.unlockedClues.length > 0 && (
                        <div className="mt-2 text-xs text-amber-600">
                          相關線索: {gap.unlockedClues.length} 個
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="clues"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {unlockedClues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb size={24} className="mx-auto mb-2 opacity-50" />
                  <p>尚未收集到線索</p>
                  <p className="text-sm">與 NPC 對話來獲得更多資訊</p>
                </div>
              ) : (
                unlockedClues.map((clue) => (
                  <ClueCard
                    key={clue.id}
                    clue={clue}
                    isSelected={selectedClueId === clue.id}
                    onSelect={() => actions.selectClue(clue.id)}
                    getTypeColor={getClueTypeColor}
                    getTypeLabel={getClueTypeLabel}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// 線索卡片組件
interface ClueCardProps {
  clue: Clue;
  isSelected: boolean;
  onSelect: () => void;
  getTypeColor: (type: Clue['type']) => string;
  getTypeLabel: (type: Clue['type']) => string;
}

const ClueCard: React.FC<ClueCardProps> = ({
  clue,
  isSelected,
  onSelect,
  getTypeColor,
  getTypeLabel
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`transition-all ${isSelected ? 'shadow-md' : ''}`}
    >
      <div
        className={`border rounded-lg p-3 cursor-move transition-all ${
          isSelected
            ? 'border-primary-300 bg-primary-50'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={onSelect}
        draggable
        onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
          // HTML5 drag start handler (DOM DragEvent)
          e.dataTransfer.setData('text/plain', clue.id);
          onSelect();
        }}
      >
        <div className="flex items-start gap-2">
          <GripVertical size={16} className="text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(clue.type)}`}>
                {getTypeLabel(clue.type)}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <User size={12} />
                {clue.source}
              </span>
            </div>
            <p className="text-sm text-dark-900 leading-relaxed">
              {clue.text}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <Calendar size={12} />
              {
                (() => {
                  try {
                    const raw = (clue as any).timestamp;
                    const ts = raw instanceof Date ? raw : new Date(raw);
                    if (ts && typeof ts.toLocaleTimeString === 'function' && !isNaN(ts.getTime())) {
                      return ts.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
                    }
                  } catch (e) {
                    // fallthrough to fallback
                  }
                  return new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
                })()
              }
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};