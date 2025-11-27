import { chatWithMistral, MistralChatMessage } from './mistralClient';
import { searchKnowledge, KnowledgeSearchResult } from './simpleVectorDB';
import { getNPCConfig, checkTopicRedirect } from './npcConfigManager';
import { 
  convertRAGToRoleTone, 
  isSelfIntroduction,
  containsForbiddenTeachingTone 
} from './ragToneFilter';
import * as fs from 'fs';
import * as path from 'path';

// NPC ID 映射
const NPC_MAPPING: Record<string, { file: string; name: string; role: string }> = {
  'student': { file: 'NPC_JP01_Student.md', name: '小清', role: '學生' },
  'police_officer': { file: 'NPC_JP02_Police.md', name: '佐藤 敬一', role: '警察' },
  'land_surveyor': { file: 'NPC_JP03_LandSurveyor.md', name: '山本 勘助', role: '土地測量員' }
};

/**
 * 載入 NPC Persona
 */
function loadNPCPersona(npcId: string): string {
  const npcInfo = NPC_MAPPING[npcId];
  if (!npcInfo) {
    throw new Error(`Unknown NPC ID: ${npcId}`);
  }

  const personaPath = path.join(__dirname, '../data/persona', npcInfo.file);
  
  if (!fs.existsSync(personaPath)) {
    throw new Error(`NPC persona file not found: ${personaPath}`);
  }

  return fs.readFileSync(personaPath, 'utf-8');
}

/**
 * 過濾對話歷史 - 移除自我介紹和無關內容
 */
function filterConversationHistory(
  history: Array<{ role: string; content: string }>,
  npcId: string,
  maxTurns: number = 5
): Array<{ role: string; content: string }> {
  const npcInfo = NPC_MAPPING[npcId];
  const config = getNPCConfig(npcId);
  
  if (!config) return history.slice(-maxTurns * 2);

  let filtered = history.filter((msg, idx) => {
    // 保留所有用戶訊息
    if (msg.role === 'user') {
      return true;
    }

    // 對於 NPC 回答,檢查是否為自我介紹
    if (msg.role === 'assistant') {
      // 第一輪對話的自我介紹保留
      if (idx <= 1) {
        return true;
      }
      
      // 後續對話如果是自我介紹就過濾掉
      if (config.conversationRules.noSelfIntroAfterFirst) {
        if (isSelfIntroduction(msg.content, npcInfo.name)) {
          console.log(`🗑️  Filtered self-introduction: ${msg.content.substring(0, 30)}...`);
          return false;
        }
      }

      // 檢查是否包含太多教學口吻
      const { hasForbidden, matches } = containsForbiddenTeachingTone(msg.content, npcId);
      if (hasForbidden && matches.length >= 2) {
        console.log(`🗑️  Filtered teaching tone: ${matches.join(', ')}`);
        return false;
      }
    }

    return true;
  });

  // 只保留最近的 N 輪對話
  return filtered.slice(-maxTurns * 2);
}

/**
 * 建構完整的 System Prompt (強化版)
 */
