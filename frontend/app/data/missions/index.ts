/**
 * Mission data unified export
 */

import { tainanColonialRuleMission, MissionData } from './tainan-colonial-rule';

// All available missions
export const allMissions: MissionData[] = [
  tainanColonialRuleMission,
  // More missions can be added here in the future
];

// Get mission by ID
export const getMissionById = (id: string): MissionData | undefined => {
  return allMissions.find(mission => mission.id === id);
};

// Filter missions by difficulty
export const getMissionsByDifficulty = (difficulty: 'Beginner' | 'Intermediate' | 'Advanced'): MissionData[] => {
  return allMissions.filter(mission => mission.difficulty === difficulty);
};

// Filter missions by period
export const getMissionsByPeriod = (period: string): MissionData[] => {
  return allMissions.filter(mission => mission.period.includes(period));
};

// Export types
export type { MissionData, Stage } from './tainan-colonial-rule';
