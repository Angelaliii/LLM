import * as fs from 'fs';
import * as path from 'path';
import { e2Npcs, e2Chunks, e2Quizzes } from '../data/missions/mission';

/**
 * Mission 資料快取
 */
interface MissionCache {
  npcs: any[];
  chunks: any[];
  quizzes: any[];
  loadedAt: number;
}

let missionCache: MissionCache | null = null;

/**
 * 預載入 Mission 資料
 * 應在伺服器啟動時呼叫
 */
export function preloadMissionData(): void {
  try {
    console.log('📦 Preloading mission data...');
    
    missionCache = {
      npcs: e2Npcs,
      chunks: e2Chunks,
      quizzes: e2Quizzes,
      loadedAt: Date.now()
    };
    
    console.log(`✅ Mission data loaded: ${missionCache.npcs.length} NPCs, ${missionCache.chunks.length} chunks, ${missionCache.quizzes.length} quizzes`);
  } catch (error: any) {
    console.error('❌ Failed to preload mission data:', error.message);
    throw error;
  }
}

/**
 * 獲取 Mission 資料
 */
export function getMissionData(): MissionCache {
  if (!missionCache) {
    console.warn('⚠️  Mission data not preloaded, loading now...');
    preloadMissionData();
  }
  return missionCache!;
}

/**
 * 根據 Mission ID 獲取相關資訊
 */
export function getMissionById(missionId: string) {
  const data = getMissionData();
  return {
    npcs: data.npcs,
    chunks: data.chunks.filter(chunk => chunk.missionId === missionId.toUpperCase()),
    quizzes: data.quizzes
  };
}

/**
 * 根據 NPC ID 獲取 NPC 資訊
 */
export function getNPCInfo(npcId: string) {
  const data = getMissionData();
  return data.npcs.find(npc => npc.id === npcId);
}

/**
 * 獲取與特定關鍵字相關的 Mission Chunks
 */
export function searchMissionChunks(keywords: string[]): any[] {
  const data = getMissionData();
  return data.chunks.filter(chunk => 
    keywords.some(keyword => 
      chunk.keywords.includes(keyword) || 
      chunk.text.includes(keyword)
    )
  );
}
