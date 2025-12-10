import { chatWithMistral, MistralChatMessage } from './mistralClient';
import { searchKnowledge, KnowledgeSearchResult } from './simpleVectorDB';
import { getNPCConfig, checkTopicRedirect } from './npcConfigManager';
import { 
  convertRAGToRoleTone, 
  isSelfIntroduction,
  containsForbiddenTeachingTone 
} from './ragToneFilter';
import { getMissionById, getNPCInfo } from './missionLoader';
import * as fs from 'fs';
import * as path from 'path';
import { KEYWORDS } from '../config/keywords';

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
 * 載入 Story 的 Player Persona 資訊
 */
function loadPlayerPersona(storyId: string = 'jp_story_01_early_rule'): any {
  const storyPath = path.join(__dirname, '../data/story', `${storyId}.json`);
  
  if (!fs.existsSync(storyPath)) {
    console.warn(`⚠️  Story file not found: ${storyPath}`);
    return null;
  }

  const storyContent = fs.readFileSync(storyPath, 'utf-8');
  const storyData = JSON.parse(storyContent);
  return storyData.player_persona;
}

/**
 * 建構完整的 System Prompt (強化版 + 記憶管理)
 * 
 * 處理流程:
 * 1. 載入 NPC PERSONA 檔案 (個性、語氣、知識範圍)
 * 2. 載入 Player Persona (玩家身份、背景、關係)
 * 3. 載入歷史摘要和關鍵線索（永久記憶）
 * 4. 使用 RAG 檢索 knowledge_base.json 相關知識
 * 5. 從 mission 資料中獲取相關劇本資訊
 * 6. 結合所有資料生成完整的 System Prompt
 */
