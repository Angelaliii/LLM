/**
 * @deprecated 此文件已廢棄 - 改用 LLM 搭便車模式生成 suggestions
 * 
 * 舊設計：PromptService - 基於知識圖譜的檢索式引導 (Knowledge-Graph based Retrieval Guidance)
 * 新設計：LLM 在生成 NPC 回應時，同時生成 <suggestions> 標籤內容（搭便車模式）
 * 
 * 原設計理念（已被新方式取代）：
 * 1. 避免 LLM 幻覺問題 - 使用預定義的提問庫而非動態生成
 *    → 新方式：LLM 在有完整 persona 和對話上下文時，生成的 suggestions 更貼合當下情境
 * 2. 確保教學目標達成 - 每個提示都對應特定的學習階段和認知目標
 *    → 新方式：在 persona 中明確要求 LLM 必須生成 fact/conflict/empathy 三種類型的提問
 * 3. 動態推送鷹架問題 - 根據對話上下文分析，推送引發後設認知的問題
 *    → 新方式：LLM 根據當前對話內容，動態生成最相關的追問建議
 * 
 * 優點：
 * - 減少維護成本（不需要手動維護龐大的 PROMPT_LIBRARY）
 * - 更貼合對話上下文（LLM 知道剛才說了什麼）
 * - 統一架構（所有 NPC 邏輯都在 persona 文件中）
 */

// 追問層次定義（對應 Bloom's Taxonomy 認知層級）
export type InquiryLevel = 'fact' | 'conflict' | 'empathy';

// 話題類型定義（對應學習階段的關鍵概念）
export type TopicKey = 
  | 'governor_power'      // 總督權力
  | 'law_63'             // 六三法
  | 'police_authority'   // 警察即決權
  | 'hokko_system'       // 保甲制度
  | 'land_survey'        // 土地調查
  | 'monopoly_system'    // 專賣制度
  | 'social_reform'      // 舊習改良
  | 'education'          // 教育制度
  | 'resistance'         // 抗日活動
  | 'daily_life'         // 日常生活
  | 'generic';           // 通用話題

// 提示結構
export interface PromptChip {
  id: string;
  text: string;
  level: InquiryLevel;
  context: TopicKey;
  stage?: number; // 對應的學習階段 (1-3)
}

