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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-primary-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">無法載入對話</p>
          <p className="text-sm text-gray-500 mb-6">
            {currentMissionId ? `無法找到任務: ${currentMissionId}` : '未選擇任何任務'}
          </p>
          <button
            onClick={() => missionActions.goToStage("S0")}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            返回任務列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-primary-50 py-12">
      <StageNavigation currentStage="S2" />
      <div className="container-max">
        <div className="max-w-6xl mx-auto">
          {/* 頂部標題區 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-dark-900 mb-6 tracking-tight">
              選擇調查對象
            </h1>
            <p className="text-xl text-dark-700 max-w-3xl mx-auto leading-relaxed">
              {currentStage.question}
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-amber-600 text-sm font-semibold">
              <Info size={16} />
              <span>每位 NPC 掌握不同的關鍵資訊</span>
            </div>
          </motion.div>

          {/* NPC 卡片網格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto px-4">
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
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg border border-amber-100 p-8 mb-12 shadow-sm"
          >
            <h2 className="text-xl font-bold text-dark-900 mb-4">💡 任務提示</h2>
            <p className="text-dark-700 leading-relaxed">
              {currentStage.hint || '根據你的調查需求，選擇最合適的 NPC 進行訪談。每位 NPC 都能提供獨特的視角和資訊。'}
            </p>
          </motion.div>

          {/* 操作按鈕 */}
          <div className="flex gap-6 justify-center">
            <motion.button
              onClick={handleProceed}
              disabled={!selectedNpcId}
              whileHover={selectedNpcId ? { scale: 1.05 } : {}}
              whileTap={selectedNpcId ? { scale: 0.95 } : {}}
              className={`px-12 py-4 rounded-lg font-bold text-lg flex items-center gap-3 transition-all duration-300 shadow-lg ${
                selectedNpcId
                  ? 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-xl cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>開始訪談</span>
              <ArrowRight size={20} />
            </motion.button>

            <button
              onClick={() => {
                // 同步更新 chatStore 與 missionStore 的階段
                try {
                  actions.goToStage("S1");
                } catch (e) {
                  // ignore
                }
                try {
                  missionActions.goToStage("S1");
                } catch (e) {
                  // ignore
                }
              }}
              className="px-8 py-4 bg-white hover:bg-gray-50 text-dark-700 border border-gray-300 rounded-lg transition-all duration-300 font-semibold hover:shadow-md"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
