import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';
import { useMissionStore } from '../../store/useMissionStore';
import { getMissionById } from '../../data/missions';
import { 
  ArrowRight, 
  Search,
  BookOpen,
  Feather,
  History
} from 'lucide-react';

import './s1.css';
import { fadeInRotateX, redactedBackdropAnim, dustParticleTransition } from './animations';
import RestoreLoader from './subcomponents/RestoreLoader';
import RedactedBlock from './subcomponents/RedactedBlock';
import DustParticles from './subcomponents/DustParticles';
import StageNavigation from '../ui/StageNavigation';

interface RedactedField {
  id: string;
  label: string;
  hint: string;
  status: string;
}

interface S1MissionData {
  id: string;
  title: string;
  period: string;
  description?: string;
  contentTemplate: (string | { type: string; id: string })[];
  redactedFields: RedactedField[];
}

// --- FALLBACK MISSION DATA ---
const FALLBACK_MISSION: S1MissionData = {
  id: "E2",
  title: "日本統治下的權利與土地：歷史修復任務",
  description: "本案聚焦於獨特的法律體系對土地與民權的影響，部分檔案因年代久遠而出現多處缺漏。",
  period: "日治初期 (1905年)",
  contentTemplate: [
    "檔案編號：LAW-1905-SIXCODES",
    "在日治初期，日本總督府透過",
    { type: 'redacted', id: 'field_1' },
    "等法律工具，對臺灣進行深入的制度改造。其中，",
    { type: 'redacted', id: 'field_2' },
    "成為推行土地調查與權力控制的關鍵群體",
    // { type: 'redacted', id: 'field_3' },
    // "造成了深遠的影響。"
  ],
  redactedFields: [
    { id: 'field_1', label: '法律制度', hint: '日本在臺灣建立的特殊法律體系', status: 'missing' },
    { id: 'field_2', label: '執行機構', hint: '負責推行政策的基層', status: 'missing' },
    // { id: 'field_3', label: '影響對象', hint: '受到政策直接影響的人群或區域', status: 'missing' }
  ]
};

