import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '../../store/useChatStore';
import { useMissionStore } from '../../store/useMissionStore';
import { getMissionById } from '../../data/missions';
import { 
  ArrowRight, 
  Search,
  BookOpen,
  Feather,
  History,
  ArrowLeft
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
    "等法律工具，對臺灣進行深入的制度改造。",
    "其中，",
    { type: 'redacted', id: 'field_2' },
    "成為推行土地調查與權力控制的關鍵，透過系統性的調查與登記，",
    "造成了深遠的影響，改變了臺灣社會的權力結構與土地關係。"
  ],
  redactedFields: [
    { id: 'field_1', label: '法律制度', hint: '日本在臺灣建立的特殊法律體系', status: 'missing' },
    { id: 'field_2', label: '執行機構', hint: '負責推行政策的基層', status: 'missing' }
  ]
};

export default function S1_FileDecryption() {
  const { t } = useTranslation();
  const { missionId, actions } = useChatStore();
  const missionActions = useMissionStore(state => state.actions);
  const mission = missionId ? getMissionById(missionId) : null;
  
  const [isScanning, setIsScanning] = useState(true);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Type assertion: prefer mission only if it provides the expected content structure
  // otherwise fall back to the embedded `FALLBACK_MISSION` which contains
  // `contentTemplate` and `redactedFields` used by this view.
  const missionData: S1MissionData = (mission && (mission as any).contentTemplate && (mission as any).contentTemplate.length)
    ? (mission as any)
    : FALLBACK_MISSION;

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

    if (missionActions && typeof missionActions.goToStage === 'function') {
      missionActions.goToStage("S2");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-amber-200 overflow-auto relative">
      <StageNavigation currentStage="S1" />
      
      <div className="absolute inset-0 bg-stone-100 opacity-50 mix-blend-multiply pointer-events-none paper-pattern" />
      <DustParticles />

      <header className="fixed top-0 w-full h-20 bg-[#FDFBF7]/80 backdrop-blur-md z-30 flex items-center justify-between px-8 border-b border-stone-200/60">
        <div className="flex items-center gap-4">
          {/* 返回按鈕 */}
          <button
            onClick={() => actions.goBack()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-600 hover:text-stone-800"
            aria-label={t('common.back_label')}
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium hidden sm:inline">{t('common.back')}</span>
          </button>
          
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center shadow-lg shadow-amber-900/10">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-stone-800 font-serif">{t('s1.title')}</h1>
            <p className="text-xs text-stone-500 tracking-wider uppercase">{t('s1.subtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* status badge removed per design request */}
        </div>
      </header>

      <main className="px-6 relative z-10">
        <div className="min-h-[calc(100vh-5rem)] flex items-center pt-20">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 pt-6 pb-6">

            <div className="lg:col-span-8 perspective-1000">
          <motion.div 
            initial={fadeInRotateX.initial}
            animate={fadeInRotateX.animate}
            transition={fadeInRotateX.transition}
            className="bg-white rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-stone-100 overflow-hidden relative"
            style={{ overflow: 'visible' }}
          >
            <div className="h-2 bg-gradient-to-r from-stone-200 via-amber-100 to-stone-200" />
            
            <div className="p-4 md:p-8 relative">
              
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/30 z-20 flex items-center justify-center backdrop-blur-sm"
                  >
                    <RestoreLoader progress={progress} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none select-none rotate-12">
                 <Feather size={200} />
              </div>

              <div className="mb-6 border-b-2 border-stone-100 pb-3 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2 leading-tight">
                        {missionData.title}
                    </h2>
                    <p className="text-stone-500 font-sans text-sm flex items-center gap-2">
                      <History size={14} /> {t('s1.original_record')}{missionData.period || '日治時期'}
                    </p>
                </div>
                 <div className="text-right hidden md:block">
                   <div className="text-xs font-mono text-stone-400 mb-1">{t('s1.doc_id')}</div>
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
                            initial={{ opacity: 1, filter: 'blur(4px)' }}
                            animate={isScanning ? { opacity: 1, filter: 'blur(4px)' } : { opacity: 1, filter: 'blur(0px)' }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                            className="block mb-2 text-sm text-stone-600 font-mono"
                          >
                            {part}
                          </motion.div>
                        );
                      }

                      return (
                        <motion.span 
                          key={index}
                          initial={{ opacity: 1, filter: 'blur(4px)' }}
                          animate={isScanning ? { opacity: 1, filter: 'blur(4px)' } : { opacity: 1, filter: 'blur(0px)' }}
                          transition={{ duration: 0.45, delay: index * 0.04 }}
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

              <div className="mt-8 flex justify-end opacity-60">
                 <div className="border border-stone-300 p-4 w-32 h-32 flex items-center justify-center rounded-full rotate-[-12deg]">
                    <span className="text-xs font-serif text-amber-900/50 uppercase tracking-widest text-center">
                        Imperial<br/>Archive<br/>Verified
                    </span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
             className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl p-3"
           >
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-stone-100 rounded-full text-stone-600">
                    <Search size={18} />
                </div>
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">{t('s1.file_restoration_title')}</h3>
            </div>
            
            {isScanning ? (
                <div className="text-stone-500 text-sm">
                    {t('s1.analyzing_text')}
                </div>
            ) : (
                <div className="space-y-4">
                   <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                       <div className="text-amber-600 shrink-0 mt-0.5 text-lg">✨</div>
                       <div>
                           <p className="text-amber-900 font-bold text-sm">{t('s1.memory_gaps_found')}</p>
                           <p className="text-amber-700/70 text-xs mt-1 leading-relaxed">
                               {t('s1.memory_gaps_desc')}
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
             className="flex-1 bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 p-4 flex flex-col justify-center relative overflow-hidden"
           >
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-amber-100/50 to-transparent rounded-full blur-3xl transition-transform duration-1000" />

            <div className="relative z-10">
              <div className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                {t('s1.identity_hint')}
              </div>

              <h4 className="text-2xl font-serif font-bold text-stone-900 mb-3">{t('s1.identity_title')}</h4>

              {/* 身分定位 (從測量員改為文官) */}
              <p className="text-stone-600 leading-relaxed mb-4 font-serif">
                {t('s1.identity_desc')}
              </p>

            </div>
          </motion.div>

          <div className="sticky bottom-4 z-40">
            <motion.button
              onClick={handleStartInvestigation}
              disabled={isScanning}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-white font-bold tracking-wide transition-all duration-300 ${
                isScanning 
                  ? 'bg-stone-300 cursor-not-allowed' 
                  : 'bg-[#2C2420] hover:bg-[#433833] shadow-amber-900/20'
              }`}
            >
              {isScanning ? (
                  <span className="text-stone-500">{t('s1.computing')}</span>
              ) : (
                  <>
                      <span>{t('s1.start_investigation')}</span>
                      <ArrowRight size={18} className="text-amber-500" />
                  </>
              )}
            </motion.button>
          </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
