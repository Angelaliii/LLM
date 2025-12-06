import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Heart, MessageCircle } from 'lucide-react';

// 追問層次定義
export type InquiryLevel = 'fact' | 'conflict' | 'empathy';

interface PromptChip {
  id: string;
  text: string;
  level: InquiryLevel;
  context: string; // 基於當前對話上下文
}

interface PromptChipsProps {
  lastNpcMessage?: string;
  lastUserMessage?: string;
  conversationHistory: Array<{ role: string; content: string }>;
  npcName?: string;
  missionId?: string;
  onChipClick: (prompt: string, level: InquiryLevel) => void;
  disabled?: boolean;
}

export default function PromptChips({
  lastNpcMessage = '',
  lastUserMessage = '',
  conversationHistory = [],
  npcName = 'NPC',
  missionId = 'E2',
  onChipClick,
  disabled = false
}: PromptChipsProps) {
  const [prompts, setPrompts] = useState<PromptChip[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // 根據對話上下文生成動態追問
  useEffect(() => {
    if (!lastNpcMessage && conversationHistory.length === 0) {
      // 初始狀態：提供開場引導
      setPrompts(generateInitialPrompts(npcName, missionId));
      return;
    }

    // 根據最近的對話生成追問
    const contextualPrompts = generateContextualPrompts(
      lastNpcMessage,
      lastUserMessage,
      conversationHistory,
      npcName,
      missionId
    );
    
    setPrompts(contextualPrompts);
  }, [lastNpcMessage, lastUserMessage, conversationHistory, npcName, missionId]);

  const getLevelConfig = (level: InquiryLevel) => {
    switch (level) {
      case 'fact':
        return {
          icon: Brain,
          color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
          label: '事實層',
          description: '詢問具體事件'
        };
      case 'conflict':
        return {
          icon: Zap,
          color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
          label: '衝突層',
          description: '詢問對立面'
        };
      case 'empathy':
        return {
          icon: Heart,
          color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
          label: '同理層',
          description: '詢問個人感受'
        };
    }
  };

  const handleChipClick = (prompt: PromptChip) => {
    if (disabled) return;
    
    onChipClick(prompt.text, prompt.level);
    
    // 點擊後隱藏一下子，給予反饋
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 1000);
  };

  if (!isVisible || prompts.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle size={16} className="text-gray-500" />
        <span className="text-sm text-gray-600 font-medium">智能追問建議</span>
      </div>
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-2"
        >
          {prompts.map((prompt, index) => {
            const config = getLevelConfig(prompt.level);
            const Icon = config.icon;
            
            return (
              <motion.button
                key={prompt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleChipClick(prompt)}
                disabled={disabled}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${config.color} ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    {config.label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">
                  {prompt.text}
                </p>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// 生成初始追問提示
function generateInitialPrompts(npcName: string, missionId: string): PromptChip[] {
  const basePrompts = [
    {
      id: 'init_fact',
      text: `${npcName}，能否請你先自我介紹，說明你在這次事件中的身份和角色？`,
      level: 'fact' as InquiryLevel,
      context: 'initial_introduction'
    },
    {
      id: 'init_conflict',
      text: `這次的事件中，你認為最大的爭議點是什麼？`,
      level: 'conflict' as InquiryLevel,
      context: 'initial_conflict'
    },
    {
      id: 'init_empathy',
      text: `回想起那個時候，你內心有什麼樣的感受？`,
      level: 'empathy' as InquiryLevel,
      context: 'initial_emotion'
    }
  ];

  return basePrompts;
}

// 根據對話上下文生成追問
function generateContextualPrompts(
  lastNpcMessage: string,
  lastUserMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  npcName: string,
  missionId: string
): PromptChip[] {
  const contextKeywords = extractKeywords(lastNpcMessage);
  const conversationContext = analyzeConversationContext(conversationHistory);
  
  const prompts: PromptChip[] = [];

  // 事實層追問（基於關鍵字）
  if (contextKeywords.includes('法') || contextKeywords.includes('違法')) {
    prompts.push({
      id: 'fact_law',
      text: '具體是哪條法律條文？當時是如何規定的？',
      level: 'fact',
      context: 'legal_details'
    });
  }
  
  if (contextKeywords.includes('請願') || contextKeywords.includes('抗議')) {
    prompts.push({
      id: 'fact_method',
      text: '請願書的具體內容是什麼？是誰起草的？',
      level: 'fact',
      context: 'petition_details'
    });
  }

  // 衝突層追問（對立觀點）
  if (contextKeywords.includes('政府') || contextKeywords.includes('官方')) {
    prompts.push({
      id: 'conflict_official',
      text: '那麼官方是如何看待你們的行動的？他們給出了什麼理由？',
      level: 'conflict',
      context: 'official_perspective'
    });
  }

  if (contextKeywords.includes('民眾') || contextKeywords.includes('百姓')) {
    prompts.push({
      id: 'conflict_public',
      text: '不是所有人都支持這個運動吧？反對的聲音是什麼？',
      level: 'conflict',
      context: 'opposition_voices'
    });
  }

  // 同理層追問（個人感受）
  if (contextKeywords.includes('危險') || contextKeywords.includes('害怕')) {
    prompts.push({
      id: 'empathy_fear',
      text: '這樣做的時候，你會不會擔心連累到家人？',
      level: 'empathy',
      context: 'personal_fear'
    });
  }

  if (contextKeywords.includes('希望') || contextKeywords.includes('未來')) {
    prompts.push({
      id: 'empathy_hope',
      text: '即使面臨這些困難，你仍然相信改變是可能的嗎？',
      level: 'empathy',
      context: 'hope_belief'
    });
  }

  // 如果沒有特定關鍵字匹配，提供通用追問
  if (prompts.length === 0) {
    prompts.push(
      {
        id: 'generic_fact',
        text: '能再詳細說明一下具體的經過嗎？',
        level: 'fact',
        context: 'generic_details'
      },
      {
        id: 'generic_conflict',
        text: '當時有不同的意見和爭論嗎？',
        level: 'conflict',
        context: 'generic_disagreement'
      },
      {
        id: 'generic_empathy',
        text: '這對你個人來說意味著什麼？',
        level: 'empathy',
        context: 'personal_meaning'
      }
    );
  }

  // 限制最多3個追問
  return prompts.slice(0, 3);
}

// 提取關鍵字
function extractKeywords(message: string): string[] {
  if (!message) return [];
  
  const keywords = [
    '法', '違法', '合法', '條文', '規定',
    '請願', '抗議', '運動', '示威', '集會',
    '政府', '官方', '當局', '總督', '警察',
    '民眾', '百姓', '人民', '民族', '台灣',
    '危險', '害怕', '擔心', '恐懼', '風險',
    '希望', '未來', '改變', '進步', '自由'
  ];

  return keywords.filter(keyword => message.includes(keyword));
}

// 分析對話上下文
function analyzeConversationContext(history: Array<{ role: string; content: string }>) {
  const recentMessages = history.slice(-6); // 最近3輪對話
  const topics: string[] = [];
  
  recentMessages.forEach(msg => {
    if (msg.content.includes('請願')) topics.push('petition');
    if (msg.content.includes('法律')) topics.push('legal');
    if (msg.content.includes('政府')) topics.push('government');
    if (msg.content.includes('感受')) topics.push('emotion');
  });

  return topics;
}