// NPC 特定提示庫（基於知識圖譜）
// 使用 Partial 允許不同 NPC 擁有不同的話題覆蓋範圍
const PROMPT_LIBRARY: Record<string, Partial<Record<TopicKey, PromptChip[]>>> = {
  // 小清（學生）的提示庫
  'student': {
    'governor_power': [
      { id: 's_gov_fact', text: '老師或警察有跟你們說過總督大人有什麼權力嗎？', level: 'fact', context: 'governor_power', stage: 1 },
      { id: 's_gov_conflict', text: '你們學校的老師和家裡的大人，對總督的看法一樣嗎？', level: 'conflict', context: 'governor_power', stage: 1 },
      { id: 's_gov_empathy', text: '聽到總督的命令時，你會覺得害怕嗎？', level: 'empathy', context: 'governor_power', stage: 1 }
    ],
    'police_authority': [
      { id: 's_police_fact', text: '警察大人在你們那邊都管些什麼事？', level: 'fact', context: 'police_authority', stage: 2 },
      { id: 's_police_conflict', text: '有沒有人敢反抗警察的命令？後來發生什麼事？', level: 'conflict', context: 'police_authority', stage: 2 },
      { id: 's_police_empathy', text: '你看到警察抓人的時候，心裡在想什麼？', level: 'empathy', context: 'police_authority', stage: 2 }
    ],
    'hokko_system': [
      { id: 's_hokko_fact', text: '甲長伯伯平常都會來你們家問什麼問題？', level: 'fact', context: 'hokko_system', stage: 2 },
      { id: 's_hokko_conflict', text: '鄰居之間會互相幫忙，還是互相監視？', level: 'conflict', context: 'hokko_system', stage: 2 },
      { id: 's_hokko_empathy', text: '如果鄰居做錯事，你們也要被罰，你覺得公平嗎？', level: 'empathy', context: 'hokko_system', stage: 2 }
    ],
    'social_reform': [
      { id: 's_reform_fact', text: '你阿嬤放足的時候，有哭嗎？她說了什麼？', level: 'fact', context: 'social_reform', stage: 2 },
      { id: 's_reform_conflict', text: '學校老師說放足是文明，但阿嬤說很痛，你相信誰？', level: 'conflict', context: 'social_reform', stage: 2 },
      { id: 's_reform_empathy', text: '看到阿嬤痛苦的樣子，你有什麼感覺？', level: 'empathy', context: 'social_reform', stage: 2 }
    ],
    'education': [
      { id: 's_edu_fact', text: '在公學校除了日語，還教你們什麼？', level: 'fact', context: 'education', stage: 2 },
      { id: 's_edu_conflict', text: '學校教的東西和家裡大人說的不一樣時，你會怎麼辦？', level: 'conflict', context: 'education', stage: 2 },
      { id: 's_edu_empathy', text: '你喜歡去學校上課嗎？為什麼？', level: 'empathy', context: 'education', stage: 2 }
    ],
    'generic': [
      { id: 's_gen_fact', text: '能再詳細說說當時發生的事嗎？', level: 'fact', context: 'generic' },
      { id: 's_gen_conflict', text: '大人們對這件事有不同的看法嗎？', level: 'conflict', context: 'generic' },
      { id: 's_gen_empathy', text: '那時候你的感覺是什麼？', level: 'empathy', context: 'generic' }
    ]
  },

  // 佐藤警官（警察）的提示庫
  'police_officer': {
    'governor_power': [
      { id: 'p_gov_fact', text: '總督的命令是如何下達到你們警察這裡的？', level: 'fact', context: 'governor_power', stage: 1 },
      { id: 'p_gov_conflict', text: '有沒有其他日本官員質疑過總督的權力？', level: 'conflict', context: 'governor_power', stage: 1 },
      { id: 'p_gov_empathy', text: '執行總督的命令時，你完全沒有猶豫嗎？', level: 'empathy', context: 'governor_power', stage: 1 }
    ],
    'law_63': [
      { id: 'p_law_fact', text: '你提到的這個制度，在法律上有正式的名稱嗎？', level: 'fact', context: 'law_63', stage: 1 },
      { id: 'p_law_empathy', text: '你認為這種制度是必要的惡，還是理所當然？', level: 'empathy', context: 'law_63', stage: 1 }
    ],
    'police_authority': [
      { id: 'p_police_fact', text: '即決處罰的標準是什麼？誰來決定？', level: 'fact', context: 'police_authority', stage: 2 },
      { id: 'p_police_empathy', text: '看到本島人害怕你們的樣子，你有什麼感覺？', level: 'empathy', context: 'police_authority', stage: 2 }
    ],
    'hokko_system': [
      { id: 'p_hokko_fact', text: '保甲制度是如何運作的？甲長如何選出？', level: 'fact', context: 'hokko_system', stage: 2 },
      { id: 'p_hokko_conflict', text: '本島人私下怎麼看待保甲制度？有抵抗嗎？', level: 'conflict', context: 'hokko_system', stage: 2 },
      { id: 'p_hokko_empathy', text: '讓人民互相監視，你覺得這是好的統治方式嗎？', level: 'empathy', context: 'hokko_system', stage: 2 }
    ],
    'resistance': [
      { id: 'p_resist_fact', text: '你抓過多少抗日份子？他們都用什麼方式反抗？', level: 'fact', context: 'resistance', stage: 2 },
      { id: 'p_resist_conflict', text: '總督府認為是土匪，但他們自稱是義軍，你怎麼看？', level: 'conflict', context: 'resistance', stage: 2 },
      { id: 'p_resist_empathy', text: '鎮壓的過程中，你有沒有同情過任何一個本島人？', level: 'empathy', context: 'resistance', stage: 2 }
    ],
    'generic': [
      { id: 'p_gen_fact', text: '能具體說明一下執行的細節嗎？', level: 'fact', context: 'generic' },
      { id: 'p_gen_conflict', text: '本島人和日本官員對此有不同看法嗎？', level: 'conflict', context: 'generic' },
      { id: 'p_gen_empathy', text: '作為執法者，你對這件事的真實想法是什麼？', level: 'empathy', context: 'generic' }
    ]
  },

  // 山本測量員（土地測量員）的提示庫
  'land_surveyor': {
    'land_survey': [
      { id: 'l_survey_fact', text: '土地調查的具體步驟是什麼？需要多久？', level: 'fact', context: 'land_survey', stage: 3 },
      { id: 'l_survey_conflict', text: '地主們配合測量嗎？有人反抗嗎？', level: 'conflict', context: 'land_survey', stage: 3 },
      { id: 'l_survey_empathy', text: '看到農民失去祖傳土地，你有什麼感受？', level: 'empathy', context: 'land_survey', stage: 3 }
    ],
    'monopoly_system': [
      { id: 'l_mono_fact', text: '專賣制度涵蓋哪些商品？收入有多少？', level: 'fact', context: 'monopoly_system', stage: 3 },
      { id: 'l_mono_conflict', text: '商人們對專賣制度有什麼抱怨？總督府如何回應？', level: 'conflict', context: 'monopoly_system', stage: 3 },
      { id: 'l_mono_empathy', text: '你認為專賣制度是為了台灣好，還是為了日本好？', level: 'empathy', context: 'monopoly_system', stage: 3 }
    ],
    'governor_power': [
      { id: 'l_gov_fact', text: '總督府的財政收入來源有哪些？', level: 'fact', context: 'governor_power', stage: 3 },
      { id: 'l_gov_conflict', text: '總督府追求財政獨立，對本島人是好是壞？', level: 'conflict', context: 'governor_power', stage: 3 },
      { id: 'l_gov_empathy', text: '身為技術官僚，你覺得殖民統治可以被數據合理化嗎？', level: 'empathy', context: 'governor_power', stage: 3 }
    ],
    'generic': [
      { id: 'l_gen_fact', text: '能提供一些具體的數據或案例嗎？', level: 'fact', context: 'generic' },
      { id: 'l_gen_conflict', text: '在數據背後，是否有被忽略的聲音？', level: 'conflict', context: 'generic' },
      { id: 'l_gen_empathy', text: '從專業角度看，你認為這項政策是否公正？', level: 'empathy', context: 'generic' }
    ]
  }
};

