// backend/data/missions/e2-industrial-agri.ts

// ==============================
// Type Definitions
// ==============================
export interface MissionChunk {
  id: string;
  missionId: string;
  topic: string;
  type: "core_fact" | "supplement" | "story";
  text: string;
}

export interface MissionNpc {
  id: string;
  missionId: string;
  name: string;
  role: string;
  avatar: string;
  persona: string;
  canTalkAbout: string[];
  avoid: string[];
}

export interface MissionQuizOption {
  key: string;
  text: string;
}

export interface MissionQuiz {
  id: string;
  missionId: string;
  stem: string;
  options: MissionQuizOption[];
  answer: string;
  explanation: string;
}

export interface MissionEndRule {
  minTurns: number;          // 最少對話輪數（所有 NPC 合計）
  minMasteredGoals: number;  // 至少掌握幾個學習目標
  minConfidence: number;     // System2 評估信心門檻（0–1）
}

export interface MissionConfig {
  id: string;
  name: string;
  description: string;
  introTemplate: string;
  chunks: MissionChunk[];
  npcs: MissionNpc[];
  quizzes: MissionQuiz[];
  learningGoals: string[];
  endingTemplate: string;
  endRule: MissionEndRule;
}

// ==============================
// Mission: E2 - 工業日本・農業臺灣
// ==============================

// ---- Chunks (RAG Knowledge Base) ----
export const e2Chunks: MissionChunk[] = [
  {
    id: "e2-001",
    missionId: "E2",
    topic: "工業日本・農業臺灣政策",
    type: "core_fact",
    text: `日治初期，日本總督府推動「工業日本、農業臺灣」的殖民經濟政策。其核心目標是讓台灣成為日本的農業供應基地，滿足日本本土對米、糖等民生物資的需求；同時日本本土則專注於發展製造業與重工業。此政策的實施使台灣的農業逐漸走向單一化生產，稻米與甘蔗的產量大幅提升，並多以出口日本為導向。然而，這種殖民式分工也造成台灣本地農業結構失衡，農民受到契作制度、會社壟斷、肥料價格等因素的影響，生活負擔反而加重。`,
  },
  {
    id: "e2-002",
    missionId: "E2",
    topic: "蓬萊米的改良與推廣",
    type: "core_fact",
    text: `日本殖民政府大力推動稻米改良，其中最著名的是磯永吉等人培育的「蓬萊米」。蓬萊米適合台灣的氣候與水土，其米質優良、產量高，深受日本市場喜愛。為了推廣蓬萊米，總督府引入新式耕作技術，例如施肥、除蟲、育苗法等，使稻米生產效率提升。蓬萊米的推廣帶動台灣稻米出口量增加，使台灣成為日本重要的糧食供應地。但同時，農民必須購買指定肥料與遵從政府指導，也使其生產成本提高。`,
  },
  {
    id: "e2-003",
    missionId: "E2",
    topic: "新式製糖業與會社制度",
    type: "core_fact",
    text: `日治時期，日本政府鼓勵日本企業在台灣設立現代化新式糖廠。這些糖廠引進蒸汽機械、鐵道運輸與大型設備，使製糖效率遠高於清代傳統製糖業。日本的製糖會社（企業）得到政府補助與保護，逐漸壟斷台灣的糖業，使糖成為殖民政府最重要的出口商品之一。然而，糖業發展的基礎往往建立在壓榨農民的契作制度上：農民必須種植會社指定的甘蔗，並以會社價格出售給工廠，使農民缺乏議價能力。`,
  },
  {
    id: "e2-004",
    missionId: "E2",
    topic: "契作制度與農民困境",
    type: "core_fact",
    text: `糖業會社通常要求農民與其簽訂「契作契約」。農民必須購買會社指定的肥料、交付固定比例收成，並必須用會社規定的秤重方式交貨。由於會社掌握資金、設備與收購權，農民常感受到被壓榨。例如「第一惡、種甘蔗予會社磅」形容農民在秤重時常遭扣重，導致收入降低。契作制度使農民在外表上收入增加，但實際可支配所得有限，造成普遍的經濟壓力。`,
  },
  {
    id: "e2-005",
    missionId: "E2",
    topic: "嘉南大圳與水利建設",
    type: "core_fact",
    text: `為提升農業生產，日本政府在台灣修建多項水利工程，其中最重要的是八田與一主持興建的「嘉南大圳」（1930 完工）。嘉南大圳是台灣歷史上規模最大的水利工程，改善嘉南平原的灌溉，使原本常受旱災影響的土地得以穩定耕作。大圳的完成大幅提升稻米、甘蔗等作物產量，是日治時期農業現代化的重要象徵。然而，水利工程帶來的收益多集中於大型農場與會社，農民的生活改善有限。`,
  },
];

