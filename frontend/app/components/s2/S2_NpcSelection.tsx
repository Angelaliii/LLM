import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        name: t('s2.police_officer_name'),
        role: t('s2.police_officer_role'),
        avatar: '/assets/images/police.png',
        description: t('s2.police_officer_desc'),
        traits: [t('s2.trait_serious'), t('s2.trait_bureaucratic'), t('s2.trait_legal')],
        color: 'from-slate-700 to-slate-900'
      },
      'student': {
        id: 'student',
        name: t('s2.student_name'),
        role: t('s2.student_role'),
        avatar: '/assets/images/student.png',
        description: t('s2.student_desc'),
        traits: [t('s2.trait_naive'), t('s2.trait_curious'), t('s2.trait_respectful')],
        color: 'from-emerald-600 to-emerald-800'
      },
      'land_surveyor': {
        id: 'land_surveyor',
        name: t('s2.land_surveyor_name'),
        role: t('s2.land_surveyor_role'),
        avatar: '/assets/images/Cadastral_surveyor.png',
        description: t('s2.land_surveyor_desc'),
        traits: [t('s2.trait_professional'), t('s2.trait_precise'), t('s2.trait_pragmatic')],
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
          <p className="s2-title">{t('s2.failed_load')}</p>
          <p className="s2-subtitle">
            {currentMissionId ? t('s2.mission_not_found', { missionId: currentMissionId }) : t('s2.no_mission')}
          </p>
          <button
            onClick={() => missionActions.goToStage("S0")}
            className="s2-btn-secondary"
          >
            {t('s2.back_to_missions')}
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
                  aria-label={t('s2.back_label')}
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm font-medium hidden sm:inline">{t('s2.back_button')}</span>
                </button>
              </div>

              {/* center: title */}
              <div className="flex justify-center">
                <div className="text-center">
                  <h1 className="s2-title">{t('s2.title')}</h1>
                  <p className="s2-subtitle">{currentStage.question}</p>
                </div>
              </div>

              {/* right: spacer (資訊提示已移除) */}
              <div className="flex items-center justify-end">
                <div />
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

        {/* 任務提示區塊已移除 (UI 需求) */}

        {/* 底部按鈕區 */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleProceed}
            disabled={!selectedNpcId}
            className={`s2-btn-primary flex items-center gap-2 ${
              !selectedNpcId ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span>{t('s2.start_interview')}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