async function buildSystemPrompt(
  npcId: string,
  userQuery: string,
  conversationTurns: number = 0,
  missionId: string = 'E2',
  summaries: any[] = [],
  keyPoints: any[] = []
): Promise<string> {
  const npcInfo = NPC_MAPPING[npcId];
  const npcConfig = getNPCConfig(npcId);
  
  // 1️⃣ 載入 NPC PERSONA 檔案
  const npcPersona = loadNPCPersona(npcId);
  console.log(`📝 Loaded PERSONA for ${npcInfo.name}`);
  
  if (!npcConfig) {
    throw new Error(`NPC config not found: ${npcId}`);
  }

  // 2️⃣ 載入玩家身份資訊
  const playerPersona = loadPlayerPersona();
  console.log(`👤 Loaded Player Persona: ${playerPersona?.name || 'Unknown'}`);

  // 3️⃣ 從 mission 中獲取相關資訊
  const missionData = getMissionById(missionId);
  const missionNPCInfo = getNPCInfo(npcId);
  console.log(`📦 Loaded mission data: ${missionData.chunks.length} chunks`);
  console.log(`📚 Memory: ${summaries.length} summaries, ${keyPoints.length} key points`);

  // 檢查是否需要轉接到其他 NPC
  const redirectCheck = checkTopicRedirect(npcId, userQuery);

  // 4️⃣ 使用 RAG 檢索 knowledge_base.json 相關知識
  const knowledgeResults = await searchKnowledge(userQuery, {
    npcRole: npcInfo.role,
    topK: 3,
    minSimilarity: 0.5
  });
  console.log(`🔍 RAG search results: ${knowledgeResults.length} matches`);

  // 5️⃣ 透過語氣過濾器轉換 RAG 內容
  const ragKnowledge = convertRAGToRoleTone(knowledgeResults, npcId);

  // 建構歷史摘要說明
  let historySummaryContext = '';
  if (summaries.length > 0) {
    historySummaryContext = `\n# 📚 之前的對話摘要\n\n`;
    historySummaryContext += `你與鈴木先生已經進行了 ${summaries.length} 個階段的對話。以下是之前的對話重點：\n\n`;
    summaries.forEach((summary: any, idx: number) => {
      historySummaryContext += `## 對話片段 ${idx + 1}\n`;
      historySummaryContext += `- **鈴木先生詢問**：${summary.playerIntent}\n`;
      historySummaryContext += `- **你的回應**：${summary.npcResponse}\n`;
      if (summary.discoveredKeywords && summary.discoveredKeywords.length > 0) {
        historySummaryContext += `- **討論主題**：${summary.discoveredKeywords.join('、')}\n`;
      }
      historySummaryContext += `\n`;
    });
    historySummaryContext += `⚠️ **重要**：這些是已經討論過的內容，不要重複詳細解釋，而是引導鈴木先生探索新的線索。\n\n`;
  }

  // 建構已發現關鍵線索說明
  let keyPointsContext = '';
  if (keyPoints.length > 0) {
    keyPointsContext = `\n# 🔑 鈴木先生已經知道的關鍵信息\n\n`;
    keyPointsContext += `鈴木先生通過調查已經了解了以下概念：\n\n`;
    
    // 按類別分組
    const byCategory: Record<string, any[]> = {};
    keyPoints.forEach((kp: any) => {
      const cat = kp.category || '其他';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(kp);
    });
    
    Object.entries(byCategory).forEach(([category, kps]) => {
      keyPointsContext += `**${category}相關**：\n`;
      kps.forEach(kp => {
        keyPointsContext += `  - ${kp.title}：${kp.description}\n`;
      });
      keyPointsContext += `\n`;
    });
    
    keyPointsContext += `⚠️ **重要**：\n`;
    keyPointsContext += `- 這些概念鈴木先生已經了解，不需要從頭解釋\n`;
    keyPointsContext += `- 可以簡單提及，但應該引導他探索相關但更深入的內容\n`;
    keyPointsContext += `- 如果他問已知的概念，用簡短回答後引導新方向\n\n`;
  }

  // 建構玩家身份說明
  let playerContext = '';
  if (playerPersona) {
    // 找出與當前 NPC 的關係描述
    let relationshipDesc = '';
    if (playerPersona.relationship && Array.isArray(playerPersona.relationship)) {
      const currentRelation = playerPersona.relationship.find((rel: string) => 
        rel.includes(npcInfo.name) || rel.toLowerCase().includes(npcId.replace('_', ' '))
      );
      if (currentRelation) {
        relationshipDesc = currentRelation;
      }
    }

    playerContext = `
# 🎭 對話對象身份 — 你在與誰交談

你正在與 **${playerPersona.name}** 對話。

## 對方的身份背景：
- **姓名**：${playerPersona.name}
- **職位**：${playerPersona.role}
- **背景**：${playerPersona.background_story}

## 你們之間的關係：
${relationshipDesc || `你認識 ${playerPersona.name}，他是 ${playerPersona.role}。`}

⚠️ **重要**: 
- 你必須記住對方是 **${playerPersona.name}**
- 在適當的時候可以稱呼對方「${playerPersona.name}」或「${playerPersona.role.includes('文官') ? '鈴木先生' : playerPersona.name}」
- 你們有工作上的關係，對話時要符合這個身份語境
- 不要忘記對方的身份，也不要當作陌生人對待
`;
  }

  const systemPrompt = `${playerContext}
${historySummaryContext}
${keyPointsContext}

# 你的角色身份
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
1. **直接回答，不要加名字前綴** - 不要以「${npcInfo.name}：」開頭
2. **口語化、簡短** - 2~3 句話 (${npcConfig.language.maxResponseLength} 字以內)
3. 語氣: ${
  npcConfig.language.tone === 'naive' ? '天真、好奇、有點害怕權威' :
  npcConfig.language.tone === 'authoritative' ? '威嚴、命令、不耐煩' :
  npcConfig.language.tone === 'professional' ? '務實、專業、專注數據' : '對話式'
}
4. **不懂就老實說不知道**,然後引導去找其他 NPC

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
  summaries?: any[];
  keyPoints?: any[];
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
  keyPointAchieved?: {
    id: string;
    title: string;
    description: string;
  };
}

/**
 * 處理遊戲對話 - 使用 Mistral API (強化版)
 * 
 * 處理流程:
 * 1. 過濾對話歷史 (移除重複自介、教學口吻)
 * 2. 建構 System Prompt (載入 PERSONA + RAG + mission)
 * 3. 生成兩個不同 temperature 的回答
 * 4. 檢查回答品質
 */
export async function handleGameChat(request: GameChatRequest): Promise<GameChatResponse> {
  const { npcId, message, conversationHistory = [], sessionId, summaries = [], keyPoints = [] } = request;

  try {
    console.log(`\n--- 💬 開始處理對話 (Session: ${sessionId}) ---`);
    console.log(`👤 NPC: ${npcId} | 📨 Message: ${message.substring(0, 50)}...`);
    console.log(`📚 Memory: ${summaries.length} summaries, ${keyPoints.length} key points`);
    
    const npcInfo = NPC_MAPPING[npcId];
    const npcConfig = getNPCConfig(npcId);
    
    if (!npcConfig) {
      throw new Error(`NPC config not found: ${npcId}`);
    }

    // 🔧 1. 過濾對話歷史 (移除重複自介、教學口吻)
    const filteredHistory = filterConversationHistory(conversationHistory, npcId);
    console.log(`📝 History filtered: ${conversationHistory.length} -> ${filteredHistory.length} messages`);

    // 🔧 2. 建構 System Prompt (PERSONA → mission → knowledge_base + 記憶)
    const systemPrompt = await buildSystemPrompt(
      npcId,
      message,
      filteredHistory.length / 2,
      'E2',
      summaries,
      keyPoints
    );
    console.log(`📋 System prompt built (${systemPrompt.length} chars)`);

    // 建構對話訊息
    const messages: MistralChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...filteredHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // 🔧 3. 生成兩個不同 temperature 的回答
    console.log(`🤖 Generating responses...`);
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

    // 🔧 4. 檢查回答品質
    const qualityCheckA = checkResponseQuality(responseA, npcId);
    const qualityCheckB = checkResponseQuality(responseB, npcId);

    if (qualityCheckA.hasIssues) {
      console.warn(`⚠️  Response A quality issues: ${qualityCheckA.issues.join(', ')}`);
    }
    if (qualityCheckB.hasIssues) {
      console.warn(`⚠️  Response B quality issues: ${qualityCheckB.issues.join(', ')}`);
    }

    // 檢查是否達成關鍵點
    const keyPointAchieved = checkKeyPointAchieved(
      message,
      responseA,
      filteredHistory
    );

    // 檢查是否解鎖 Stage
    const stageUnlocked = checkStageUnlock(message, filteredHistory.length);

    // 獲取使用的知識
    const knowledgeUsed = await searchKnowledge(message, {
      npcRole: npcInfo.role,
      topK: 2
    });

    console.log(`✅ Chat processed successfully`);
    if (keyPointAchieved) {
      console.log(`🌟 New achievement: ${keyPointAchieved.title}`);
    }
    console.log(`--- 對話處理完成 ---\n`);

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
      knowledgeUsed,
      keyPointAchieved: keyPointAchieved || undefined
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
 * 檢查是否達成關鍵點
 */
function checkKeyPointAchieved(
  userMessage: string, 
  assistantResponse: string,
  conversationHistory: Array<{ role: string; content: string }>
): { id: string; title: string; description: string } | null {
  // 使用集中管理的 KEYWORDS 並補充任務特有詞彙
  const keyPoints = [
    {
      id: 'kp1',
      title: '警察的角色',
      description: '了解殖民警察在台灣社會中扮演的多重角色',
      keywords: [
        // 包含警察與官方相關詞 + 補充詞
        ...(KEYWORDS.government || []),
        '權力', '控制', '巡查', '維持秩序'
      ]
    },
    {
      id: 'kp2',
      title: '保甲制度',
      description: '認識保甲制度如何輔助警察控制',
      keywords: ['保甲', '甲長', '十戶', '壯丁團', '連帶責任']
    },
    {
      id: 'kp3',
      title: '連坐處罰',
      description: '理解連坐制度對民眾的影響',
      keywords: ['連坐', '處罰', '連帶', '責任', '懲罰']
    },
    {
      id: 'kp4',
      title: '土地調查',
      description: '了解土地調查如何改變土地制度',
      keywords: [
        ...(KEYWORDS.economy || []),
        '地籍', '測量', '土地權'
      ]
    },
    {
      id: 'kp5',
      title: '專賣制度',
      description: '探索專賣制度對經濟的影響',
      keywords: [
        ...(KEYWORDS.economy || []),
        '食鹽', '菸草'
      ]
    }
  ];

  // 檢查對話中是否提到相關關鍵詞
  const combinedText = userMessage + ' ' + assistantResponse;
  
  for (const kp of keyPoints) {
    const matchCount = kp.keywords.filter(keyword => 
      combinedText.includes(keyword)
    ).length;
    
    // 如果匹配到 2 個以上關鍵詞，視為達成該關鍵點
    if (matchCount >= 2) {
      // 檢查是否已經達成過（簡單檢查歷史中是否多次出現）
      const historyMentions = conversationHistory.filter(msg => 
        kp.keywords.some(keyword => msg.content.includes(keyword))
      ).length;
      
      // 如果歷史中提到不超過 2 次，視為新達成
      if (historyMentions <= 2) {
        console.log(`🌟 Key point achieved: ${kp.title} (matched: ${matchCount} keywords)`);
        return kp;
      }
    }
  }
  
  return null;
}

/**
 * 檢查是否解鎖下一階段 (簡化版)
 */
function checkStageUnlock(userMessage: string, conversationTurns: number): string | null {
  // 組合階段檢查關鍵詞，使用後端 KEYWORDS 並補充任務關鍵詞
  const stageKeywords: Record<string, string[]> = {
    'stage_1_intro': [
      ...(KEYWORDS.law || []),
      '總督專制'
    ],
    'stage_2_power': [
      ...(KEYWORDS.government || []),
      '保甲', '保甲制度', '連坐', '警察政治'
    ],
    'stage_3_finance': [
      ...(KEYWORDS.economy || []),
      '田賦', '財政'
    ]
  };

  for (const [stageId, words] of Object.entries(stageKeywords)) {
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

/**
 * 濃縮對話 - 提取關鍵信息並生成摘要
 */
export async function summarizeConversation(
  messages: Array<{ role: string; content: string }>,
  npcId: string,
  existingSummaries: any[] = [],
  existingKeyPoints: any[] = []
): Promise<{ summary: any; newKeyPoints: any[] }> {
  try {
    const npcInfo = NPC_MAPPING[npcId];
    const playerPersona = loadPlayerPersona();
    
    console.log(`📝 濃縮對話中... NPC: ${npcInfo.name}, 訊息數: ${messages.length}`);
    
    // 構建濃縮提示詞
    const summaryPrompt = `
你是對話分析助手。請分析以下對話並提取關鍵信息。

# 對話參與者
- 玩家：${playerPersona?.name || '鈴木先生'}（${playerPersona?.role || '文官'}）
- NPC：${npcInfo.name}（${npcInfo.role}）

# 對話記錄（最近5條）
${messages.map((m, i) => {
  const speaker = m.role === 'user' ? playerPersona?.name || '鈴木先生' : npcInfo.name;
  return `${i + 1}. ${speaker}：${m.content}`;
}).join('\n')}

# 已有的摘要（之前的對話）
${existingSummaries.length > 0 ? existingSummaries.map((s: any, i: number) => 
  `片段${i + 1}: ${s.playerIntent} → ${s.npcResponse}`
).join('\n') : '（無）'}

# 已發現的關鍵線索
${existingKeyPoints.length > 0 ? existingKeyPoints.map((kp: any) => `- ${kp.title}`).join('\n') : '（無）'}

請提取以下信息並以 JSON 格式回答：
{
  "playerIntent": "鈴木先生在這段對話中主要想了解什麼（簡短，20字內）",
  "npcResponse": "NPC 提供了哪些關鍵信息（簡短，30字內）",
  "discoveredKeywords": ["關鍵概念1", "關鍵概念2"],
  "emotionalTone": "對話氣氛（如：友善、正式、緊張）",
  "relationshipChange": "雙方關係的變化（如果有，否則留空）",
  "newKeyPoints": [
    {
      "title": "新發現的關鍵概念",
      "description": "簡短描述（15字內）",
      "category": "法律/財政/社會控制"
    }
  ]
}

注意：
1. newKeyPoints 只包含「新發現的」線索，已在「已發現的關鍵線索」中的不要重複
2. 提取的關鍵字要與日治時期臺灣歷史相關（如：六三法、土地調查、保甲制度等）
3. 濃縮要簡潔，保留最重要的信息
`;

    const mistralMessages: MistralChatMessage[] = [
      { role: 'user', content: summaryPrompt }
    ];

    const response = await chatWithMistral(mistralMessages, {
      temperature: 0.3, // 低溫度保證一致性
      maxTokens: 500
    });

    // 解析 JSON 回應
    let parsed: any;
    try {
      // 嘗試提取 JSON（有時 LLM 會包含額外文字）
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(response);
      }
    } catch (e) {
      console.error('❌ JSON 解析失敗，使用預設結構');
      parsed = {
        playerIntent: "探索歷史",
        npcResponse: "提供了相關信息",
        discoveredKeywords: [],
        emotionalTone: "正式",
        relationshipChange: "",
        newKeyPoints: []
      };
    }

    // 構建摘要結構
    const summary = {
      id: `summary-${Date.now()}`,
      startMessageId: messages[0]?.role || '',
      endMessageId: messages[messages.length - 1]?.role || '',
      timestamp: new Date().toISOString(),
      playerIntent: parsed.playerIntent,
      npcResponse: parsed.npcResponse,
      discoveredKeywords: parsed.discoveredKeywords || [],
      emotionalTone: parsed.emotionalTone || '正式',
      relationshipChange: parsed.relationshipChange || ''
    };

    // 構建新關鍵線索
    const newKeyPoints = (parsed.newKeyPoints || []).map((kp: any) => ({
      id: `keypoint-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: kp.title,
      description: kp.description,
      category: kp.category,
      discoveredAt: new Date().toISOString(),
      sourceNpcId: npcId
    }));

    console.log(`✅ 濃縮完成：${summary.playerIntent}`);
    console.log(`🔑 新線索 (${newKeyPoints.length}):`, newKeyPoints.map((kp: any) => kp.title).join(', '));

    return { summary, newKeyPoints };
  } catch (error: any) {
    console.error('❌ 濃縮對話失敗:', error.message);
    throw error;
  }
}
