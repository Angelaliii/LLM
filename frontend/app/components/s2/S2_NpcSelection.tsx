import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';
import { useMissionStore } from '../../store/useMissionStore';
import { getMissionById } from '../../data/missions';
import { ArrowRight, Info, ArrowLeft } from 'lucide-react';
import NpcCard from './subcomponents/NpcCard';
import './s2.css';
import StageNavigation from '../ui/StageNavigation';

interface NpcData {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  description: string;
  traits?: string[];
  color?: string;
  icon?: any;
}

export default function S2_NpcSelection() {
  const { currentMissionId, actions: missionActions } = useMissionStore();
  const { actions } = useChatStore();
  const mission = currentMissionId ? getMissionById(currentMissionId) : null;
  
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const [availableNpcs, setAvailableNpcs] = useState<NpcData[]>([]);
  const [currentStage, setCurrentStage] = useState<any>(null);

  // 獲取當前階段的 NPC 列表
  useEffect(() => {
    if (!mission) return;

    // 找到 stage_2_power 或 stage_1_intro（根據任務進度）
    const stage = mission.stages.find((s: any) => 
      s.id === 'stage_2_power' || s.id === 'stage_1_intro'
    ) || mission.stages[0];
    
    setCurrentStage(stage);

    // 從後端知識庫或本地數據映射 NPC
    const npcMap: Record<string, NpcData> = {
      'police_officer': {
        id: 'police_officer',
        name: 'Sato Keiichi',
        role: 'Japanese Police Officer',
        avatar: '/assets/images/police.png',
        description: 'Japanese police officer executing the Governor-General’s orders; wields significant authority and commands respect.',
        traits: ['Serious', 'Bureaucratic', 'Law-savvy'],
        color: 'from-slate-700 to-slate-900'
      },
      'student': {
        id: 'student',
        name: 'Xiao Qing',
        role: 'Public School Student',
        avatar: '/assets/images/student.png',
        description: 'A public school student in Tainan City who can share grassroots Taiwanese perspectives on daily life.',
        traits: ['Innocent', 'Curious', 'Respects authority'],
        color: 'from-emerald-600 to-emerald-800'
      },
      'land_surveyor': {
        id: 'land_surveyor',
        name: 'Yamamoto Kansuke',
        role: 'Land Surveyor',
        avatar: '/assets/images/Cadastral_surveyor.png',
        description: 'Conducts land surveys and forest investigations; holds key fiscal and land-related information.',
        traits: ['Professional', 'Precise', 'Pragmatic'],
        color: 'from-amber-700 to-amber-900'
      }
    };

    // 根據當前階段的 availableNPCs 篩選
    let filteredNpcs: NpcData[] = [];
    if (stage && stage.availableNPCs && stage.availableNPCs.length > 0) {
      filteredNpcs = stage.availableNPCs
        .map((npcId: string) => npcMap[npcId])
        .filter((npc: NpcData | undefined) => npc !== undefined) as NpcData[];
    }

    // 如果沒有可用 NPC 或篩選結果為空，則顯示所有 NPC
    if (!filteredNpcs || filteredNpcs.length === 0) {
      filteredNpcs = Object.values(npcMap);
    }

    setAvailableNpcs(filteredNpcs);
  }, [mission]);

  const handleSelectNpc = (npcId: string) => {
    // 只在本地標記為已選中，避免立刻改變 MissionStore 的 currentStage
    setSelectedNpcId(npcId);
    // 更新 chat store 的選擇上下文（不變更 MissionStore 階段）
    actions.selectNpc(npcId);
  };

  const handleProceed = () => {
    if (!selectedNpcId) return;
    
    // 保存選擇的 NPC 到兩個 store
    // 先更新 chat store
    actions.selectNpc(selectedNpcId);

    // 使用 mission store 的 goToStage 來同步兩邊的階段（MissionStore 會同步更新 ChatStore）
    missionActions.goToStage("S3");
  };

  if (!mission || !currentStage) {
    return (
      <div className="s2-root flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-primary-50">
        <div className="text-center">
          <p className="s2-title">Unable to load dialogue</p>
          <p className="s2-subtitle">
            {currentMissionId ? `Mission not found: ${currentMissionId}` : 'No mission selected'}
          </p>
          <button
            onClick={() => missionActions.goToStage("S0")}
            className="s2-btn-secondary"
          >
            Back to mission list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="s2-root bg-gradient-to-br from-amber-50 via-white to-primary-50 py-8">
      <StageNavigation currentStage="S2" />
      
      {/* 返回按鈕：已移入標題列內以保持同一排顯示 */}
      
      <div className="s2-container">
        {/* 頂部標題區 */}
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="grid grid-cols-3 items-center">
              {/* left: back button */}
              <div className="flex items-center">
                <button
                  onClick={() => actions.goBack()}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-md transition-all text-stone-600 hover:text-stone-800 border border-stone-200"
                  aria-label="Go back"
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm font-medium hidden sm:inline">Back</span>
                </button>
              </div>

              {/* center: title */}
              <div className="flex justify-center">
                <div className="text-center">
                  <h1 className="text-heading-2 text-dark-900 whitespace-nowrap">Choose Interview Target</h1>
                </div>
              </div>

              {/* right: info / spacer */}
              <div className="flex items-center justify-end">
                <div className="hidden sm:flex items-center gap-2 text-amber-600 text-sm font-semibold">
                  <Info size={16} />
                  <span>Each NPC holds different key information</span>
                </div>
              </div>
            </div>
          </motion.div>

        {/* NPC 卡片網格 */}
        <div className="s2-npc-grid">
          <AnimatePresence>
            {availableNpcs.map((npc, index) => (
              <NpcCard
                key={npc.id}
                npc={npc}
                isSelected={selectedNpcId === npc.id}
                onClick={() => handleSelectNpc(npc.id)}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* 提示區域 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="s2-hint-box s2-panel mb-6"
        >
          <h2 className="text-lg font-bold text-dark-900 mb-2">💡 Mission Hint</h2>
          <p className="text-dark-700 leading-relaxed text-sm">
            {currentStage.hint || 'Choose the most suitable NPC for your investigation needs. Each NPC offers a unique perspective and information.'}
          </p>
        </motion.div>

        {/* 底部按鈕區 */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleProceed}
            disabled={!selectedNpcId}
            className={`s2-btn-primary flex items-center gap-2 ${
              !selectedNpcId ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span>Start Interview</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
