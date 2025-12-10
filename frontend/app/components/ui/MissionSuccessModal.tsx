import React from 'react';
import { motion } from 'framer-motion';
import { FolderCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  onClose: () => void;
  onContinue: () => void;
  npcName?: string;
}

const MissionSuccessModal: React.FC<Props> = ({ onClose, onContinue, npcName = 'NPC' }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
      >
        {/* 頂部裝飾線 */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-emerald-800" />
        
        <div className="p-8 text-center">
          {/* Icon Animation */}
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border-2 border-dashed border-emerald-200 rounded-full"
            />
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <FolderCheck size={32} />
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md"
            >
              <CheckCircle2 size={20} className="text-emerald-600 fill-emerald-100" />
            </motion.div>
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
            訪談任務完成
          </h2>
          <p className="text-stone-500 text-sm font-serif mb-6 leading-relaxed">
            您已成功蒐集所有關鍵線索。<br/>檔案修復程序 (S4) 已準備就緒。
          </p>

          <div className="space-y-3">
             {/* 主要按鈕：前往 S4 */}
             <button 
               onClick={onContinue}
               className="w-full bg-stone-800 hover:bg-stone-700 text-white py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 font-bold tracking-wide group transition-all"
             >
               <span>前往檔案修復 (S4)</span>
               <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </button>

             {/* 次要按鈕：繼續對話 */}
             <button 
               onClick={onClose}
               className="w-full py-2.5 text-stone-400 hover:text-stone-600 text-xs font-bold tracking-wider flex items-center justify-center gap-1 transition-colors hover:underline decoration-stone-300 underline-offset-4"
             >
               暫時停留，繼續與 {npcName} 對話
             </button>
          </div>
        </div>

        {/* 蓋章特效 */}
        <motion.div 
          initial={{ scale: 2, opacity: 0, rotate: 20 }}
          animate={{ scale: 1, opacity: 1, rotate: -12 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
          className="absolute top-6 right-6 pointer-events-none mix-blend-multiply opacity-10 md:opacity-100"
        >
          <div className="w-20 h-20 border-4 border-emerald-700/60 text-emerald-800 rounded-full flex items-center justify-center p-1 mask-image opacity-80">
            <div className="border border-emerald-700/40 w-full h-full rounded-full flex flex-col items-center justify-center text-center -rotate-6">
              <span className="text-[8px] font-bold uppercase tracking-widest">Inquiry</span>
              <span className="text-xs font-black uppercase tracking-widest leading-none">Done</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MissionSuccessModal;
