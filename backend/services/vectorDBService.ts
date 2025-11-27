import { ChromaClient, Collection } from 'chromadb';
import { generateEmbedding } from './embeddingService';
import * as fs from 'fs';
import * as path from 'path';

const CHROMA_PATH = path.resolve(__dirname, '../data/chroma_db');
const COLLECTION_NAME = 'japanese_colonial_knowledge';

let chromaClient: ChromaClient | null = null;
let knowledgeCollection: Collection | null = null;

/**
 * 初始化 ChromaDB 客戶端和集合
 */
export async function initializeVectorDB(): Promise<void> {
  try {
    // 確保資料夾存在
    if (!fs.existsSync(CHROMA_PATH)) {
      fs.mkdirSync(CHROMA_PATH, { recursive: true });
      console.log(`📁 Created ChromaDB directory: ${CHROMA_PATH}`);
    }

    // 使用新版 API
    chromaClient = new ChromaClient();

    // 獲取或創建集合 (使用自定義嵌入函數)
    const embeddingFunction = {
      generate: async (texts: string[]) => {
        const embeddings = await Promise.all(
          texts.map(text => generateEmbedding(text))
        );
        return embeddings;
      }
    };

    try {
      knowledgeCollection = await chromaClient.getCollection({
        name: COLLECTION_NAME,
        embeddingFunction
      });
      console.log('✅ Vector database collection loaded');
    } catch (error) {
      knowledgeCollection = await chromaClient.createCollection({
        name: COLLECTION_NAME,
        metadata: { description: '日治時期台灣歷史知識庫' },
        embeddingFunction
      });
      console.log('✅ Vector database collection created');
    }

    // 檢查集合是否為空,如果是則初始化
    const count = await knowledgeCollection.count();
    if (count === 0) {
      console.log('📚 Knowledge base is empty, initializing...');
      await loadKnowledgeBase();
    } else {
      console.log(`📚 Knowledge base loaded with ${count} entries`);
    }
  } catch (error: any) {
    console.error('❌ Failed to initialize vector database:', error.message);
    throw error;
  }
}

/**
 * 載入知識庫到向量資料庫
 */
async function loadKnowledgeBase(): Promise<void> {
  try {
    const knowledgeBasePath = path.join(__dirname, '../data/knowledge/knowledge_base.json');
    
    if (!fs.existsSync(knowledgeBasePath)) {
      console.warn('⚠️  Knowledge base file not found:', knowledgeBasePath);
      return;
    }

    const knowledgeData = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf-8'));
    
    if (!Array.isArray(knowledgeData) || knowledgeData.length === 0) {
      console.warn('⚠️  Knowledge base is empty or invalid');
      return;
    }

    console.log(`📖 Loading ${knowledgeData.length} knowledge entries...`);

    // 批量處理
    const batchSize = 10;
    for (let i = 0; i < knowledgeData.length; i += batchSize) {
      const batch = knowledgeData.slice(i, i + batchSize);
      
      const ids: string[] = [];
      const embeddings: number[][] = [];
      const documents: string[] = [];
      const metadatas: any[] = [];

      for (const entry of batch) {
        // 生成 embedding
        const embedding = await generateEmbedding(entry.content);
        
        ids.push(entry.id);
        embeddings.push(embedding);
        documents.push(entry.content);
        metadatas.push({
          period: entry.period,
          topic: entry.topic,
          tags: JSON.stringify(entry.tags),
          knowledge_tag: entry.knowledge_tag,
          npc_role_tag: JSON.stringify(entry.npc_role_tag)
        });
      }

      // 添加到集合
      await knowledgeCollection!.add({
        ids,
        embeddings,
        documents,
        metadatas
      });

      console.log(`  ✓ Loaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(knowledgeData.length / batchSize)}`);
    }

    console.log('✅ Knowledge base loaded successfully');
  } catch (error: any) {
    console.error('❌ Failed to load knowledge base:', error.message);
    throw error;
  }
}

export interface KnowledgeSearchResult {
  id: string;
  content: string;
  category: string;
  npc_role_tag: string[];
  similarity: number;
  metadata?: any;
}

/**
 * 搜尋相關知識
 */
export async function searchKnowledge(
  query: string,
  options: {
    npcRole?: string;
    topK?: number;
    minSimilarity?: number;
  } = {}
): Promise<KnowledgeSearchResult[]> {
  if (!knowledgeCollection) {
    throw new Error('Vector database not initialized');
  }

  const {
    npcRole,
    topK = 3,
    minSimilarity = 0.5
  } = options;

  try {
    // 生成查詢的 embedding
    const queryEmbedding = await generateEmbedding(query);

    // 搜尋
    const whereFilter = npcRole 
      ? { npc_role_tag: { $contains: npcRole } }
      : undefined;

    const results = await knowledgeCollection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
      where: whereFilter as any
    });

    if (!results.ids || !results.ids[0] || results.ids[0].length === 0) {
      return [];
    }

    // 格式化結果
    const searchResults: KnowledgeSearchResult[] = [];
    const resultCount = results.ids[0]?.length || 0;
    
    for (let i = 0; i < resultCount; i++) {
      const distance = results.distances?.[0]?.[i];
      const similarity = typeof distance === 'number' ? (1 - distance) : 0;
      
      if (similarity >= minSimilarity) {
        const metadata = results.metadatas?.[0]?.[i] || {};
        const category = typeof metadata.category === 'string' ? metadata.category : 'unknown';
        const npcRoleTag = Array.isArray(metadata.npc_role_tag) ? metadata.npc_role_tag : [];
        
        searchResults.push({
          id: results.ids[0][i],
          content: results.documents?.[0]?.[i] || '',
          category,
          npc_role_tag: npcRoleTag,
          similarity,
          metadata
        });
      }
    }

    return searchResults;
  } catch (error: any) {
    console.error('❌ Knowledge search error:', error.message);
    throw error;
  }
}

/**
 * 根據 NPC 角色過濾知識
 */
export function filterKnowledgeByNPC(
  results: KnowledgeSearchResult[],
  npcRole: string
): KnowledgeSearchResult[] {
  return results.filter(result => {
    const npcRoleTags = result.metadata.npc_role_tag;
    if (!npcRoleTags) return false;
    
    try {
      const tags = JSON.parse(npcRoleTags);
      return Array.isArray(tags) && tags.includes(npcRole);
    } catch {
      return false;
    }
  });
}

export { chromaClient, knowledgeCollection };
