import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  History, 
  Share2,
  CheckCircle2,
  Quote,
  Sparkles,
  FileCheck
} from 'lucide-react';

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
  id: "ARCHIVE-1923-SEC-FULL",
  title: "治警事件：歷史修復報告",
  summary: "透過本次修復行動，我們成功還原了1923年知識份子在《治安警察法》壓制下，仍堅持非暴力抗爭的歷史真相。這份檔案不僅記錄了逮捕過程，更見證了台灣民主運動早期的法治精神啟蒙。",
  integrity: "100%"
};

// 最終典藏卡 (Museum Card) - 改為展示修復成果
const MuseumCard = () => {
  const todayDate = useMemo(() => getTodayDate(), []);

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
      className="bg-white p-8 md:p-12 rounded-sm shadow-2xl border border-stone-200 relative overflow-hidden max-w-2xl mx-auto transform rotate-1"
    >
      <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-600 via-amber-700 to-stone-800" />
      <div className="absolute -right-10 -bottom-10 opacity-[0.07] pointer-events-none">
        <History size={300} />
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-bl-full z-0" />

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-500 text-[10px] font-mono uppercase tracking-widest rounded">
              Archive ID: {ARCHIVE_INFO.id}
            </span>
            <span className="px-2 py-0.5 bg-green-100 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-1">
              <CheckCircle2 size={10} /> Restored
            </span>
          </div>
          <h3 className="font-serif font-bold text-3xl md:text-4xl text-stone-900 leading-tight">
            {ARCHIVE_INFO.title}
          </h3>
        </div>
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 shadow-sm">
          <Award size={28} className="text-amber-600" />
        </div>
      </div>

      <div className="bg-[#F9F7F2] p-8 rounded-lg border-l-4 border-stone-800 mb-8 relative">
        <Quote className="absolute top-4 right-4 text-stone-200 w-10 h-10" />
        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Restoration Summary</h4>
        <p className="font-serif text-stone-800 leading-loose text-base md:text-lg text-justify">
          {ARCHIVE_INFO.summary}
        </p>
        
        <div className="mt-6 flex items-center gap-4 pt-4 border-t border-stone-200/50">
          <div>
            <div className="text-[10px] font-bold text-stone-400 uppercase">Integrity</div>
            <div className="text-xl font-bold font-mono text-amber-600">{ARCHIVE_INFO.integrity}</div>
          </div>
          <div className="w-px h-8 bg-stone-200" />
          <div>
            <div className="text-[10px] font-bold text-stone-400 uppercase">Restored Date</div>
            <div className="text-base font-serif text-stone-700">{todayDate}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-1 text-amber-500">
          {[...Array(5)].map((_, i) => <Sparkles key={i} size={16} fill="currentColor" />)}
        </div>
        <div className="text-xs font-mono text-stone-400 flex items-center gap-2">
          <FileCheck size={14} />
          VERIFIED BY SYSTEM
        </div>
      </div>
      
      <motion.div 
        initial={{ scale: 3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
        className="absolute bottom-8 right-8 border-4 border-red-800/70 text-red-800 rounded-full w-32 h-32 flex items-center justify-center p-2 mix-blend-multiply rotate-[-12deg] z-20 pointer-events-none backdrop-blur-[1px]"
      >
        <div className="border-2 border-red-800/40 w-full h-full rounded-full flex flex-col items-center justify-center text-center">
          <span className="text-xs font-black uppercase tracking-[0.2em] mb-1">Museum</span>
          <span className="text-2xl font-black uppercase tracking-widest leading-none">Collection</span>
          <span className="text-[10px] font-mono mt-1 font-bold">APPROVED</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function S5_ViewpointVerification() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-amber-200 overflow-hidden relative flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-100/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

      <header className="h-20 flex items-center justify-center px-8 border-b border-stone-200/50 bg-[#FDFBF7]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-600 rounded flex items-center justify-center text-white shadow-md">
            <Award size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-stone-800">MISSION COMPLETE</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-12 flex flex-col items-center justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10 space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-stone-800 text-amber-50 rounded-full text-xs font-bold tracking-wider shadow-lg mb-2">
            <Sparkles size={12} />
            <span>歷史修復任務完成</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-800">
            檔案已永久歸檔
          </h2>
          <p className="text-stone-500 font-serif">感謝您的參與，這段歷史因您而清晰。</p>
        </motion.div>

        <MuseumCard />

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 flex gap-4"
        >
           <button className="px-6 py-3 bg-white hover:bg-stone-50 text-stone-600 border border-stone-200 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
              <Share2 size={18} /> 分享成就
           </button>
           <button className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <History size={18} /> 返回任務大廳
           </button>
        </motion.div>

      </main>
    </div>
  );
}
