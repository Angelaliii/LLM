import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/useChatStore';
import { useMissionStore } from '../../store/useMissionStore';
import { getMissionById } from '../../data/missions';
import { ArrowRight, Info } from 'lucide-react';
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
        name: '佐藤敬一',
        role: '日本基層警察',
        avatar: '/assets/images/police.png',
        description: '負責執行總督府命令的日本警察，權力極大，令人敬畏。',
        traits: ['嚴肅', '官僚', '法規熟稔'],
        color: 'from-slate-700 to-slate-900'
      },
      'student': {
        id: 'student',
        name: '小清',
        role: '公學校學生',
        avatar: '/assets/images/student.png',
        description: '臺南市區的公學校學生，能提供基層臺籍民眾的生活視角。',
        traits: ['天真', '好奇', '敬畏權威'],
        color: 'from-emerald-600 to-emerald-800'
      },
      'land_surveyor': {
        id: 'land_surveyor',
        name: '山本勘助',
        role: '土地測量員',
        avatar: '/assets/images/Cadastral_surveyor.png',
        description: '負責土地調查和林野清查的測量員，掌握財政與土地相關資訊。',
        traits: ['專業', '精確', '務實'],
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
    setSelectedNpcId(npcId);
  };

  const handleProceed = () => {
    if (!selectedNpcId) return;
    
    // 保存選擇的 NPC 到兩個 store
    actions.selectNpc(selectedNpcId);
    missionActions.selectNpc(selectedNpcId);
    
    // 轉移到 S3（對話階段）
    actions.goToStage("S3");
    missionActions.goToStage("S3");
  };

  if (!mission || !currentStage) {
    return (
      <div className="s2-root flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-primary-50">
        <div className="text-center">
          <p className="s2-title">無法載入對話</p>
          <p className="s2-subtitle">
            {currentMissionId ? `無法找到任務: ${currentMissionId}` : '未選擇任何任務'}
          </p>
          <button
            onClick={() => missionActions.goToStage("S0")}
            className="s2-btn-secondary"
          >
            返回任務列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="s2-root bg-gradient-to-br from-amber-50 via-white to-primary-50 py-8">
      <StageNavigation currentStage="S2" />
      <div className="s2-container">
        {/* 頂部標題區 */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="s2-title">
            選擇調查對象
          </h1>
          <p className="s2-subtitle">
            {currentStage.question}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-amber-600 text-sm font-semibold">
            <Info size={16} />
            <span>每位 NPC 掌握不同的關鍵資訊</span>
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
          <h2 className="text-lg font-bold text-dark-900 mb-2">💡 任務提示</h2>
          <p className="text-dark-700 leading-relaxed text-sm">
            {currentStage.hint || '根據你的調查需求，選擇最合適的 NPC 進行訪談。每位 NPC 都能提供獨特的視角和資訊。'}
          </p>
        </motion.div>

        {/* 操作按鈕 */}
        <div className="flex gap-4 justify-center">
          <motion.button
            onClick={handleProceed}
            disabled={!selectedNpcId}
            whileHover={selectedNpcId ? { scale: 1.03 } : {}}
            whileTap={selectedNpcId ? { scale: 0.98 } : {}}
            className={`s2-btn-primary ${selectedNpcId ? '' : 'disabled'}`}
          >
            <span>開始訪談</span>
            <ArrowRight size={18} />
          </motion.button>

          <button
            onClick={() => {
              try { actions.goToStage("S1"); } catch (e) {}
              try { missionActions.goToStage("S1"); } catch (e) {}
            }}
            className="s2-btn-secondary"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
}