export default function S1_FileDecryption() {
  const { missionId, actions } = useChatStore();
  const missionActions = useMissionStore(state => state.actions);
  const mission = missionId ? getMissionById(missionId) : null;
  
  const [isScanning, setIsScanning] = useState(true);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Type assertion: use S1MissionData type for the mission data
  const missionData: S1MissionData = (mission as any) || FALLBACK_MISSION;

  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsScanning(false), 800);
            return 100;
          }
          return prev + 1;
        });
      }, 40);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const activeField = missionData.redactedFields?.find(f => f.id === hoveredFieldId);

  const handleStartInvestigation = () => {
    // Ensure mission store knows about the mission, then switch both stores to S2
    try {
      if (missionId && missionActions && typeof missionActions.initializeMission === 'function') {
        missionActions.initializeMission(missionId);
      }
    } catch (e) {
      // ignore initialization errors
    }

    actions.goToStage("S2");
    if (missionActions && typeof missionActions.goToStage === 'function') {
      missionActions.goToStage("S2");
    }
  };

  return (
    <div className="h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-amber-200 overflow-hidden relative">
      <StageNavigation currentStage="S1" />
      
      <div className="absolute inset-0 bg-stone-100 opacity-50 mix-blend-multiply pointer-events-none paper-pattern" />
      <DustParticles />

      <header className="fixed top-0 w-full h-20 bg-[#FDFBF7]/80 backdrop-blur-md z-30 flex items-center justify-between px-8 border-b border-stone-200/60">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center shadow-lg shadow-amber-900/10">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-stone-800 font-serif">歷史對話系統</h1>
            <p className="text-xs text-stone-500 tracking-wider uppercase">Archive Repair V2.2</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className={`px-4 py-1.5 rounded-full border transition-all duration-500 flex items-center gap-2 ${isScanning ? 'bg-stone-100 border-stone-200' : 'bg-red-50 border-red-200 text-red-800'}`}>
             <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`}></span>
             <span className="text-xs font-semibold tracking-wide">
               {isScanning ? '檔案修復中...' : '偵測到歷史斷層'}
             </span>
           </div>
        </div>
      </header>

      <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10 overflow-hidden h-full">
        
        <div className="lg:col-span-8 perspective-1000">
          <motion.div 
            initial={fadeInRotateX.initial}
            animate={fadeInRotateX.animate}
            transition={fadeInRotateX.transition}
            className="bg-white rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-stone-100 overflow-hidden relative"
            style={{ maxHeight: 'calc(100vh - 160px)', overflow: 'auto' }}
          >
            <div className="h-2 bg-gradient-to-r from-stone-200 via-amber-100 to-stone-200" />
            
            <div className="p-10 md:p-16 relative">
              
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#FDFBF7] z-20 flex items-center justify-center backdrop-blur-[1px]"
                  >
                    <RestoreLoader progress={progress} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none select-none rotate-12">
                 <Feather size={200} />
              </div>

              <div className="mb-12 border-b-2 border-stone-100 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-stone-800 mb-3 leading-tight">
                        {missionData.title}
                    </h2>
                    <p className="text-stone-500 font-sans text-sm flex items-center gap-2">
                      <History size={14} /> 原始紀錄歸檔：{missionData.period || '日治時期'}
                    </p>
                </div>
                 <div className="text-right hidden md:block">
                   <div className="text-xs font-mono text-stone-400 mb-1">DOC_ID</div>
                   <div className="text-lg font-serif font-bold text-stone-700 whitespace-nowrap">#1905-{missionData.id || 'SEC'}</div>
                 </div>
              </div>

              <div className="font-serif text-xl leading-relaxed text-stone-700 space-y-2 relative">
                <div className="absolute left-[-20px] top-0 bottom-0 w-[1px] bg-red-500/10 hidden md:block" />
                
                <div>
                  {missionData.contentTemplate?.map((part: any, index: number) => {
                    if (typeof part === 'string') {
                      const isDocId = part.trim().startsWith('檔案編號：');
                      // If it's the doc id line, render as its own block to force a newline after it
                      if (isDocId) {
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, filter: 'blur(4px)' }}
                            animate={!isScanning ? { opacity: 1, filter: 'blur(0px)' } : {}}
                            transition={{ duration: 0.9, delay: index * 0.05 }}
                            className="block mb-4 text-sm text-stone-600 font-mono"
                          >
                            {part}
                          </motion.div>
                        );
                      }

                      return (
                        <motion.span 
                          key={index}
                          initial={{ opacity: 0, filter: 'blur(4px)' }}
                          animate={!isScanning ? { opacity: 1, filter: 'blur(0px)' } : {}}
                          transition={{ duration: 1.5, delay: index * 0.08 }}
                          className="inline-block mr-2 whitespace-pre-wrap"
                        >
                          {part}
                        </motion.span>
                      );
                    } else if (part.type === 'redacted') {
                      const field = missionData.redactedFields?.find((f: any) => f.id === part.id);
                      return (
                        <span key={index} className="inline-block align-baseline mr-2">
                          <RedactedBlock 
                            field={field} 
                            isHovered={hoveredFieldId === field?.id}
                            onHover={setHoveredFieldId}
                          />
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              <div className="mt-20 flex justify-end opacity-60">
                 <div className="border border-stone-300 p-4 w-32 h-32 flex items-center justify-center rounded-full rotate-[-12deg]">
                    <span className="text-xs font-serif text-amber-900/50 uppercase tracking-widest text-center">
                        Imperial<br/>Archive<br/>Verified
                    </span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
             className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-stone-100 rounded-full text-stone-600">
                    <Search size={18} />
                </div>
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">修復診斷報告</h3>
            </div>
            
            {isScanning ? (
                <div className="text-stone-500 text-sm">
                    正在分析文本結構完整性...
                </div>
            ) : (
                <div className="space-y-4">
                   <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                       <div className="text-amber-600 shrink-0 mt-0.5 text-lg">✨</div>
                       <div>
                           <p className="text-amber-900 font-bold text-sm">發現 2 處記憶斷層</p>
                           <p className="text-amber-700/70 text-xs mt-1 leading-relaxed">
                               檔案因年代久遠而模糊不清，請透過人物訪談來重建當時的場景細節。
                           </p>
                       </div>
                   </div>
                </div>
            )}
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.5 }}
             className="flex-1 bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 p-8 flex flex-col justify-center relative overflow-hidden group"
          >
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-amber-100/50 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

             <AnimatePresence mode='wait'>
              {activeField ? (
                <motion.div
                  key={activeField.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative z-10"
                >
                  <div className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Target Analysis
                  </div>
                  <h4 className="text-2xl font-serif font-bold text-stone-900 mb-3">{activeField.label}</h4>
                  <p className="text-stone-600 leading-relaxed mb-6 font-serif">
                    {activeField.hint}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                     <div className="h-[1px] w-8 bg-stone-300" />
                     Waiting for Input
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center mb-2">
                      <Search size={24} className="text-stone-300" />
                  </div>
                  <p className="text-stone-500 font-serif">
                      請移動滑鼠至左側<br/>
                      <span className="text-amber-600 font-bold">迷霧區塊</span> 查看線索
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.button
            onClick={handleStartInvestigation}
            disabled={isScanning}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-5 rounded-xl shadow-lg flex items-center justify-center gap-3 text-white font-bold tracking-wide transition-all duration-300 ${
              isScanning 
                ? 'bg-stone-300 cursor-not-allowed' 
                : 'bg-[#2C2420] hover:bg-[#433833] shadow-amber-900/20'
            }`}
          >
            {isScanning ? (
                <span className="text-stone-500">系統運算中...</span>
            ) : (
                <>
                    <span>開始歷史調查</span>
                    <ArrowRight size={18} className="text-amber-500" />
                </>
            )}
          </motion.button>

        </div>
      </main>
    </div>
  );
}
