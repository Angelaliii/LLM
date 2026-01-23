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

// NPC prompt library (topic-based)
// Partial allows different NPCs to cover different topics
const PROMPT_LIBRARY: Record<string, Partial<Record<TopicKey, PromptChip[]>>> = {
  // 小清（學生）的提示庫
  'student': {
    'governor_power': [
      { id: 's_gov_fact', text: 'Did your teacher or the police tell you what powers the Governor-General has?', level: 'fact', context: 'governor_power', stage: 1 },
      { id: 's_gov_conflict', text: 'Do your teachers and family see the Governor-General the same way?', level: 'conflict', context: 'governor_power', stage: 1 },
      { id: 's_gov_empathy', text: 'Do you feel scared when you hear the Governor-General issue orders?', level: 'empathy', context: 'governor_power', stage: 1 }
    ],
    'police_authority': [
      { id: 's_police_fact', text: 'What kinds of things do the police control in your area?', level: 'fact', context: 'police_authority', stage: 2 },
      { id: 's_police_conflict', text: 'Has anyone ever resisted a police order? What happened after?', level: 'conflict', context: 'police_authority', stage: 2 },
      { id: 's_police_empathy', text: 'What goes through your mind when you see police catch someone?', level: 'empathy', context: 'police_authority', stage: 2 }
    ],
    'hokko_system': [
      { id: 's_hokko_fact', text: 'What does the baozhang usually ask when he visits your home?', level: 'fact', context: 'hokko_system', stage: 2 },
      { id: 's_hokko_conflict', text: 'Do neighbors help one another or watch each other?', level: 'conflict', context: 'hokko_system', stage: 2 },
      { id: 's_hokko_empathy', text: 'If a neighbor errs and everyone is fined, does that feel fair to you?', level: 'empathy', context: 'hokko_system', stage: 2 }
    ],
    'social_reform': [
      { id: 's_reform_fact', text: 'Did your grandma cry when she unbound her feet? What did she say?', level: 'fact', context: 'social_reform', stage: 2 },
      { id: 's_reform_conflict', text: 'School says unbinding is civilized, but grandma says it hurts—who do you believe?', level: 'conflict', context: 'social_reform', stage: 2 },
      { id: 's_reform_empathy', text: 'How did you feel seeing your grandma in pain?', level: 'empathy', context: 'social_reform', stage: 2 }
    ],
    'education': [
      { id: 's_edu_fact', text: 'Besides Japanese, what else do you learn at public school?', level: 'fact', context: 'education', stage: 2 },
      { id: 's_edu_conflict', text: 'When school teachings differ from family, what do you do?', level: 'conflict', context: 'education', stage: 2 },
      { id: 's_edu_empathy', text: 'Do you like going to school? Why?', level: 'empathy', context: 'education', stage: 2 }
    ],
    'generic': [
      { id: 's_gen_fact', text: 'Can you describe what happened in more detail?', level: 'fact', context: 'generic' },
      { id: 's_gen_conflict', text: 'Do the adults have different views on this?', level: 'conflict', context: 'generic' },
      { id: 's_gen_empathy', text: 'How did you feel at that moment?', level: 'empathy', context: 'generic' }
    ]
  },

  // 佐藤警官（警察）的提示庫
  'police_officer': {
    'governor_power': [
      { id: 'p_gov_fact', text: 'How do the Governor-General’s orders reach the police?', level: 'fact', context: 'governor_power', stage: 1 },
      { id: 'p_gov_conflict', text: 'Have any Japanese officials questioned the Governor-General’s power?', level: 'conflict', context: 'governor_power', stage: 1 },
      { id: 'p_gov_empathy', text: 'Do you hesitate at all when enforcing the Governor-General’s orders?', level: 'empathy', context: 'governor_power', stage: 1 }
    ],
    'law_63': [
      { id: 'p_law_fact', text: 'What is the formal legal name for this authority?', level: 'fact', context: 'law_63', stage: 1 },
      { id: 'p_law_conflict', text: 'Do police in Japan proper have this power? Why is Taiwan different?', level: 'conflict', context: 'law_63', stage: 1 },
      { id: 'p_law_empathy', text: 'Do you see this system as a necessary evil or just natural?', level: 'empathy', context: 'law_63', stage: 1 }
    ],
    'police_authority': [
      { id: 'p_police_fact', text: 'What standards trigger summary punishment, and who decides?', level: 'fact', context: 'police_authority', stage: 2 },
      { id: 'p_police_conflict', text: 'Have locals accused the police of abuse? What happened?', level: 'conflict', context: 'police_authority', stage: 2 },
      { id: 'p_police_empathy', text: 'How do you feel when you see locals fear you?', level: 'empathy', context: 'police_authority', stage: 2 }
    ],
    'hokko_system': [
      { id: 'p_hokko_fact', text: 'How does the baojia system operate, and how is a baozhang chosen?', level: 'fact', context: 'hokko_system', stage: 2 },
      { id: 'p_hokko_conflict', text: 'How do locals privately view baojia? Any resistance?', level: 'conflict', context: 'hokko_system', stage: 2 },
      { id: 'p_hokko_empathy', text: 'Do you think making people watch each other is good governance?', level: 'empathy', context: 'hokko_system', stage: 2 }
    ],
    'resistance': [
      { id: 'p_resist_fact', text: 'How many insurgents have you arrested, and how did they resist?', level: 'fact', context: 'resistance', stage: 2 },
      { id: 'p_resist_conflict', text: 'The Governor-General calls them bandits; they call themselves righteous armies. What is your view?', level: 'conflict', context: 'resistance', stage: 2 },
      { id: 'p_resist_empathy', text: 'During suppression, have you ever felt sympathy for any local?', level: 'empathy', context: 'resistance', stage: 2 }
    ],
    'generic': [
      { id: 'p_gen_fact', text: 'Can you describe the enforcement details?', level: 'fact', context: 'generic' },
      { id: 'p_gen_conflict', text: 'Do locals and Japanese officials see this differently?', level: 'conflict', context: 'generic' },
      { id: 'p_gen_empathy', text: 'As an enforcer, what is your honest view?', level: 'empathy', context: 'generic' }
    ]
  },

  // 山本測量員（土地測量員）的提示庫
  'land_surveyor': {
    'land_survey': [
      { id: 'l_survey_fact', text: 'What are the concrete steps of the land survey, and how long does it take?', level: 'fact', context: 'land_survey', stage: 3 },
      { id: 'l_survey_conflict', text: 'Do landowners cooperate with the measurements? Any resistance?', level: 'conflict', context: 'land_survey', stage: 3 },
      { id: 'l_survey_empathy', text: 'How do you feel when farmers lose ancestral land?', level: 'empathy', context: 'land_survey', stage: 3 }
    ],
    'monopoly_system': [
      { id: 'l_mono_fact', text: 'Which goods fall under the monopoly system, and how much revenue comes in?', level: 'fact', context: 'monopoly_system', stage: 3 },
      { id: 'l_mono_conflict', text: 'What complaints do merchants have about monopolies, and how does the Governor-General respond?', level: 'conflict', context: 'monopoly_system', stage: 3 },
      { id: 'l_mono_empathy', text: 'Do you think monopolies help Taiwan or Japan more?', level: 'empathy', context: 'monopoly_system', stage: 3 }
    ],
    'governor_power': [
      { id: 'l_gov_fact', text: 'What are the revenue sources for the Governor-General’s office?', level: 'fact', context: 'governor_power', stage: 3 },
      { id: 'l_gov_conflict', text: 'Is the push for fiscal independence good or bad for locals?', level: 'conflict', context: 'governor_power', stage: 3 },
      { id: 'l_gov_empathy', text: 'As a technocrat, do you think colonial rule can be justified by data?', level: 'empathy', context: 'governor_power', stage: 3 }
    ],
    'generic': [
      { id: 'l_gen_fact', text: 'Can you provide concrete data or cases?', level: 'fact', context: 'generic' },
      { id: 'l_gen_conflict', text: 'Are there overlooked voices behind the numbers?', level: 'conflict', context: 'generic' },
      { id: 'l_gen_empathy', text: 'From a professional view, is this policy fair?', level: 'empathy', context: 'generic' }
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
    { id: 'fallback_fact', text: 'Could you explain that in more detail?', level: 'fact', context: 'generic' },
    { id: 'fallback_conflict', text: 'Are there different viewpoints about this?', level: 'conflict', context: 'generic' },
    { id: 'fallback_empathy', text: 'How do you feel about this?', level: 'empathy', context: 'generic' }
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
      { id: 'init_intro', text: 'Xiao Qing, could you introduce yourself first?', level: 'fact', context: 'generic' },
      { id: 'init_school', text: 'What do you learn at the public school?', level: 'fact', context: 'education' },
      { id: 'init_life', text: 'Has anything special happened at home recently?', level: 'empathy', context: 'daily_life' }
    ],
    'police_officer': [
      { id: 'init_intro', text: 'Officer Sato, can you introduce your work?', level: 'fact', context: 'generic' },
      { id: 'init_duty', text: 'What situations did you encounter on duty today?', level: 'fact', context: 'police_authority' },
      { id: 'init_power', text: 'Is police authority broad here?', level: 'conflict', context: 'police_authority' }
    ],
    'land_surveyor': [
      { id: 'init_intro', text: 'Mr. Yamamoto, can you describe your work?', level: 'fact', context: 'generic' },
      { id: 'init_survey', text: 'How is the land survey progressing?', level: 'fact', context: 'land_survey' },
      { id: 'init_finance', text: 'How does this work help the Governor-General’s finances?', level: 'fact', context: 'monopoly_system' }
    ]
  };

  return initialPrompts[npcId] || getFallbackPrompts();
}