/**
 * 話題偵測函式 (Topic Detector)
 * 使用 NLP 關鍵字匹配來識別當前對話話題
 */
export function detectTopic(message: string, npcId: string): TopicKey {
  if (!message) return 'generic';

  const msg = message.toLowerCase();

  // Stage 1: 總督權力與六三法相關
  if (msg.includes('總督') || msg.includes('命令') || msg.includes('律令') || msg.includes('立法')) {
    return 'governor_power';
  }
  if (msg.includes('六三法') || msg.includes('63法') || msg.includes('法律第六十三號')) {
    return 'law_63';
  }

  // Stage 2: 警察權力與社會控制
  if (msg.includes('警察') || msg.includes('巡查') || msg.includes('即決') || msg.includes('處罰')) {
    return 'police_authority';
  }
  if (msg.includes('保甲') || msg.includes('甲長') || msg.includes('連坐') || msg.includes('壯丁')) {
    return 'hokko_system';
  }
  if (msg.includes('纏足') || msg.includes('放足') || msg.includes('辮子') || msg.includes('剪髮') || msg.includes('衛生')) {
    return 'social_reform';
  }

  // Stage 3: 土地與財政
  if (msg.includes('土地') || msg.includes('測量') || msg.includes('隱田') || msg.includes('地籍') || msg.includes('田賦')) {
    return 'land_survey';
  }
  if (msg.includes('專賣') || msg.includes('樟腦') || msg.includes('鴉片') || msg.includes('食鹽') || msg.includes('財政')) {
    return 'monopoly_system';
  }

  // 教育相關
  if (msg.includes('學校') || msg.includes('公學校') || msg.includes('國語') || msg.includes('老師') || msg.includes('教育')) {
    return 'education';
  }

  // 抗日活動
  if (msg.includes('土匪') || msg.includes('抗日') || msg.includes('反抗') || msg.includes('叛亂')) {
    return 'resistance';
  }

  // 日常生活
  if (msg.includes('家裡') || msg.includes('阿嬤') || msg.includes('鄰居') || msg.includes('生活')) {
    return 'daily_life';
  }

  return 'generic';
}

