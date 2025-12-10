import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotebookStore, type Clue, type InformationGap } from '../store/useNotebookStore';
import { useMissionStore } from '../store/useMissionStore';
import { getMissionById } from '../data/missions';
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
    gapProgress,
    isOpen, 
    selectedClueId,
    actions 
  } = useNotebookStore();
  const [activeTab, setActiveTab] = useState<'story' | 'key'>('story');
  const { currentMissionId } = useMissionStore();
  const mission = currentMissionId ? getMissionById(currentMissionId) : null;
  const gaps = Object.values(informationGaps);
  const clues = Object.values(collectedClues);
  const totalUnlockedClues = clues.filter(clue => clue.unlocked).length;
  const prevUnlockedCountRef = useRef<number>(totalUnlockedClues);

  // 當新線索加入時，自動打開筆記本並切到線索分頁
  useEffect(() => {
    const prev = prevUnlockedCountRef.current;
    const curr = totalUnlockedClues;
    let t: number | undefined;
    if (curr > prev) {
      // 延遲開啟筆記本，讓使用者的訊息或正在顯示的回覆先呈現
      t = window.setTimeout(() => {
        if (!isOpen) {
          actions.setNotebookOpen(true);
        }
        setActiveTab('key');
      }, 400);
    }
    prevUnlockedCountRef.current = curr;
    return () => {
      if (t) clearTimeout(t);
    };
  }, [totalUnlockedClues, isOpen, actions]);

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
        {totalUnlockedClues > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -left-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
          >
            {totalUnlockedClues}
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
      <div className="flex items-center justify-between border-b border-gray-200 p-2 bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('story')}
            className={`py-2 px-3 rounded-md text-sm font-medium ${
              activeTab === 'story' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            任務故事
          </button>
          <button
            onClick={() => setActiveTab('key')}
            className={`py-2 px-3 rounded-md text-sm font-medium ${
              activeTab === 'key' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            關鍵線索
          </button>
        </div>

      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'story' ? (
            <motion.div
              key="story"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {mission ? (
                <div className="prose prose-sm text-sm text-gray-700">
                  <p>
                    在日治初期，日本總督府透過MISSING DATA等法律工具，對臺灣進行深入的制度改造。其中，MISSING DATA成為推行土地調查與權力控制的關鍵群體
                  </p>
                </div>
              ) : (
                <div className="text-sm text-gray-500">無法載入任務故事</div>
              )}
            </motion.div>
          ) : activeTab === 'key' ? (
            <motion.div
              key="key"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {gaps.map((gap) => (
                <div key={gap.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getGapStatusIcon(gap)}
                      <h3 className="font-medium text-dark-900">{gap.label}</h3>
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {gapProgress && gapProgress[gap.id]
                        ? `${gapProgress[gap.id].current}/${gapProgress[gap.id].required}`
                        : '0/1'}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{gap.description}</p>

                  {gap.status === 'locked' ? (
                    <div className="text-xs text-gray-500 italic">未解鎖 · 需要收集線索</div>
                  ) : gap.status === 'filled' ? (
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <div className="text-sm font-medium text-green-800">✅ {gap.correctAnswer}</div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded p-2">
                      <div className="text-sm text-amber-700">已解鎖</div>
                      {gap.unlockedClues.length > 0 && (
                        <div className="mt-2 text-xs text-amber-600">相關線索: {gap.unlockedClues.length} 個</div>
                      )}
                      <div className="mt-1 text-xs text-amber-700">
                        {gapProgress && gapProgress[gap.id]
                          ? `${gapProgress[gap.id].current}/${gapProgress[gap.id].required}`
                          : '0/1'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          ) : null}
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
  // 是否允許拖拉（預設 false）
  isDraggable?: boolean;
}

const ClueCard: React.FC<ClueCardProps> = ({
  clue,
  isSelected,
  onSelect,
  getTypeColor,
  getTypeLabel,
  isDraggable = false
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isDraggable) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', clue.id);
    onSelect();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`transition-all ${isSelected ? 'shadow-md' : ''}`}
    >
      <div
        className={`border rounded-lg p-3 ${isDraggable ? 'cursor-move' : 'cursor-pointer'} transition-all ${
          isSelected
            ? 'border-primary-300 bg-primary-50'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={onSelect}
        draggable={isDraggable}
        onDragStart={handleDragStart}
      >
        <div className="flex items-start gap-2">
          {isDraggable && <GripVertical size={16} className="text-gray-400 mt-1 flex-shrink-0" />}
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