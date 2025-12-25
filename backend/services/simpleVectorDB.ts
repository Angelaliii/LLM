import { generateEmbedding, cosineSimilarity } from './embeddingService';
import * as fs from 'fs';
import * as path from 'path';

export interface KnowledgeSearchResult {
  id: string;
  content: string;
  category: string;
  npc_role_tag: string[];
  similarity: number;
  metadata?: any;
}

export interface SearchOptions {
  npcRole?: string;
  topK?: number;
  minSimilarity?: number;
}

interface KnowledgeEntry {
  id: string;
  content: string;
  category: string;
  npc_role_tag: string[];
  embedding?: number[];
}

// 記憶體中的知識庫
let knowledgeBase: KnowledgeEntry[] = [];

// 定義檔案路徑
const KNOWLEDGE_SOURCE_PATH = path.join(__dirname, '../data/knowledge/knowledge_base.json');
const CACHE_PATH = path.join(__dirname, '../data/knowledge/knowledge_vectors_cache.json');

/**
 * 初始化向量資料庫 (記憶體版本 + 快取機制)
 */
export async function initializeVectorDB(): Promise<void> {
  try {
    // ---------------------------------------------------------
    // 1. 優先嘗試讀取快取 (Cache Hit)
    // ---------------------------------------------------------
    if (fs.existsSync(CACHE_PATH)) {
      console.log('📂 Found vector cache, loading from disk...');
      try {
        const cachedData = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
        
        // 簡單驗證一下快取資料格式對不對
        if (Array.isArray(cachedData) && cachedData.length > 0) {
            knowledgeBase = cachedData;
            console.log(`✅ Loaded ${knowledgeBase.length} entries from cache.`);
            console.log('🚀 Fast startup completed!');
            return; // 直接結束，不用再呼叫 API
        } else {
            console.warn('⚠️ Cache file found but empty or invalid. Regenerating...');
        }
      } catch (err) {
        console.error('⚠️ Failed to parse cache file. Regenerating...', err);
      }
    }

    // ---------------------------------------------------------
    // 2. 如果沒快取 (Cache Miss)，執行原本的生成邏輯
    // ---------------------------------------------------------
    console.log('🔄 No valid cache found. Generating new embeddings from source...');
    
    if (!fs.existsSync(KNOWLEDGE_SOURCE_PATH)) {
      throw new Error(`Knowledge base file not found: ${KNOWLEDGE_SOURCE_PATH}`);
    }

    // 載入原始資料
    const rawData = fs.readFileSync(KNOWLEDGE_SOURCE_PATH, 'utf-8');
    const data = JSON.parse(rawData);
    
    // 支援兩種格式: 直接陣列或有 knowledge 屬性的物件
    const knowledgeArray = Array.isArray(data) ? data : data.knowledge;
    
    if (!knowledgeArray || !Array.isArray(knowledgeArray)) {
      throw new Error('Invalid knowledge base format');
    }

    console.log(`📚 Processing ${knowledgeArray.length} entries...`);

    // 批次生成嵌入向量
    const batchSize = 3; // 保持原本的小批次以防 Rate Limit
    knowledgeBase = [];

    for (let i = 0; i < knowledgeArray.length; i += batchSize) {
      const batch = knowledgeArray.slice(i, i + batchSize);
      
      const entries = await Promise.all(
        batch.map(async (item: any, idx: number) => {
          try {
            const content = item.content || '';
            if (!content.trim()) {
              console.warn(`⚠️  Skipping empty entry ${i + idx}`);
              return null;
            }
            
            // 呼叫 API 生成 Embedding (最花時間的部分)
            const embedding = await generateEmbedding(content);
            
            return {
              id: item.id || `kb_${i + idx}`,
              content,
              category: item.category || item.knowledge_tag || 'unknown',
              npc_role_tag: Array.isArray(item.npc_role_tag) ? item.npc_role_tag : [],
              embedding
            } as KnowledgeEntry;
          } catch (error: any) {
            console.error(`⚠️  Failed to embed entry ${item.id || (i + idx)}: ${error.message}`);
            return null;
          }
        })
      );

      const validEntries = entries.filter((e): e is KnowledgeEntry => e !== null);
      knowledgeBase.push(...validEntries);
      
      const progress = Math.min(i + batchSize, knowledgeArray.length);
      console.log(`  ✓ Progress: ${progress}/${knowledgeArray.length} (${Math.round(progress / knowledgeArray.length * 100)}%)`);
    }

    // ---------------------------------------------------------
    // 3. 生成完畢，馬上存檔建立快取！
    // ---------------------------------------------------------
    try {
        // 確保目錄存在
        const dir = path.dirname(CACHE_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(CACHE_PATH, JSON.stringify(knowledgeBase, null, 2));
        console.log(`💾 Vectors successfully cached to ${CACHE_PATH}`);
    } catch (writeErr) {
        console.error('⚠️ Failed to save cache file (skipping):', writeErr);
    }

    console.log(`✅ Vector database initialized with ${knowledgeBase.length} entries`);

  } catch (error: any) {
    console.error('❌ Failed to initialize vector database:', error.message);
    throw error;
  }
}

/**
 * 搜尋相關知識
 */
export async function searchKnowledge(
  query: string,
  options: SearchOptions = {}
): Promise<KnowledgeSearchResult[]> {
  const {
    npcRole,
    topK = 3,
    minSimilarity = 0.5
  } = options;

  try {
    if (knowledgeBase.length === 0) {
      console.warn('⚠️  Knowledge base is empty');
      return [];
    }

    // 生成查詢向量
    const queryEmbedding = await generateEmbedding(query);

    // 計算所有條目的相似度
    const results = knowledgeBase
      .map(entry => ({
        ...entry,
        similarity: entry.embedding 
          ? cosineSimilarity(queryEmbedding, entry.embedding)
          : 0
      }))
      .filter(r => r.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity);

    // 根據 NPC 角色過濾
    const filtered = npcRole
      ? results.filter(r => r.npc_role_tag.includes(npcRole))
      : results;

    // 取 topK
    const topResults = filtered.slice(0, topK);

    return topResults.map(r => ({
      id: r.id,
      content: r.content,
      category: r.category,
      npc_role_tag: r.npc_role_tag,
      similarity: r.similarity
    }));
  } catch (error: any) {
    console.error('❌ Knowledge search error:', error.message);
    return [];
  }
}

/**
 * 獲取知識庫統計資訊
 */
export function getKnowledgeStats() {
  const categoryCounts: Record<string, number> = {};
  const npcRoleCounts: Record<string, number> = {};

  knowledgeBase.forEach(entry => {
    categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
    entry.npc_role_tag.forEach(role => {
      npcRoleCounts[role] = (npcRoleCounts[role] || 0) + 1;
    });
  });

  return {
    totalEntries: knowledgeBase.length,
    categories: categoryCounts,
    npcRoles: npcRoleCounts
  };
}