/**
 * 主生成函式 (Main Generator)
 * 基於 NPC ID 和話題，從知識圖譜中檢索最適合的提示
 */
export function getSmartPrompts(
  npcId: string,
  lastMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): PromptChip[] {
  // 步驟 A: 話題偵測
  const topic = detectTopic(lastMessage, npcId);
  
  console.log(`🎯 Topic detected: ${topic} for NPC: ${npcId}`);

  // 步驟 B: 查閱 NPC 特定的提示庫
  const npcLibrary = PROMPT_LIBRARY[npcId];
  
  if (!npcLibrary) {
    console.warn(`⚠️ No prompt library found for NPC: ${npcId}, using fallback`);
    return getFallbackPrompts();
  }

  const topicPrompts = npcLibrary[topic];
  
  if (!topicPrompts || topicPrompts.length === 0) {
    console.warn(`⚠️ No prompts found for topic: ${topic}, using generic prompts`);
    return npcLibrary['generic'] || getFallbackPrompts();
  }

  // 步驟 C: 返回該話題的所有提示（前端可以選擇顯示哪些）
  return topicPrompts;
}

/**
 * 防呆機制 (Fallback)
 * 當找不到對應提示時，返回通用提示
 */
function getFallbackPrompts(): PromptChip[] {
  return [
    { id: 'fallback_fact', text: '能再詳細說明一下嗎？', level: 'fact', context: 'generic' },
    { id: 'fallback_conflict', text: '對於這件事，有不同的看法嗎？', level: 'conflict', context: 'generic' },
    { id: 'fallback_empathy', text: '你對這件事有什麼感受？', level: 'empathy', context: 'generic' }
  ];
}

/**
 * 根據學習階段過濾提示
 * 可用於漸進式解鎖提示
 */
export function filterPromptsByStage(prompts: PromptChip[], maxStage: number): PromptChip[] {
  return prompts.filter(p => !p.stage || p.stage <= maxStage);
}

/**
 * 獲取初始對話提示
 * 用於對話開始時引導學生提出第一個問題
 */
export function getInitialPrompts(npcId: string): PromptChip[] {
  const initialPrompts: Record<string, PromptChip[]> = {
    'student': [
      { id: 'init_intro', text: '小清，你能先自我介紹一下嗎？', level: 'fact', context: 'generic' },
      { id: 'init_school', text: '你在公學校都學些什麼？', level: 'fact', context: 'education' },
      { id: 'init_life', text: '你們家最近有發生什麼特別的事嗎？', level: 'empathy', context: 'daily_life' }
    ],
    'police_officer': [
      { id: 'init_intro', text: '佐藤警官，能介紹一下你的工作嗎？', level: 'fact', context: 'generic' },
      { id: 'init_duty', text: '你今天執勤遇到了什麼情況？', level: 'fact', context: 'police_authority' },
      { id: 'init_power', text: '警察在這裡的權力很大嗎？', level: 'conflict', context: 'police_authority' }
    ],
    'land_surveyor': [
      { id: 'init_intro', text: '山本先生，能說明一下你的工作內容嗎？', level: 'fact', context: 'generic' },
      { id: 'init_survey', text: '土地調查進行得如何？', level: 'fact', context: 'land_survey' },
      { id: 'init_finance', text: '這項工作對總督府的財政有什麼幫助？', level: 'fact', context: 'monopoly_system' }
    ]
  };

  return initialPrompts[npcId] || getFallbackPrompts();
}