async function buildSystemPrompt(
  npcId: string,
  userQuery: string,
  conversationTurns: number = 0
): Promise<string> {
  const npcInfo = NPC_MAPPING[npcId];
  const npcConfig = getNPCConfig(npcId);
  const npcPersona = loadNPCPersona(npcId);
  
  if (!npcConfig) {
    throw new Error(`NPC config not found: ${npcId}`);
  }

  // 檢查是否需要轉接到其他 NPC
  const redirectCheck = checkTopicRedirect(npcId, userQuery);

  // 使用 RAG 檢索相關知識
  const knowledgeResults = await searchKnowledge(userQuery, {
    npcRole: npcInfo.role,
    topK: 3,
    minSimilarity: 0.5
  });

  // 透過語氣過濾器轉換 RAG 內容
  const ragKnowledge = convertRAGToRoleTone(knowledgeResults, npcId);

  const systemPrompt = `# 你的角色身份
${npcPersona}

# 🔥 NPC 回答規則 — 必須強制執行

## 1. 身份限制
- 你**只能**以「${npcInfo.name}」的身份回應
- **禁止**像老師、學者或 AI 助手的口吻
- **禁止**使用這些教學口吻: ${npcConfig.language.forbiddenPhrases.slice(0, 3).join('、')}

## 2. 自我介紹規則
${conversationTurns === 0 ? '- 這是第一輪對話,你可以簡單介紹自己(1句話)' : '- **禁止**重複自我介紹,不要再說「我是XX」'}

## 3. 知識範圍限制
你**只能**回答以下主題:
${npcConfig.knowledge.canAnswer.map(t => `  • ${t}`).join('\n')}

你**絕對不能**回答:
${npcConfig.knowledge.cannotAnswer.slice(0, 5).map(t => `  • ${t}`).join('\n')}

## 4. 知識來源限制
你的回答**只能**來自:
${npcConfig.knowledge.knowledgeSource === 'daily_life' ? '✓ 你的日常生活觀察' : ''}
${npcConfig.knowledge.knowledgeSource === 'work_observation' ? '✓ 你的工作經驗' : ''}
${npcConfig.knowledge.knowledgeSource === 'official_duty' ? '✓ 你的執勤職責' : ''}
✓ 眼睛看到、耳朵聽到的事情
✗ **不能**引用「史料」「文獻」或用學者口吻

${redirectCheck.shouldRedirect ? `
## 5. 🚨 此問題需轉接
玩家問的是「${userQuery}」,這**不在**你的知識範圍!
請用以下話術引導玩家:
「${redirectCheck.phrase}」
**不要**嘗試回答,直接引導轉接!
` : ''}

# 歷史背景參考
${ragKnowledge}

# 🔥 如何使用以上背景資料

## ✅ 正確使用方式:
1. **用自己的話轉述** - 不要直接複製貼上
2. **從角色視角描述** - 「我看到」「我聽說」「我負責」
3. **符合你的知識來源** - ${
  npcConfig.knowledge.knowledgeSource === 'daily_life' ? '你的日常生活觀察' :
  npcConfig.knowledge.knowledgeSource === 'work_observation' ? '你的工作經驗' :
  npcConfig.knowledge.knowledgeSource === 'official_duty' ? '你的執勤職責' : '你的經驗'
}
4. **口語化陳述** - 像在聊天,不是在上課

## ❌ 禁止的回答方式:
- ❌ 「根據史料記載...」
- ❌ 「總督府實施了XX政策旨在...」
- ❌ 「此制度反映了殖民統治的本質...」
- ❌ 直接背誦上述內容

## ✅ 範例轉換:

**背景資料說:** 「總督府建立警察制度以鎮壓反抗,利用保甲制度輔佐警察執行公共事務。」

**你應該這樣說:**
- 小清: 「警察大人很兇!他們會叫大人們組織壯丁團。十戶變一甲,甲長要管我們。」
- 佐藤: 「我們警察要維持秩序!每十戶編成一甲,甲長要協助我執行任務。」
- 山本: 「警察管治安,我管土地。他們用保甲制度控制地方,我不太清楚細節。」

# 回答格式要求
1. **口語化、簡短** - 2~3 句話 (${npcConfig.language.maxResponseLength} 字以內)
2. 語氣: ${
  npcConfig.language.tone === 'naive' ? '天真、好奇、有點害怕權威' :
  npcConfig.language.tone === 'authoritative' ? '威嚴、命令、不耐煩' :
  npcConfig.language.tone === 'professional' ? '務實、專業、專注數據' : '對話式'
}
3. **不懂就老實說不知道**,然後引導去找其他 NPC

# 時空限制
現在是 **1905 年**,你只知道這個時代的事。
絕對不能提及: 民主、人權、總統、手機、AI、現代政治、民國等。
`;

  return systemPrompt;
}

