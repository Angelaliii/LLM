/**
 * 任務：臺南：六法下的權力與土地
 * 基於 backend/data/story/jp_story_01_early_rule.json
 * 時代：日治初期 (1905年)
 */

export interface Stage {
  id: string;
  type: 'explore' | 'key_question' | 'summary';
  title: string;
  description: string;
  question: string;
  keywords: string[];
  availableNPCs: string[];
  hint?: string;
  completionNote: string;
  requiredKnowledgeIds: string[]; // 對應 knowledge_base.json 的 id
}

export interface MissionData {
  id: string;
  title: string;
  period: string;
  difficulty: '初級' | '中級' | '高級';
  estimatedTime: string;
  description: string;
  mainGoal: string;
  
  // 玩家人設
  playerPersona: {
    name: string;
    role: string;
    backgroundStory: string;
    relationships: string[];
  };
  
  // 關卡
  stages: Stage[];
  
  // 學習目標
  learningGoals: string[];
  
  // 相關知識點 ID
  relatedKnowledgeIds: string[];
}

export const tainanColonialRuleMission: MissionData = {
  id: 'E2',
  title: '臺南：六法下的權力與土地',
  period: '日治初期 (1905年)',
  difficulty: '中級',
  estimatedTime: '15-20分鐘',
  description: '成為總督府基層文官，探索日本如何透過法律、警察體制和財政手段，建立起高壓且財政自足的殖民統治體系。',
  mainGoal: '理解日本政府如何在短時間內，透過法律與經濟手段，建立起高壓且財政自足的殖民統治體系，並掌握其殖民哲學。',
  
  playerPersona: {
    name: '鈴木先生',
    role: '臺灣總督府基層文官（地方輔佐官）',
    backgroundStory: '你於 1905 年剛被派任到臺灣，協助臺南地區的民政事務。雖然你階級不高，但深知總督府的權力來自《法律第六十三號》（六三法）。你的任務是確保殖民地的基層制度順利運作，並讓臺地財源穩定，以實現殖民地『自負盈虧』的目標。',
    relationships: [
      '日本警察佐藤敬一：你的同事，負責地方治安的執行者，他權力極大，令你有些敬畏。',
      '土地測量員山本勘助：你的同事，主要負責進行複雜的土地調查和林野清查。',
      '臺灣學生小清：當地公學校的學生，是政府推行現代教育的成果，能提供基層生活的視角。'
    ]
  },
  
  stages: [
    {
      id: 'stage_1_intro',
      type: 'explore',
      title: '第一關：法律與權力的基礎',
      description: '你剛抵達臺南市區，這裡是殖民地初期的權力中心之一。你看到你的同事，日本警察佐藤，正在對幾位臺籍民眾訓話。',
      question: '請向 NPC 提問，以理解殖民政府在政治上如何獲得絕對權力。',
      keywords: ['總督專制', '六三法', '武官', '法律第六十三號'],
      availableNPCs: ['police_officer', 'student', 'land_surveyor'],
      hint: '警察佐藤應該最清楚法律與權力的執行，你可以先問他《六三法》是什麼。',
      completionNote: '你已掌握了統治的法律基礎。但要深入理解政策，你還需要知道其背後的哲學與高壓手段。',
      requiredKnowledgeIds: ['JP002']
    },
    {
      id: 'stage_1_5_philosophy',
      type: 'key_question',
      title: '第二關：統治哲學與高壓手段',
      description: '你已理解總督府的法律基礎。現在，請探究確立這些制度背後的統治哲學，以及初期鎮壓反抗的高壓手段。',
      question: '在殖民統治初期，政府的統治哲學是什麼？以及他們用什麼最嚴厲的法律來鎮壓反抗？',
      keywords: ['後藤新平', '生物學原則', '匪徒刑罰令', '舊慣調查'],
      availableNPCs: ['police_officer', 'land_surveyor'],
      completionNote: '你成功理解了後藤新平的生物學原則和匪徒刑罰令。這奠定了實行基層控制的基礎，進入下一個任務。',
      requiredKnowledgeIds: ['JP003', 'JP029']
    },
    {
      id: 'stage_2_power',
      type: 'key_question',
      title: '第三關：基層社會控制',
      description: '現在，你必須搞清楚這種權力是如何貫徹到臺灣最基層的社會角落的。',
      question: '除了中央的總督府，他們用什麼方法控制到臺灣最基層的社會角落？',
      keywords: ['警察政治', '保甲制度', '壯丁團', '連坐法'],
      availableNPCs: ['police_officer', 'student'],
      completionNote: '你成功理解了基層控制手段。但執行這些嚴密控制，需要龐大的資金。現在，去探明政府如何籌措經費。',
      requiredKnowledgeIds: ['JP004']
    },
    {
      id: 'stage_3_finance',
      type: 'key_question',
      title: '第四關：財政基礎的建立',
      description: '你已經掌握了政治控制手段。現在，你的第二個任務是探明殖民政府的財政基礎。殖民地必須自負盈虧，而土地丈量和專賣制度是關鍵線索。',
      question: '殖民地統治初期，政府主要的財源是如何建立起來的？（提示：需包含兩種主要手段）',
      keywords: ['土地調查', '專賣制度', '田賦', '林野調查', '鴉片專賣', '樟腦專賣'],
      availableNPCs: ['land_surveyor', 'police_officer', 'student'],
      hint: '土地測量員山本負責丈量與徵稅，警察佐藤負責專賣品執行，你需要詢問兩位才能獲得完整的財源線索。',
      completionNote: '優秀！你已了解殖民地的主要財源。',
      requiredKnowledgeIds: ['JP008', 'JP009']
    },
    {
      id: 'stage_3_5_infrastructure',
      type: 'explore',
      title: '第五關：現代化基礎建設',
      description: '你已了解殖民地的主要財源。現在，請額外調查政府利用這些財源進行了哪些基礎建設，以利於統治與現代化。',
      question: '請詢問 NPC，總督府在金融和交通方面進行了哪些重要的基礎建設？',
      keywords: ['縱貫鐵路', '臺灣銀行', '統一貨幣', '港口建設'],
      availableNPCs: ['land_surveyor', 'student'],
      completionNote: '恭喜！你掌握了殖民體制的政治、社會控制、財政與基礎建設的所有核心資訊，可以開始總結報告了。',
      requiredKnowledgeIds: ['JP010']
    },
    {
      id: 'stage_4_summary',
      type: 'summary',
      title: '最終關：總結報告',
      description: '你已經完成了所有調查，現在需要向總督府提交一份簡潔的報告，總結你對殖民地統治基礎的理解。',
      question: '請用三個核心政策或制度（法律、社會控制、財政），概括此時期殖民統治體系建立的過程。',
      keywords: ['總督專制', '警察政治', '土地調查', '六三法', '保甲制度', '專賣制度'],
      availableNPCs: ['police_officer'],
      completionNote: '任務完成！你已經全面理解了日治初期殖民統治體系的建立過程。',
      requiredKnowledgeIds: ['JP002', 'JP004', 'JP008', 'JP009']
    }
  ],
  
  learningGoals: [
    '理解《法律第六十三號》（六三法）賦予總督的絕對權力',
    '認識後藤新平的「生物學原則」治臺哲學',
    '了解警察政治與保甲制度如何控制基層社會',
    '掌握土地調查與專賣制度如何建立財政基礎',
    '認識日治初期的現代化基礎建設',
    '綜合評價殖民統治的「殖民化」與「現代化」雙重特性'
  ],
  
  relatedKnowledgeIds: [
    'JP002', // 殖民體制的建立與總督專制
    'JP003', // 後藤新平與治臺原則
    'JP004', // 警察政治與保甲制度的運作
    'JP008', // 土地、林野調查與財政改革
    'JP009', // 專賣制度與驚人收入
    'JP010', // 交通與金融基礎建設
    'JP029', // 匪徒刑罰令與高壓統治
  ]
};
