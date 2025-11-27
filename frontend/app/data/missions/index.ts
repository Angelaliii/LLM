/**
 * 任務資料統一匯出
 */

import { tainanColonialRuleMission, MissionData } from './tainan-colonial-rule';

// 所有可用任務
export const allMissions: MissionData[] = [
  tainanColonialRuleMission,
  // 未來可以在這裡添加更多任務
];

// 根據 ID 取得任務
export const getMissionById = (id: string): MissionData | undefined => {
  return allMissions.find(mission => mission.id === id);
};

// 根據難度篩選任務
export const getMissionsByDifficulty = (difficulty: '初級' | '中級' | '高級'): MissionData[] => {
  return allMissions.filter(mission => mission.difficulty === difficulty);
};

// 根據時期篩選任務
export const getMissionsByPeriod = (period: string): MissionData[] => {
  return allMissions.filter(mission => mission.period.includes(period));
};

// 匯出類型
export type { MissionData, Stage } from './tainan-colonial-rule';