// ---- NPCs ----
export const e2Npcs: MissionNpc[] = [
  {
    id: "npc-yamada",
    missionId: "E2",
    name: "山田清一",
    role: "日本技師",
    avatar: "assets/Yamada_icon.png",
    persona: `角色定位：總督府派駐地方的農業技術官。
背景：擅長育苗、施肥技術，負責協助當地推廣蓬萊米與改良耕作法。語氣偏理性且帶有殖民官員的自信與優越感；談話重點放在技術與成效。`,
    canTalkAbout: ["蓬萊米改良技術", "稻米產量與栽培方法", "水利工程對產量的影響"],
    avoid: ["批判日本政府", "描述農民被壓榨的細節"],
  },
  {
    id: "npc-afu",
    missionId: "E2",
    name: "阿福",
    role: "臺灣佃農",
    avatar: "assets/Afu_icon.png",
    persona: `角色定位：嘉南平原的佃農，生活依賴田地，面對會社契作與市場壓力。語氣口語、帶有無奈與抱怨，常提日常成本與被扣重的經驗，但不會提供精確統計數字。`,
    canTalkAbout: ["肥料成本與取得", "秤重會被扣重的經驗", "種甘蔗的風險與收成問題", "「第一惡、種甘蔗予會社磅」的含義"],
    avoid: ["提供精確數據", "討論殖民政策的整體架構"],
  },
  {
    id: "npc-sato",
    missionId: "E2",
    name: "佐藤正雄",
    role: "製糖會社幹部",
    avatar: "assets/Sato_icon.png",
    persona: `角色定位：製糖會社的管理人，代表企業與市場立場。
背景：負責工廠營運與採購策略，重視設備投資與成本控制。語氣官方且理性，強調契約與效率的重要性。`,
    canTalkAbout: ["契約精神", "設備投資與製糖成本", "糖業對整體經濟的貢獻"],
    avoid: ["承認或描述壓榨農民的說法", "談農民生活困境的情感面"],
  },
];

// ---- Quizzes ----
export const e2Quizzes: MissionQuiz[] = [
  {
    id: "e2-q1",
    missionId: "E2",
    stem: "日治時期推行「工業日本、農業臺灣」的主要目的為何？",
    options: [
      { key: "A", text: "讓臺灣成為工業中心" },
      { key: "B", text: "提高臺灣農民所得" },
      { key: "C", text: "滿足日本對糧食與原料需求" },
      { key: "D", text: "促進臺灣與歐美貿易" },
    ],
    answer: "C",
    explanation: "政策重點是臺灣供應農產與原料，日本本土發展工業，以滿足日本本土需求。",
  },
  {
    id: "e2-q2",
    missionId: "E2",
    stem: "下列哪一項最能說明「蓬萊米」在日治時期的重要性？",
    options: [
      { key: "A", text: "主要供應臺灣本地食用，不外銷" },
      { key: "B", text: "產量低，但象徵臺灣文化認同" },
      { key: "C", text: "適合臺灣環境、產量高，深受日本市場歡迎" },
      { key: "D", text: "只在山地種植，與平原農業無關" },
    ],
    answer: "C",
    explanation: "蓬萊米適合臺灣氣候、產量高，品質佳，是臺灣成為日本糧食供應基地的重要關鍵。",
  },
  {
    id: "e2-q3",
    missionId: "E2",
    stem: "關於日治時期的製糖會社與契作制度，下列何者較為正確？",
    options: [
      { key: "A", text: "農民可自由決定是否與會社合作，完全沒有約束" },
      { key: "B", text: "會社掌握收購權與秤重方式，農民常感到被壓榨" },
      { key: "C", text: "契作制度大幅提升農民議價能力" },
      { key: "D", text: "契作只限制肥料來源，不影響收成分配" },
    ],
    answer: "B",
    explanation: "會社掌握資金、設備與收購權，並控制秤重與價格，農民常覺得被剝削，形成「第一惡、種甘蔗予會社磅」的抱怨。",
  },
  {
    id: "e2-q4",
    missionId: "E2",
    stem: "下列哪一項最符合嘉南大圳完工後對臺灣農業的影響？",
    options: [
      { key: "A", text: "灌溉條件改善，使嘉南平原農作物產量提升" },
      { key: "B", text: "只改善城市用水，與農業無關" },
      { key: "C", text: "導致大片農地荒廢，農民被迫轉行" },
      { key: "D", text: "主要用於工業用水，完全不灌溉農田" },
    ],
    answer: "A",
    explanation: "嘉南大圳改善嘉南平原灌溉，使稻米與甘蔗產量提高，是農業現代化的重要水利工程。",
  },
  {
    id: "e2-q5",
    missionId: "E2",
    stem: "綜合本單元內容，下列哪一項最能概括「工業日本、農業臺灣」對臺灣社會的影響？",
    options: [
      { key: "A", text: "臺灣完全擺脫農業，轉型為工業國家" },
      { key: "B", text: "農業產量提高，但農民未必真正受惠" },
      { key: "C", text: "農民收入穩定提升，貧富差距縮小" },
      { key: "D", text: "日本放棄在臺灣發展糖業與稻米" },
    ],
    answer: "B",
    explanation: "政策讓臺灣農業現代化、產量增加，但在契作制度與會社壟斷下，農民實際獲利有限，形成表面繁榮、內部壓力的矛盾。",
  },
];

