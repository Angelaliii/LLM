import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, FileText, Users, MessageSquare, Archive, BookOpen } from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';

type StageId = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

interface Stage {
  id: StageId;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const stages: Stage[] = [
  {
    id: 'S0',
    name: '首頁',
    icon: <Home className="w-5 h-5" />,
    description: '返回任務選擇'
  },
  {
    id: 'S1',
    name: '檔案修復',
    icon: <FileText className="w-5 h-5" />,
    description: '解密歷史檔案'
  },
  {
    id: 'S2',
    name: 'NPC 選擇',
    icon: <Users className="w-5 h-5" />,
    description: '選擇對話對象'
  },
  {
    id: 'S3',
    name: '引導對話',
    icon: <MessageSquare className="w-5 h-5" />,
    description: '與 NPC 對話探索'
  },
  {
    id: 'S4',
    name: '檔案整理',
    icon: <Archive className="w-5 h-5" />,
    description: '整理收集的資訊'
  },
  {
    id: 'S5',
    name: '反思總結',
    icon: <BookOpen className="w-5 h-5" />,
    description: '反思與總結'
  }
];

interface StageNavigationProps {
  currentStage?: string;
}

export default function StageNavigation({ currentStage }: StageNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { actions } = useMissionStore();

  const handleNavigate = (stageId: StageId) => {
    console.log('[StageNavigation] Navigating to:', stageId);
    actions.goToStage(stageId);
    setIsOpen(false);
  };

  const toggleMenu = () => {
    console.log('[StageNavigation] Toggle menu:', !isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 漂浮按鈕 */}
      <motion.button
        className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-br from-amber-600 to-amber-800 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-amber-500/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        aria-label="開啟導航選單"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* 導航選單面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* 選單內容 */}
            <motion.div
              className="fixed bottom-20 right-6 z-[9999] bg-gradient-to-br from-stone-50 to-amber-50/80 rounded-2xl shadow-2xl border-2 border-amber-200/60 overflow-hidden w-80 backdrop-blur-md"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="p-4 border-b border-amber-200/60 bg-white/40">
                <h3 className="text-lg font-bold text-stone-800 font-serif">階段導航</h3>
                <p className="text-sm text-stone-600 mt-1">快速跳轉到任意階段</p>
              </div>

              <div className="p-2 max-h-[70vh] overflow-y-auto">
                {stages.map((stage, index) => (
                  <motion.button
                    key={stage.id}
                    className={`w-full text-left p-4 rounded-xl mb-2 transition-all duration-200 ${
                      currentStage === stage.id
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg border border-amber-400'
                        : 'bg-white/60 text-stone-700 hover:bg-amber-50 hover:text-stone-900 border border-stone-200/50'
                    }`}
                    onClick={() => handleNavigate(stage.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${currentStage === stage.id ? 'text-white' : 'text-amber-600'}`}>
                        {stage.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-1">{stage.name}</div>
                        <div className={`text-xs ${
                          currentStage === stage.id ? 'text-amber-50' : 'text-stone-500'
                        }`}>
                          {stage.description}
                        </div>
                      </div>
                      {currentStage === stage.id && (
                        <motion.div
                          className="w-2 h-2 rounded-full bg-white shadow-sm"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' }}
                        />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="p-3 border-t border-amber-200/60 bg-white/40">
                <p className="text-xs text-stone-500 text-center font-medium">
                  點擊任意階段即可跳轉
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
