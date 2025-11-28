/**
 * NPC 遊戲角色配置類型定義
 */

export interface NPCGameConfig {
  id: string;
  name: string;
  role: string;
  period: string;
  description: string;
  
  language: {
    tone: 'naive' | 'authoritative' | 'professional' | 'formal' | 'scholarly' | 'conversational';
    maxResponseLength: number;
    forbiddenPhrases: string[];
  };
  
  knowledge: {
    canAnswer: string[];
    cannotAnswer: string[];
    knowledgeSource: string;
  };
  
  redirectRules: Record<string, {
    targetNPC: string;
    redirectPhrase: string;
  }>;
  
  conversationRules: {
    noSelfIntroAfterFirst: boolean;
    mustStayInCharacter: boolean;
    avoidTeachingTone: boolean;
    responseStyle: 'short' | 'concise' | 'detailed';
  };
}
