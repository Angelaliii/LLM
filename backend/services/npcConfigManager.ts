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
    name: 'Xiao Qing',
    role: 'Student',
    period: '1905 Tainan',
    description: 'Public school student offering a grassroots Taiwanese view of colonial rule',
    
    language: {
      tone: 'naive',
      maxResponseLength: 150,
      preferredTemperature: 0.6,  // keep responses steady but childlike
      forbiddenPhrases: [
        'let us discuss', 'according to historical records', 'from a historical perspective', 'let me explain to you', 'this is a good question',
        'first', 'second', 'finally', 'in summary', 'in other words', 'it is worth noting', 'actually',
        'as you can see', 'at that time', 'during this period', 'colonial rule', 'imperialism',
        'based on documents', 'according to the policy', 'this system reflects', 'the governor-general implemented',
        'in 1905', 'in this era', 'therefore it shows', 'by doing so', 'through this'
      ]
    },
    
    knowledge: {
      canAnswer: [
        'public school life',
        'learning Japanese language',
        'police interference',
        'custom bans (footbinding/queues)',
        'punctual habits',
        'daily baojia operations',
        'family life',
        'village atmosphere',
        'observing adult behavior'
      ],
      cannotAnswer: [
        'Law 63 legal details',
        'Japanese imperial policies',
        'land survey technical details',
        'police system structure',
        'national history (Meiji, Taisho)',
        'fiscal policy',
        'monopoly system details'
      ],
      knowledgeSource: 'daily_life'
    },
    
    redirectRules: {
      '六三法': {
        targetNPC: 'police_officer',
        redirectPhrase: 'Law 63? Teacher only said to obey the Governor-General. Please ask Sato.'
      },
      'Law 63': {
        targetNPC: 'police_officer',
        redirectPhrase: 'Law 63 is something Officer Sato handles. Please ask him.'
      },
      '土地調查': {
        targetNPC: 'land_surveyor',
        redirectPhrase: 'Land surveying is handled by the adults—ask Yamamoto.'
      },
      'land survey': {
        targetNPC: 'land_surveyor',
        redirectPhrase: 'Land measuring is Mr. Yamamoto’s job. Please ask him.'
      },
      '法律': {
        targetNPC: 'police_officer',
        redirectPhrase: 'I do not understand legal matters; please ask Sato.'
      },
      'law': {
        targetNPC: 'police_officer',
        redirectPhrase: 'Legal questions belong to Officer Sato. Please ask him.'
      },
      '財政': {
        targetNPC: 'land_surveyor',
        redirectPhrase: 'Money matters are not my thing; adults say Yamamoto handles it.'
      },
      'finance': {
        targetNPC: 'land_surveyor',
        redirectPhrase: 'Finance is Mr. Yamamoto’s topic. Please ask him.'
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
    name: 'Sato Keiichi',
    role: 'Police officer',
    period: '1905 Tainan',
    description: 'Japanese local patrolman representing the coercive arm of the colonial system',
    
    language: {
      tone: 'authoritative',
      maxResponseLength: 180,
      preferredTemperature: 0.5,  // authoritative and consistent
      forbiddenPhrases: [
        'let me teach you', 'we are here to discuss', 'from a historical perspective', 'according to historical records', 'let me explain',
        'this is a good question', 'first', 'second', 'finally', 'in summary', 'in other words', 'it is worth noting', 'actually',
        'you need to understand', 'this reflects', 'during that era', 'colonial rule', 'imperialism',
        'according to the policy', 'by law', 'based on the law', 'from a structural view', 'systemically',
        'historical background', 'in 1905', 'this shows', 'this proves', 'as can be seen', 'through this', 'based on this'
      ]
    },
    
    knowledge: {
      canAnswer: [
        'Law 63',
        'Governor-General autocratic power',
        'police politics',
        'baojia system',
        'militia/zhangding corps',
        'moral/custom crackdowns',
        'public security',
        'hygiene promotion',
        'patrol duties'
      ],
      cannotAnswer: [
        'land survey techniques',
        'fiscal and tax details',
        'surveying methods',
        'monopoly system operations',
        'Gotō Shinpei economic theory',
        'political structure of all Japan',
        'school curriculum details'
      ],
      knowledgeSource: 'official_duty'
    },
    
    redirectRules: {
      '土地調查': {
        targetNPC: 'land_surveyor',
        redirectPhrase: 'Land measurement and taxation are handled by Yamamoto. Ask him.'
      },
      'land survey': {
        targetNPC: 'land_surveyor',
        redirectPhrase: 'Survey and revenue matters belong to Yamamoto. Ask him.'
      },
      '學校生活': {
        targetNPC: 'student',
        redirectPhrase: 'School life is not my job. Ask Xiao Qing.'
      },
      'school': {
        targetNPC: 'student',
        redirectPhrase: 'Ask Xiao Qing about school matters.'
      },
      '田賦': {
        targetNPC: 'land_surveyor',
        redirectPhrase: 'Tax is handled by Yamamoto, not me.'
      },
      'land tax': {
        targetNPC: 'land_surveyor',
        redirectPhrase: 'Taxes and cadastre are Mr. Yamamoto’s responsibility.'
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
    name: 'Yamamoto Kansuke',
    role: 'Land surveyor',
    period: '1905 Tainan',
    description: 'Japanese land survey technician, grassroots technical officer for the Governor-General',
    
    language: {
      tone: 'professional',
      maxResponseLength: 200,
      preferredTemperature: 0.7,  // technical but slightly exploratory
      forbiddenPhrases: [
        'let us explore', 'from a sociological angle', 'this requires deep analysis', 'let me give you a lesson', 'today we will learn',
        'this is an important historical turning point', 'let me teach you', 'from a historical perspective', 'according to records',
        'this is a good question', 'first', 'second', 'finally', 'in summary', 'in other words', 'it is worth noting', 'you need to understand',
        'during that period', 'under colonial rule', 'imperial', 'governor-general policy', 'structural', 'systemic', 'historic significance',
        'according to the survey', 'data shows', 'statistics indicate', 'research finds', 'analysis results',
        'this shows', 'this proves', 'as can be seen', 'thus it can be known', 'through this', 'based on this'
      ]
    },
    
    knowledge: {
      canAnswer: [
        'land survey project',
        'forest survey',
        'land tax revenue',
        'monopoly system',
        'camphor resources',
        'colonial fiscal self-sufficiency',
        'Goto Shinpei biological principle',
        'surveying techniques',
        'cadastre cleanup'
      ],
      cannotAnswer: [
        'public security management',
        'law enforcement details',
        'police system',
        'baojia operations',
        'student life',
        'social custom details',
        'political movements'
      ],
      knowledgeSource: 'work_observation'
    },
    
    redirectRules: {
      '警察': {
        targetNPC: 'police_officer',
        redirectPhrase: 'Public security and law enforcement belong to Officer Sato. Ask him.'
      },
      'police': {
        targetNPC: 'police_officer',
        redirectPhrase: 'Law and order are handled by Sato. Please ask him.'
      },
      '保甲': {
        targetNPC: 'police_officer',
        redirectPhrase: 'Baojia administration is Officer Sato’s responsibility, not mine.'
      },
      'baojia': {
        targetNPC: 'police_officer',
        redirectPhrase: 'Baojia matters go to Officer Sato.'
      },
      '學校': {
        targetNPC: 'student',
        redirectPhrase: 'I focus on land data. For local life, ask Xiao Qing.'
      },
      'school': {
        targetNPC: 'student',
        redirectPhrase: 'School topics should go to Xiao Qing.'
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
