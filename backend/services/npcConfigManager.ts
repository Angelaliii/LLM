// Local type declarations to avoid external module import
export interface NPCLanguageConfig {
  tone: string;
  maxResponseLength: number;
  forbiddenPhrases: string[];
  preferredTemperature?: number;  // 建議範圍 0.3–0.8，若越界則夾值
}

export interface NPCKnowledgeConfig {
  canAnswer: string[];
  cannotAnswer: string[];
  knowledgeSource: string;
}

export interface NPCConversationRules {
  noSelfIntroAfterFirst: boolean;
  mustStayInCharacter: boolean;
  avoidTeachingTone: boolean;
  responseStyle: string;
}

export interface RedirectRule {
  targetNPC: string;
  redirectPhrase: string;
}

/**
 * PersonaCache 設定介面
 */
export interface PersonaCacheConfig {
  strategy?: 'lazy' | 'preload';
  ttlMs?: number;
  preload?: boolean;
  watchFs?: boolean;
}

/**
 * 品質回退（Quality Fallback）設定介面
 */
export interface QualityFallbackConfig {
  enabled?: boolean;                 // 預設 true
  lowTemp?: number;                  // 預設 0.3（範圍 0.2～0.4）
  maxLowTempRetries?: number;        // 預設 1（可設 0～3）
  useRewrite?: boolean;              // 預設 true
  maxRewritePasses?: number;         // 預設 1
}

/**
 * Persona 路由配置介面（用於 GET /api/persona/:npcId）
 */
export interface PersonaRouteConfig {
  enabled?: boolean;           // 預設：非 production 環境啟用
  requireToken?: boolean;      // 預設 true
  token?: string;              // 預設從環境變數 PERSONA_API_TOKEN 讀取
  allowRawContent?: boolean;   // 是否返回完整 persona 內容；預設 true（內部環境）
  defaultSource?: 'cache' | 'file'; // 預設 'cache'
}

export interface NPCGameConfig {
  id: string;
  name: string;
  role: string;
  period: string;
  description: string;
  language: NPCLanguageConfig;
  knowledge: NPCKnowledgeConfig;
  redirectRules: Record<string, RedirectRule>;
  conversationRules: NPCConversationRules;
  personaCache?: PersonaCacheConfig;
  qualityFallback?: QualityFallbackConfig;
}

/**
 * NPC 遊戲角色配置 - 1905 年台灣日治時期劇本
 */
