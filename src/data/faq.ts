export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "product" | "technical" | "pricing" | "education";
}

export const faqData: FAQItem[] = [
  {
    id: "faq-1",
    question: "「歷史人物對話系統」如何確保歷史資訊的準確性？",
    answer:
      "我們的系統基於權威史料與學術研究建構，包含《史記》、《資治通鑑》等經典文獻。當史料出現分歧時，系統會以「史學界對此有不同觀點」的方式呈現，培養學生批判思考能力。所有內容都經過歷史學者審核，確保符合學術標準。",
    category: "product",
  },
  {
    id: "faq-2",
    question: "除了秦始皇，還會新增其他歷史人物嗎？",
    answer:
      "是的！我們已在開發蘇軾等重要帝王以及文臣學者。預計每季推出 2-3 位新人物。校園版用戶享有優先體驗權，個人版用戶可在發布後免費更新。",
    category: "product",
  },
  {
    id: "faq-3",
    question: "校園授權的價格如何計算？",
    answer:
      "校園授權採用彈性計價模式：500 人以下學校年費 NT$ 50,000，500-1000 人學校年費 NT$ 80,000，1000 人以上學校年費 NT$ 120,000。包含全校師生使用權、教師培訓、技術支援與客製化內容服務。可申請分期付款。",
    category: "pricing",
  },
  {
    id: "faq-4",
    question: "學生的對話內容會被記錄嗎？隱私如何保護？",
    answer:
      "學生對話記錄僅儲存於教師管理後台，用於教學評量與學習追蹤。我們嚴格遵循個資法規定，不會將學生資料用於其他用途。所有資料採用加密傳輸與儲存。",
    category: "technical",
  },
  {
    id: "faq-5",
    question: "免費試用有什麼限制？試用後如何升級？",
    answer:
      "免費試用提供 3 次完整對話體驗，每次對話時間不限，可充分了解產品功能。試用期間可體驗所有核心功能，但無法使用教師管理面板。試用結束後可直接在系統內升級，支援信用卡與銀行轉帳付款。",
    category: "pricing",
  },
  {
    id: "faq-6",
    question: "系統是否符合 108 課綱的教學目標？",
    answer:
      "完全符合！我們的內容設計緊扣 108 課綱歷史領域核心素養，包含：歷史意識、史料證據、多元詮釋等面向。對話主題涵蓋政治、經濟、社會、文化各層面，幫助學生建立歷史思維與批判能力。",
    category: "education",
  },
  {
    id: "faq-7",
    question: "如果對話中出現不當內容怎麼辦？",
    answer:
      "系統內建多層次安全機制：關鍵詞過濾、語意分析檢測、人工審核機制。教師可設定敏感詞黑名單，系統會自動引導對話回歸歷史主題。如發現不當內容，可立即回報，我們會在 24 小時內處理並優化系統。",
    category: "technical",
  },
];

// 根據分類篩選 FAQ
export const getFAQByCategory = (category: FAQItem["category"]): FAQItem[] => {
  return faqData.filter((item) => item.category === category);
};

// 搜尋 FAQ
export const searchFAQ = (query: string): FAQItem[] => {
  const lowerQuery = query.toLowerCase();
  return faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(lowerQuery) ||
      item.answer.toLowerCase().includes(lowerQuery)
  );
};
