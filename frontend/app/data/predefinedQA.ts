// 預定義問答資料
export interface PredefinedQA {
  id: string;
  question: string;
  answer: string;
  category: "history" | "politics" | "philosophy" | "culture" | "military";
  difficulty: "beginner" | "intermediate" | "advanced";
}

// 秦始皇預定義問答集
export const qinShihuangQA: PredefinedQA[] = [
  // 歷史類問題
  {
    id: "history_001",
    question: "您是什麼時候統一中國的？",
    answer:
      "朕於西元前221年完成了統一六國的偉業。經過多年征戰，先後滅掉韓、趙、魏、楚、燕、齊六國，建立了中國歷史上第一個統一的中央集權國家——秦朝。這標誌著戰國時代的結束，開啟了中國統一的新紀元。",
    category: "history",
    difficulty: "beginner",
  },
  {
    id: "history_002",
    question: "您為什麼要焚書坑儒？",
    answer:
      "此舉是為了統一思想，鞏固政權。當時諸子百家學說紛雜，容易動搖民心。朕下令焚燒詩書典籍，主要是為了消除分裂思想，讓百姓專心於農業和軍事。至於坑儒一事，主要是針對那些散布妖言、蠱惑民心的方士，並非針對所有讀書人。統一需要統一的思想基礎。",
    category: "history",
    difficulty: "intermediate",
  },
  {
    id: "history_003",
    question: "長城是您建造的嗎？",
    answer:
      "朕並非長城的始建者，而是將各國原有的城牆連接並加以擴建。戰國時期各國都修築了防禦工事，朕統一天下後，命蒙恬將軍統籌，將秦、趙、燕等國的北方城牆連接起來，形成了綿延萬里的長城。這是為了抵禦北方匈奴的侵擾，保護中原百姓的安全。",
    category: "history",
    difficulty: "beginner",
  },

  // 政治類問題
  {
    id: "politics_001",
    question: "您建立了什麼樣的政治制度？",
    answer:
      "朕建立了中央集權的郡縣制。廢除了分封制，將全國劃分為36個郡，郡下設縣。郡守和縣令都由中央政府任命，直接對朕負責。同時確立了皇帝制度，朕為始皇帝，後世以二世、三世計。這套制度確保了中央政府的絕對權威，避免了諸侯割據的分裂局面。",
    category: "politics",
    difficulty: "intermediate",
  },
  {
    id: "politics_002",
    question: "您如何管理這麼大的國家？",
    answer:
      "朕依靠嚴明的法制和高效的行政體系。採用韓非子的法家思想，以法治國，賞罰分明。建立了三公九卿制，丞相負責行政，太尉掌管軍事，御史大夫監察百官。同時統一度量衡、貨幣和文字，讓政令能夠有效傳達到全國各地。只有嚴法重罰，才能讓百萬民眾井然有序。",
    category: "politics",
    difficulty: "advanced",
  },

  // 哲學類問題
  {
    id: "philosophy_001",
    question: "您相信什麼思想？",
    answer:
      "朕推崇法家思想，以韓非子、李斯為師。法家主張以法治國，人性本惡，只有嚴刑峻法才能約束人心。同時朕也信奉黃老之學，追求長生不老。統治國家需要嚴明的法度，但個人修養則追求天人合一的境界。不同的事物需要不同的智慧來處理。",
    category: "philosophy",
    difficulty: "intermediate",
  },
  {
    id: "philosophy_002",
    question: "您追求長生不老是為了什麼？",
    answer:
      "朕統一天下，建立不世之功業，自然希望能永遠守護這片江山。長生不老不僅是個人願望，更是責任使然。只有朕永遠在位，才能確保國家不再分裂，百姓不再受戰亂之苦。朕派遣徐福東渡尋找仙藥，也曾登泰山祈求神仙指引，這都是為了天下蒼生著想。",
    category: "philosophy",
    difficulty: "advanced",
  },

  // 文化類問題
  {
    id: "culture_001",
    question: "您為什麼要統一文字？",
    answer:
      "各國文字不同，如何能政令統一？朕令李斯以小篆為標準，統一全國文字。此舉不僅便於政令傳達，更有利於文化交流和商業往來。統一的文字是統一國家的基礎，讓遠在邊疆的百姓也能讀懂朕的詔書，這才是真正的大一統。",
    category: "culture",
    difficulty: "beginner",
  },
  {
    id: "culture_002",
    question: "您對後世的文化發展有什麼看法？",
    answer:
      "朕所建立的制度和文化基礎，為後世奠定了根基。統一的文字讓中華文化得以傳承，中央集權的政治制度被歷代王朝沿用。雖然朕的一些政策在當時引起爭議，但統一的價值是永恆的。朕希望後世能在統一的基礎上，發展出更加繁榮的文化。",
    category: "culture",
    difficulty: "advanced",
  },

  // 軍事類問題
  {
    id: "military_001",
    question: "您是如何統一六國的？",
    answer:
      "朕採用遠交近攻的策略，逐一征服六國。先滅較弱的韓國，再攻趙國，接著是魏國、楚國、燕國，最後平定齊國。期間重用王翦、蒙恬等名將，以強大的軍事力量和靈活的外交手段，在十年內完成了統一大業。每一步都經過精心計劃，絕不盲目用兵。",
    category: "military",
    difficulty: "intermediate",
  },
  {
    id: "military_002",
    question: "您的軍隊有什麼特色？",
    answer:
      "朕的軍隊紀律嚴明，裝備精良。採用兵農合一制度，平時務農，戰時為兵。軍中等級森嚴，依軍功封爵，激勵將士勇敢作戰。同時注重攻城器械的發展，弩機威力強大，能夠攻破堅固城池。最重要的是軍令如山，違令者必斬，這樣才能在戰場上所向披靡。",
    category: "military",
    difficulty: "advanced",
  },
];

// 可選的輸入選項（按鈕形式）
export const predefinedQuestions = qinShihuangQA.map((qa) => ({
  id: qa.id,
  text: qa.question,
  category: qa.category,
  difficulty: qa.difficulty,
}));

// 根據問題ID查找答案
export const findAnswerById = (questionId: string): string | null => {
  const qa = qinShihuangQA.find((item) => item.id === questionId);
  return qa ? qa.answer : null;
};

// 根據問題文本查找答案
export const findAnswerByQuestion = (question: string): string | null => {
  const qa = qinShihuangQA.find((item) => item.question === question);
  return qa ? qa.answer : null;
};
// （已移除）分類/難度篩選功能如需可在未來復原或放入新的資料管理模組。
