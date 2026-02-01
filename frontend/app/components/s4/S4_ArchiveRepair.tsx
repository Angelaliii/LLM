import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';
import { useMissionStore } from '../../store/useMissionStore';
import { useNotebookStore } from '../../store/useNotebookStore';
import { getMissionById } from '../../data/missions';
import { CheckCircle2, XCircle, HelpCircle, Database, ArrowRight, ArrowLeft } from 'lucide-react';
import DraggableClue from './subcomponents/DraggableClue';
import DropZone from './subcomponents/DropZone';
import './s4.css';
import StageNavigation from '../ui/StageNavigation';

// S4 archive repair configuration
interface ArchiveField {
  id: string;
  label: string;
  correctText: string;
  correctClueId: string;
}

interface ClueCard {
  id: string;
  text: string;
  type: 'key' | 'info';
  source: string;
}

export default function S4_ArchiveRepair() {
  const { selectedNpcId, actions } = useChatStore();
  const { currentMissionId, actions: missionActions } = useMissionStore();
  const { informationGaps, collectedClues } = useNotebookStore();
  const mission = currentMissionId ? getMissionById(currentMissionId) : null;

  // Pull clues from the notebook and normalize shape
  const clues: ClueCard[] = React.useMemo(() => {
    const notebookClues = Object.values(collectedClues);
    if (notebookClues.length === 0) {
      // Provide a default set when no clues are collected
      return [
        { id: 'clue_A', text: 'Law No. 63', type: 'key', source: 'Legal Archive' },
        { id: 'clue_B', text: 'Police System', type: 'key', source: 'Administrative Record' },

      ];
    }
    
    return notebookClues.map(clue => ({
      id: clue.id,
      text: clue.text,
      type: clue.type === 'fact' ? 'key' as const : 'info' as const,
      source: clue.source
    }));
  }, [collectedClues]);

  // Dynamically build fields based on collected clues
  const [fields, setFields] = useState<ArchiveField[]>(() => {
    const keyClues = Object.values(collectedClues).filter(clue => clue.type === 'fact');
    
    if (keyClues.length === 0) {
      // Default configuration when no key clues are available
      return [
        {
          id: 'field_1',
          label: 'Legal Instrument',
          correctText: 'Law No. 63',
          correctClueId: 'clue_A'
        },
        {
          id: 'field_2',
          label: 'Key Group',
          correctText: 'Police System',
          correctClueId: 'clue_B'
        }
      ];
    }

    // Build fields from the collected key clues
    return keyClues.slice(0, 3).map((clue, index) => ({
      id: `field_${index + 1}`,
      label: `Record ${index + 1}`,
      correctText: clue.text,
      correctClueId: clue.id
    }));
  });

  // Initialize field state keyed to the current fields
  const makeInitialFieldStates = (flds: ArchiveField[]) => {
    return flds.reduce((acc, f) => {
      acc[f.id] = { status: 'empty' };
      return acc;
    }, {} as Record<string, { status: 'empty' | 'filled'; filledBy?: string }>);
  };

  const [fieldStates, setFieldStates] = useState<Record<string, { status: 'empty' | 'filled'; filledBy?: string }>>(() =>
    makeInitialFieldStates(fields)
  );

  // Safe accessor for field state to avoid reading undefined when `fields` updates
  const getFieldState = (id?: string) => {
    if (!id) return { status: 'empty' } as { status: 'empty' };
    return fieldStates[id] ?? { status: 'empty' } as { status: 'empty' | 'filled' };
  };

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const autoProgressedRef = useRef(false); // 使用 ref 避免 re-render 干擾

  // Progress is tied to the field list to stay in sync
  const filledCount = fields.filter(f => fieldStates[f.id]?.status === 'filled').length;
  const totalCount = fields.length || 1;
  const progress = Math.round((filledCount / Math.max(totalCount, 1)) * 100);

  // Handle drag end
  const handleDragEnd = (event: any, clue: ClueCard, fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    // More flexible validation: match by ID or matching text content
    const isCorrect = clue.id === field.correctClueId || 
                     clue.text.includes(field.correctText) ||
                     field.correctText.includes(clue.text);

    if (isCorrect) {
      setFieldStates(prev => ({
        ...prev,
        [fieldId]: { status: 'filled', filledBy: clue.id }
      }));
      setFeedback({ type: 'success', msg: 'Restoration successful: the clue fits.' });
      
      // If this came from the notebook, mark it as used (trace only)
      if (collectedClues[clue.id]) {
        console.log(`Notebook clue ${clue.id} applied to repair.`);
      }
    } else {
      setFeedback({ type: 'error', msg: "Error: the clue doesn't match this gap. Try another." });
      triggerErrorEffect(fieldId);
    }

    setTimeout(() => setFeedback(null), 3000);
  };

  // Global drop listener (sent by DropZone) to support HTML5 dataTransfer
  useEffect(() => {
    const onDropEvent = (e: Event) => {
      const ev = e as CustomEvent<{ fieldId: string; clueId: string }>;
      const { fieldId, clueId } = ev.detail || {};
      if (!fieldId || !clueId) return;

      const clue = clues.find(c => c.id === clueId);
      if (!clue) return;

      // Reset dragging state and process the drop
      setIsDragging(false);
      handleDragEnd(null, clue, fieldId);
    };

    window.addEventListener('s4-drop', onDropEvent as EventListener);
    return () => window.removeEventListener('s4-drop', onDropEvent as EventListener);
  }, [clues, fieldStates]);

  const triggerErrorEffect = (fieldId: string) => {
    const el = document.getElementById(`dropzone-${fieldId}`);
    if (el) {
      el.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(0)' }
        ],
        { duration: 300 }
      );
    }
  };

  const handleReset = () => {
    setFieldStates(makeInitialFieldStates(fields));
    setFeedback(null);
  };

  const handleComplete = () => {
    if (progress === 100) {
      // 只調用 missionActions，它會自動同步到 ChatStore
      console.info('[S4] handleComplete triggered - progress=100, goToStage S5');
      try {
        missionActions.goToStage("S5");
        console.info('[S4] ✅ called missionStore.actions.goToStage("S5")');
      } catch (e) {
        console.warn('[S4] ❌ missionStore.actions.goToStage failed', e);
      }
    }
  };

  // Auto-play stamp animation and transition to S5 at 100% progress
  useEffect(() => {
    console.info('[S4] useEffect triggered - progress:', progress, 'autoProgressedRef.current:', autoProgressedRef.current);
    
    if (progress === 100 && !autoProgressedRef.current) {
      console.info('[S4] ✅ Setting up auto-transition timer (2400ms)');
      autoProgressedRef.current = true;
      
      // Allow the animation to show before auto-transition
      const t = setTimeout(() => {
        console.info('[S4] ⏰ auto-transition timeout reached, goToStage S5');
        try {
          missionActions.goToStage("S5");
          console.info('[S4] ✅ called missionStore.actions.goToStage("S5")');
        } catch (e) {
          console.warn('[S4] ❌ missionStore.actions.goToStage failed', e);
        }
      }, 2400);

      return () => {
        console.info('[S4] Clearing auto-transition timer');
        clearTimeout(t);
      };
    }
  }, [progress, actions, missionActions]);

  if (!mission) {
    console.warn('[S4] Mission not found. currentMissionId:', currentMissionId);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-primary-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Mission could not be loaded</p>
          <p className="text-sm text-gray-500 mb-6">
            {currentMissionId ? `Mission not found: ${currentMissionId}` : 'No mission selected'}
          </p>
          <button
            onClick={() => {
              actions.goToStage("S0");
              missionActions.resetMission();
            }}
            className="btn-primary"
          >
            Back to missions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-amber-200 overflow-hidden relative flex flex-col">
      <StageNavigation currentStage="S4" />
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] opacity-30 pointer-events-none" />

      {/* Back button (top-left) */}
      <button
        onClick={() => actions.goBack()}
        className="fixed top-6 left-6 z-30 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-md transition-all text-stone-600 hover:text-stone-800 border border-stone-200"
        aria-label="Back to previous page"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium hidden sm:inline">Back</span>
      </button>

      {/* Top bar */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-stone-200 flex items-center justify-between px-8 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center text-amber-50 shadow-lg">
            <Database size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-stone-800">ARCHIVE REPAIR</h1>
            <p className="text-[10px] text-stone-500 font-mono">S4 / DRAG EVIDENCE TO RESTORE</p>
          </div>
        </div>

        {/* 進度與狀態 */}
        <div className="flex items-center gap-6">
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm ${
                feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {feedback.msg}
            </motion.div>
          )}

          <div className="flex flex-col items-end">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Integrity</div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-700"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                />
              </div>
              <span className="text-sm font-bold font-mono text-stone-700">{progress}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主工作區 */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        {/* 左側：待修復檔案 */}
        <div className="lg:col-span-8 flex flex-col">
          <motion.div
            layout
            className="bg-white rounded-sm shadow-xl border border-stone-100 min-h-[600px] p-12 relative overflow-hidden"
          >
            {/* 紙張質感 */}
            <div className="absolute inset-0 bg-stone-50 opacity-50 mix-blend-multiply pointer-events-none" />

            {/* Archive header */}
            <div className="border-b-2 border-stone-800 pb-4 mb-8 flex justify-between items-end relative z-10">
              <h2 className="text-3xl font-serif font-bold text-stone-900">Early Japanese Rule: Rights and Land Report</h2>
              <div className="text-xs font-mono text-stone-500">CONFIDENTIAL // REPAIR_MODE</div>
            </div>

            {/* Archive content */}
            <div className="font-serif text-xl leading-[2.5] text-stone-700 relative z-10">
              <div>
                File ID: LAW-1905-SIXCODES
                <br />
                During early Japanese rule, the Government-General used
                <DropZone
                  fieldId={fields[0]?.id ?? 'field_1'}
                  status={getFieldState(fields[0]?.id).status}
                  config={fields[0]}
                  highlight={isDragging && getFieldState(fields[0]?.id).status === 'empty'}
                />
                and other legal instruments to conduct deep institutional transformation in Taiwan.
                <br />
                <br />
                Among them,
                <DropZone
                  fieldId={fields[1]?.id ?? 'field_2'}
                  status={getFieldState(fields[1]?.id).status}
                  config={fields[1]}
                  highlight={isDragging && getFieldState(fields[1]?.id).status === 'empty'}
                />
                became the key force for land surveys and power consolidation, profoundly affecting the grassroots structure of Taiwanese society at that time.
              </div>
            </div>

            {/* 修復完成印章 */}
            <AnimatePresence>
              {progress === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 2, rotate: 20 }}
                  animate={{ opacity: 1, scale: 1, rotate: -12 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="absolute bottom-16 right-16 border-4 border-red-800/80 text-red-800 rounded-full w-40 h-40 flex items-center justify-center p-2 mix-blend-multiply opacity-80"
                >
                  <span className="text-xs font-serif font-bold text-center leading-none uppercase tracking-widest">
                    Restoration<br />
                    Complete<br />
                    ✓
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right side: clue cards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg border border-stone-100 p-6 shadow-lg"
          >
            <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
              <HelpCircle size={20} className="text-amber-600" />
              Notebook: Collected Clues
              <span className="ml-auto text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded">
                {Object.keys(collectedClues).length} clues
              </span>
            </h3>

            {Object.keys(collectedClues).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No clues collected yet</p>
                <p className="text-sm mt-1">Complete stages S1–S3 to gather clues.</p>
              </div>
            )}

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {clues
                  .filter(clue => !Object.values(fieldStates).some(f => f.filledBy === clue.id))
                  .map((clue, index) => (
                    <DraggableClue
                      key={clue.id}
                      clue={clue}
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={(fieldId) => {
                        setIsDragging(false);
                        handleDragEnd(null, clue, fieldId);
                      }}
                      index={index}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleReset}
              className="w-full px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg transition-colors"
            >
              Reset
            </button>

            <motion.button
              onClick={handleComplete}
              disabled={progress < 100}
              whileHover={progress === 100 ? { scale: 1.05 } : {}}
              whileTap={progress === 100 ? { scale: 0.95 } : {}}
              className={`w-full px-4 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                progress === 100
                  ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>
                {progress === 100 ? 'Archive restored – proceed to S5' : `Progress ${progress}%`}
              </span>
              {progress === 100 && <ArrowRight size={18} />}
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}