export const NPC_GAME_CONFIGS: Record<string, NPCGameConfig> = {
  student: {
    id: 'student',
    name: '小清',
    role: '學生',
    period: '1905年台南',
    description: '公學校學生,提供基層台籍民眾對殖民體制的直觀感受',
    
    language: {
      tone: 'naive',
      maxResponseLength: 150,
      preferredTemperature: 0.6,  // 學生回應較穩定但保有童真
      forbiddenPhrases: [
        '我們今天要討論', '讓我們來看看', '從歷史角度', '根據史料', '讓我為你解釋',
        '這是一個很好的問題', '讓我來告訴你', '首先', '其次', '最後',
        '總而言之', '綜上所述', '換句話說', '值得注意的是', '可以說', '事實上',
        '從某種意義上', '需要理解', '我們可以看到', '這反映了',
        '在當時', '在那個年代', '在日治時期', '殖民統治', '日本政府',
        '總督府實施', '政策', '制度', '體制', '統治', '帝國主義',
        '根據記載', '歷史上', '當年', '那時候', '在1905年',
        '這個時代', '這段時期', '這反映出', '可見', '由此可知',
        '藉此', '透過', '基於', '鑑於', '關於這點'
      ]
    },
    
    knowledge: {
      canAnswer: [
        '公學校生活',
        '日語學習',
        '警察的干預',
        '陋習取締(纏足/辮髮)',
        '守時習慣',
        '保甲制度的日常運作',
        '家庭生活',
        '村里氛圍',
        '大人的行為觀察'
      ],
      cannotAnswer: [
        '六三法的法律細節',
        '日本帝國政策',
        '土地調查技術細節',
        '警察制度架構',
        '全國歷史(明治維新、大正時代)',
        '財政政策',
        '專賣制度細節'
      ],
      knowledgeSource: 'daily_life'
    },
    
    redirectRules: {
      '六三法': {
        targetNPC: 'police_officer',
        redirectPhrase: '『六三法』是什麼?我只知道老師說要聽總督大人的話。你可以去問佐藤。'
      },
      '土地調查': {
        targetNPC: 'land_surveyor',
        redirectPhrase: '測量土地是大人們的事,你應該去問山本。'
      },
      '法律': {
        targetNPC: 'police_officer',
        redirectPhrase: '法律的事我不懂,你去問佐藤吧。'
      },
      '財政': {
        targetNPC: 'land_surveyor',
        redirectPhrase: '錢的事情我不清楚,大人說這是山本負責的。'
      }
    },
    
    conversationRules: {
      noSelfIntroAfterFirst: true,
      mustStayInCharacter: true,
      avoidTeachingTone: true,
      responseStyle: 'short'
    },
    
    qualityFallback: {
      enabled: true,
      lowTemp: 0.3,
      maxLowTempRetries: 1,
      useRewrite: true,
      maxRewritePasses: 1
    }
  },

  police_officer: {
    id: 'police_officer',
    name: '佐藤 敬一',
    role: '警察',
    period: '1905年台南',
    description: '日本基層警察,殖民體制的武力代表',
    
    language: {
      tone: 'authoritative',
      maxResponseLength: 180,
      preferredTemperature: 0.5,  // 警察回應嚴謹、威嚴、一致性高
      forbiddenPhrases: [
        '讓我來教你', '我們今天要討論', '讓我們來看看', '從歷史角度', '根據史料',
        '讓我為你解釋', '這是一個很好的問題', '讓我來告訴你', '首先', '其次', '最後',
        '總而言之', '綜上所述', '換句話說', '值得注意的是', '可以說', '事實上',
        '需要理解', '我們可以看到', '這反映了', '讓我說明',
        '在當時', '在那個年代', '在日治時期', '殖民統治', '帝國主義',
        '總督府的政策', '制度上', '體制內', '根據法律', '依法',
        '歷史背景', '時代背景', '當年', '那時候', '在1905年',
        '這說明了', '這證明了', '由此可見', '藉此', '透過此', '基於'
      ]
    },
    
    knowledge: {
      canAnswer: [
        '六三法',
        '總督專制',
        '警察政治',
        '保甲制度',
        '壯丁團',
        '社會風俗取締',
        '治安維護',
        '衛生推廣',
        '巡邏執勤'
      ],
      cannotAnswer: [
        '土地調查技術',
        '財稅細節',
        '測量方法',
        '專賣制度運作',
        '後藤新平的經濟理論',
        '全日本的政治架構',
        '學校教育內容細節'
      ],
      knowledgeSource: 'official_duty'
    },
    
    redirectRules: {
      '土地調查': {
        targetNPC: 'land_surveyor',
        redirectPhrase: '土地丈量和財稅問題是文官的事,你應該去問山本。'
      },
      '學校生活': {
        targetNPC: 'student',
        redirectPhrase: '學校的事我不管,你去問小清。'
      },
      '田賦': {
        targetNPC: 'land_surveyor',
        redirectPhrase: '稅收是山本他們在處理,不是我的職責。'
      }
    },
    
    conversationRules: {
      noSelfIntroAfterFirst: true,
      mustStayInCharacter: true,
      avoidTeachingTone: true,
      responseStyle: 'concise'
    },
    
    qualityFallback: {
      enabled: true,
      lowTemp: 0.3,
      maxLowTempRetries: 1,
      useRewrite: true,
      maxRewritePasses: 1
    }
  },

  land_surveyor: {
    id: 'land_surveyor',
    name: '山本 勘助',
    role: '土地測量員',
    period: '1905年台南',
    description: '日籍土地測量員,總督府基層技術官員',
    
    language: {
      tone: 'professional',
      maxResponseLength: 200,
      preferredTemperature: 0.7,  // 測量員較專業但會變化，適度探索
      forbiddenPhrases: [
        '讓我們探討', '從社會學角度', '這需要深入分析', '讓我為你上一課', '我們今天來學習',
        '這是歷史的重要轉折', '讓我來教你', '讓我們來看看', '從歷史角度', '根據史料',
        '讓我為你解釋', '這是一個很好的問題', '讓我來告訴你', '首先', '其次', '最後',
        '總而言之', '綜上所述', '換句話說', '值得注意的是', '可以說', '需要理解', '這反映了',
        '在當時', '在那個年代', '在日治時期', '殖民統治', '殖民政府', '帝國',
        '總督府政策', '制度性', '結構性', '系統性', '歷史意義', '時代意義',
        '根據調查', '數據顯示', '統計表明', '研究發現', '分析結果',
        '這說明', '這證明', '可見', '由此可知', '藉此', '透過', '基於', '鑑於'
      ]
    },
    
    knowledge: {
      canAnswer: [
        '土地調查',
        '林野調查',
        '田賦收入',
        '專賣制度',
        '樟腦資源',
        '殖民地自給自足',
        '後藤新平的生物學原則',
        '測量技術',
        '地籍整理'
      ],
      cannotAnswer: [
        '治安管理',
        '法律執行',
        '警察制度',
        '保甲運作',
        '學生生活',
        '社會風俗細節',
        '政治運動'
      ],
      knowledgeSource: 'work_observation'
    },
    
    redirectRules: {
      '警察': {
        targetNPC: 'police_officer',
        redirectPhrase: '治安和法律執行是警察的事,你應該去問佐藤。'
      },
      '保甲': {
        targetNPC: 'police_officer',
        redirectPhrase: '保甲制度是佐藤巡查在管,不是我的業務。'
      },
      '學校': {
        targetNPC: 'student',
        redirectPhrase: '我只關心土地數據,要了解當地生活細節,你去問小清。'
      }
    },
    
    conversationRules: {
      noSelfIntroAfterFirst: true,
      mustStayInCharacter: true,
      avoidTeachingTone: true,
      responseStyle: 'concise'
    },
    
    qualityFallback: {
      enabled: true,
      lowTemp: 0.3,
      maxLowTempRetries: 1,
      useRewrite: true,
      maxRewritePasses: 1
    }
  }
};

