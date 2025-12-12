import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Share2, History, ArrowLeft } from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';
import { useChatStore } from '../../store/useChatStore';
import clearGameData from '../../utils/clearGameData';
import { useNotebookStore } from '../../store/useNotebookStore';
import { useMultiChatStore } from '../../store/useMultiChatStore';

// --- UTILS ---
// 獲取並格式化今日日期 (YYYY.MM.DD)
const getTodayDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// --- MOCK DATA ---
const ARCHIVE_INFO = {
  id: 'LAW-1905-SIXCODES',
  title: '日本統治下的權利與土地：歷史修復任務',
  summary:
    '透過本次修復行動，我們成功還原了1905年日本治下的權利與土地狀況。',
  integrity: '100%'
};

// 最終典藏卡 (Museum Card) - 精簡版，移除裝飾性小圖示
const MuseumCard = () => {
  const todayDate = useMemo(() => getTodayDate(), []);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 6 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
      className="relative bg-white p-8 md:p-12 rounded-lg shadow-xl border border-stone-200 max-w-2xl mx-auto overflow-hidden"
    >
      <div className="relative z-10">
        <h3 className="font-serif font-bold text-3xl md:text-4xl text-stone-900 leading-tight">
          {ARCHIVE_INFO.title}
        </h3>
        <div className="mt-2 text-sm text-stone-500">典藏編號: {ARCHIVE_INFO.id}</div>

        <div className="bg-[#F9F7F2] p-6 rounded mt-6 border-l-4 border-stone-800">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">修復摘要</h4>
          <p className="font-serif text-stone-800 leading-relaxed text-base md:text-lg">
            {ARCHIVE_INFO.summary}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <div className="text-[10px] font-bold text-stone-400 uppercase">完整度</div>
            <div className="text-xl font-bold font-mono text-amber-600">{ARCHIVE_INFO.integrity}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-stone-400 uppercase">修復日期</div>
            <div className="text-base font-serif text-stone-700">{todayDate}</div>
          </div>
        </div>
      </div>

      {/* 蓋章特效 */}
      <motion.div 
        // 初始狀態：放大 2 倍且透明 (模擬印章還沒蓋下去的樣子)
        initial={{ scale: 2, opacity: 0 }}
        
        // 結束狀態：恢復原狀且完全顯示 (用力蓋下去)
        animate={{ scale: 1, opacity: 1 }}
        
        // 動畫設定：
        // delay: 0.5 (延遲 0.5 秒執行，讓畫面先出來)
        // type: "spring" (彈簧效果，讓蓋章有「頓」一下的力道感)
        transition={{ delay: 0.5, type: "spring" }}
        
        // 樣式設定：
        // mix-blend-multiply: 讓紅色印泥與底紙混合，更有真實感
        // rotate-[-12deg]: 稍微旋轉，因為人蓋章通常不會完全正
        className="absolute bottom-4 right-4 border-2 border-red-800/60 text-red-800 rounded-full w-24 h-24 flex items-center justify-center p-1 mix-blend-multiply rotate-[-12deg] z-20"
      >
        <div className="border border-red-800/40 w-full h-full rounded-full flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest">Museum<br/>Collection</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function S5_ViewpointVerification() {
  const missionStore = useMissionStore();
  const { actions } = useChatStore();

  const clearPlayRecords = () => {
    // Prefer the centralized helper which also calls store reset methods
    try {
      const result = clearGameData();
      // also remove common persist: prefixed keys in case they're present
      const extraRemoved: string[] = [];
      ['notebook-store', 'mission-store', 'chat-store', 'multi-chat-store', 'ChatStore', 'MissionStore', 'NotebookStore'].forEach(k => {
        const withPrefix = `persist:${k}`;
        if (localStorage.getItem(withPrefix) !== null) {
          localStorage.removeItem(withPrefix);
          extraRemoved.push(withPrefix);
        }
        if (localStorage.getItem(k) !== null) {
          localStorage.removeItem(k);
          extraRemoved.push(k);
        }
      });

      // clear sessionStorage as well (defensive)
      try { sessionStorage.clear(); } catch (e) { /* ignore */ }

      const removed = (result && (result as any).removed) ? [(result as any).removed, ...extraRemoved].flat() : extraRemoved;
      console.log('clearPlayRecords removed:', removed);
      return removed;
    } catch (e) {
      console.warn('clearPlayRecords error', e);
      return [];
    }
  };

  const handleResetAndReload = async (targetStage: 'S1' | 'S0') => {
    try {
      // Centralized clear
      const result = clearGameData();

      // extra defensive removals
      const removedExtra: string[] = [];
      Object.keys(localStorage).forEach((k) => {
        if (/store|persist/i.test(k)) {
          localStorage.removeItem(k);
          removedExtra.push(k);
        }
      });
      try { sessionStorage.clear(); } catch (e) { /* ignore */ }

      // Ensure in-memory stores are reset
      try { useNotebookStore.getState().actions.resetNotebook(); } catch (e) {}
      try { useMissionStore.getState().actions.resetMission(); } catch (e) {}
      try { useChatStore.getState().actions.reset(); } catch (e) {}
      try { useMultiChatStore.getState().actions.reset(); } catch (e) {}

      console.log('resetAndClear result:', (result && (result as any).removed) ? (result as any).removed.concat(removedExtra) : removedExtra);

      // navigate state if possible, then reload after short delay
      try {
        if (targetStage === 'S1') missionStore.actions.goToStage('S1');
        else missionStore.actions.goToStage('S0');
      } catch (e) { /* ignore */ }

      await new Promise((r) => setTimeout(r, 300));
      location.reload();
    } catch (e) {
      console.warn('handleResetAndReload failed', e);
      location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-amber-200 overflow-hidden relative flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-100/30 via-transparent to-transparent pointer-events-none" />

      {/* 返回按鈕（左上角） */}
      <button
        onClick={() => actions.goBack()}
        className="fixed top-6 left-6 z-30 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-md transition-all text-stone-600 hover:text-stone-800 border border-stone-200"
        aria-label="返回上一頁"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium hidden sm:inline">返回</span>
      </button>

      <header className="h-20 flex items-center justify-center px-8 border-b border-stone-200/50 bg-[#FDFBF7]/80 backdrop-blur-md z-50">
        <div>
          {/* header intentionally left minimal */}
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-12 flex flex-col items-center justify-center relative z-10">
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            <MuseumCard />
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => {
                handleResetAndReload('S1');
              }}
              className="px-6 py-3 bg-white hover:bg-stone-50 text-stone-600 border border-stone-200 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
            >
              <Share2 size={18} /> 重新開始
            </button>

            <button
              onClick={() => {
                handleResetAndReload('S0');
              }}
              className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              <History size={18} /> 返回任務大廳
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