export interface GameChatRequest {
  sessionId: string;
  npcId: string;
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface GameChatResponse {
  responseId: string;
  responses: Array<{
    id: string;
    content: string;
    temperature: number;
    qualityScore?: number;
  }>;
  stageUnlocked: string | null;
  gameCompleted: boolean;
  hint?: string;
  knowledgeUsed?: KnowledgeSearchResult[];
}

/**
 * 處理遊戲對話 - 使用 Mistral API (強化版)
 */
export async function handleGameChat(request: GameChatRequest): Promise<GameChatResponse> {
  const { npcId, message, conversationHistory = [] } = request;

  try {
    const npcInfo = NPC_MAPPING[npcId];
    const npcConfig = getNPCConfig(npcId);
    
    if (!npcConfig) {
      throw new Error(`NPC config not found: ${npcId}`);
    }

    // 🔧 過濾對話歷史 (移除重複自介、教學口吻)
    const filteredHistory = filterConversationHistory(conversationHistory, npcId);
    
    console.log(`📝 History filtered: ${conversationHistory.length} -> ${filteredHistory.length} messages`);

    // 建構 System Prompt (包含 RAG 知識、角色規則)
    const systemPrompt = await buildSystemPrompt(
      npcId,
      message,
      filteredHistory.length / 2
    );

    // 建構對話訊息
    const messages: MistralChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...filteredHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // 生成兩個不同 temperature 的回答
    const [responseA, responseB] = await Promise.all([
      chatWithMistral(messages, { 
        temperature: 0.7,
        maxTokens: npcConfig.language.maxResponseLength 
      }),
      chatWithMistral(messages, { 
        temperature: 0.9,
        maxTokens: npcConfig.language.maxResponseLength 
      })
    ]);

    // 檢查回答品質
    const qualityCheckA = checkResponseQuality(responseA, npcId);
    const qualityCheckB = checkResponseQuality(responseB, npcId);

    if (qualityCheckA.hasIssues) {
      console.warn(`⚠️  Response A quality issues: ${qualityCheckA.issues.join(', ')}`);
    }
    if (qualityCheckB.hasIssues) {
      console.warn(`⚠️  Response B quality issues: ${qualityCheckB.issues.join(', ')}`);
    }

    // 檢查是否解鎖 Stage
    const stageUnlocked = checkStageUnlock(message, filteredHistory.length);

    // 獲取使用的知識
    const knowledgeUsed = await searchKnowledge(message, {
      npcRole: npcInfo.role,
      topK: 2
    });

    return {
      responseId: generateResponseId(),
      responses: [
        { 
          id: 'response_a', 
          content: responseA, 
          temperature: 0.7,
          qualityScore: qualityCheckA.score 
        },
        { 
          id: 'response_b', 
          content: responseB, 
          temperature: 0.9,
          qualityScore: qualityCheckB.score 
        }
      ],
      stageUnlocked,
      gameCompleted: false,
      hint: filteredHistory.length >= 3 ? generateHint(message) : undefined,
      knowledgeUsed
    };
  } catch (error: any) {
    console.error('❌ Game chat error:', error.message);
    throw error;
  }
}

/**
 * 檢查回答品質
 */
function checkResponseQuality(
  response: string,
  npcId: string
): { hasIssues: boolean; issues: string[]; score: number } {
  const issues: string[] = [];
  const npcInfo = NPC_MAPPING[npcId];
  const config = getNPCConfig(npcId);
  
  if (!config) {
    return { hasIssues: false, issues: [], score: 1.0 };
  }

  // 檢查是否包含自我介紹 (第一輪後)
  if (isSelfIntroduction(response, npcInfo.name)) {
    issues.push('contains_self_intro');
  }

  // 檢查是否包含教學口吻
  const { hasForbidden, matches } = containsForbiddenTeachingTone(response, npcId);
  if (hasForbidden) {
    issues.push(`teaching_tone: ${matches.join(',')}`);
  }

  // 檢查長度
  if (response.length > config.language.maxResponseLength * 1.5) {
    issues.push('too_long');
  }

  // 檢查是否包含現代詞彙
  const modernWords = ['民主', '人權', '總統', '手機', 'AI', '電腦', '網路', '民國'];
  const foundModernWords = modernWords.filter(word => response.includes(word));
  if (foundModernWords.length > 0) {
    issues.push(`modern_words: ${foundModernWords.join(',')}`);
  }

  // 計算品質分數
  const score = Math.max(0, 1.0 - (issues.length * 0.2));

  return {
    hasIssues: issues.length > 0,
    issues,
    score
  };
}

/**
 * 檢查是否解鎖下一階段 (簡化版)
 */
function checkStageUnlock(userMessage: string, conversationTurns: number): string | null {
  const keywords = {
    'stage_1_intro': ['六三法', '總督專制', '法律第六十三號'],
    'stage_2_power': ['警察政治', '保甲制度', '連坐'],
    'stage_3_finance': ['土地調查', '專賣制度', '田賦']
  };

  for (const [stageId, words] of Object.entries(keywords)) {
    const matchCount = words.filter(word => userMessage.includes(word)).length;
    if (matchCount >= 2) {
      return stageId;
    }
  }

  return null;
}

/**
 * 生成提示
 */
function generateHint(userMessage: string): string {
  // 簡單的提示邏輯
  if (userMessage.includes('權力') || userMessage.includes('總督')) {
    return '💡 提示: 試著詢問關於「六三法」的具體內容';
  }
  if (userMessage.includes('警察') || userMessage.includes('控制')) {
    return '💡 提示: 可以探討「保甲制度」如何運作';
  }
  if (userMessage.includes('財政') || userMessage.includes('錢')) {
    return '💡 提示: 了解「土地調查」和「專賣制度」';
  }
  return '';
}

/**
 * 生成回應 ID
 */
function generateResponseId(): string {
  return `resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