// ---- Learning Goals ----
export const e2LearningGoals: string[] = [
  "理解「工業日本、農業臺灣」政策的核心概念與殖民分工。",
  "說明蓬萊米改良與推廣的原因及其對臺灣與日本的影響。",
  "描述製糖會社與契作制度下，糖業發展與農民困境之間的關係。",
  "理解嘉南大圳等水利建設對臺灣農業產量與社會結構的影響。",
];

// ---- Intro Template (S1 開場用) ----
export const e2IntroTemplate = `
你正在設計一段任務開場故事，對象是國中生，要引導他們進入「工業日本、農業臺灣」這個任務。

請根據以下要求，寫出 150～220 字的開場故事：

1. 先用簡單情境帶出日治時期臺灣的畫面，例如：糖廠煙囪、運糖小火車、稻田與水利工程。
2. 用淺顯語言介紹「工業日本、農業臺灣」的大意：臺灣種米種甘蔗，日本發展工業。
3. 暗示蓬萊米、製糖會社、契作制度、嘉南大圳，讓學生先有印象，但不用詳細說明。
4. 提出一個需要調查的問題，例如：「看起來很現代、很進步的政策，為什麼農民卻留下『第一惡、種甘蔗予會社磅』這樣的抱怨？」
5. 結尾請引導學生準備扮演「時空調查員」，等一下要去訪問不同身分的人（技師、佃農、會社幹部），找出真相。

語氣親切、自然、適合國中程度，不要使用艱深術語。
`;

// ---- Ending Template (S4 總結用) ----
export const e2EndingTemplate = `
你現在要幫學生整理這次任務的完整回顧，字數約 350～500 字，對象是國中生。

請依照下列結構整理：

1. 開頭：簡短回顧任務問題，例如「為什麼在『工業日本、農業臺灣』的政策下，有人說臺灣變得更現代，有人卻抱怨種甘蔗很辛苦？」
2. 中段（一）：說明「工業日本、農業臺灣」政策的大意，以及蓬萊米、水利建設（例如嘉南大圳）如何讓農業產量提高。
3. 中段（二）：說明製糖會社與契作制度的運作方式，點出「第一惡、種甘蔗予會社磅」反映農民在價格、秤重、肥料上的壓力與不公平感。
4. 中段（三）：整理不同角色的觀點（例如技師、佃農、會社幹部），強調同一個政策下，每個人的位置與感受很不一樣。
5. 結尾：用 1～2 句引導學生思考：「當我們看到『現代化』或『進步』這些字眼時，應該多問一句：對誰來說是進步？」

請使用清楚的段落分段，語氣像是在幫學生做上課重點複習，不要加入超出提供資料以外的歷史細節。
`;

// ---- End Rule (對話結束準則，用於觸發 S4) ----
export const e2EndRule: MissionEndRule = {
  minTurns: 6,          // 至少進行 6 輪對話（含多個 NPC）
  minMasteredGoals: 3,  // 至少掌握 3 個學習目標
  minConfidence: 0.7,   // System2 評估信心需達 0.7 以上
};

// ---- Final Mission Config ----
export const e2Mission: MissionConfig = {
  id: "E2",
  name: "工業日本・農業臺灣",
  description:
    "日本統治時期，臺灣被定位為日本的農業與原料供應基地。透過蓬萊米改良、水利工程與製糖業發展，臺灣農業表面上更現代化，卻也伴隨契作制度與農民困境。本任務將帶領學生從不同角色觀點出發，重新理解這段看似甜蜜卻帶有苦味的歷史。",
  introTemplate: e2IntroTemplate,
  chunks: e2Chunks,
  npcs: e2Npcs,
  quizzes: e2Quizzes,
  learningGoals: e2LearningGoals,
  endingTemplate: e2EndingTemplate,
  endRule: e2EndRule,
};