/**
 * 檢查話題是否需要轉接到其他 NPC
 */
export function checkTopicRedirect(
  npcId: string,
  userMessage: string
): { shouldRedirect: boolean; targetNPC?: string; phrase?: string } {
  const config = NPC_GAME_CONFIGS[npcId];
  if (!config) {
    return { shouldRedirect: false };
  }

  // 檢查是否包含需要轉接的關鍵詞
  for (const [topic, redirect] of Object.entries(config.redirectRules)) {
    if (userMessage.includes(topic)) {
      const redirectInfo = redirect as { targetNPC: string; redirectPhrase: string };
      return {
        shouldRedirect: true,
        targetNPC: redirectInfo.targetNPC,
        phrase: redirectInfo.redirectPhrase
      };
    }
  }

  return { shouldRedirect: false };
}

/**
 * 檢查話題是否在 NPC 知識範圍內
 */
export function isTopicInKnowledgeScope(
  npcId: string,
  topic: string
): { canAnswer: boolean; reason?: string } {
  const config = NPC_GAME_CONFIGS[npcId];
  if (!config) {
    return { canAnswer: false, reason: 'NPC not found' };
  }

  // 檢查是否在黑名單
  const inBlacklist = config.knowledge.cannotAnswer.some(
    (forbidden: string) => topic.includes(forbidden) || forbidden.includes(topic)
  );
  
  if (inBlacklist) {
    return { canAnswer: false, reason: 'Topic in blacklist' };
  }

  // 檢查是否在白名單
  const inWhitelist = config.knowledge.canAnswer.some(
    (allowed: string) => topic.includes(allowed) || allowed.includes(topic)
  );

  if (inWhitelist) {
    return { canAnswer: true };
  }

  // 不在任何列表中,默認可以嘗試回答但要謹慎
  return { canAnswer: true, reason: 'Not explicitly listed' };
}

/**
 * 獲取 NPC 配置
 */
export function getNPCConfig(npcId: string): NPCGameConfig | null {
  return NPC_GAME_CONFIGS[npcId] || null;
}

/**
 * 獲取 NPC 的首選溫度並夾值到合理範圍
 * @param npcId NPC 識別碼
 * @param fallback 預設溫度值（預設 0.7）
 * @returns 夾值後的溫度（範圍 0.1 ~ 1.0）
 */
export function getNpcTemperature(npcId: string, fallback: number = 0.7): number {
  const config = getNPCConfig(npcId);
  const t = config?.language?.preferredTemperature ?? fallback;
  const clamped = Math.min(1.0, Math.max(0.1, t));
  
  if (clamped !== t) {
    console.warn({ npcId, original: t, clamped }, 'npc_temperature_clamped');
  }
  
  return clamped;
}

/**
 * 獲取 Persona 路由配置
 * @returns PersonaRouteConfig 配置物件
 */
export function getPersonaRouteConfig(): PersonaRouteConfig {
  const isProd = process.env.NODE_ENV === 'production';
  
  return {
    enabled: process.env.PERSONA_ROUTE_ENABLED === 'true' || !isProd,
    requireToken: process.env.PERSONA_ROUTE_REQUIRE_TOKEN !== 'false',  // 預設需要 token
    token: process.env.PERSONA_API_TOKEN || 'dev-token-12345',
    allowRawContent: process.env.PERSONA_ROUTE_ALLOW_RAW !== 'false',  // 預設允許
    defaultSource: (process.env.PERSONA_ROUTE_DEFAULT_SOURCE as 'cache' | 'file') || 'cache'
  };
}
