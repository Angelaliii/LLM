// 主要文案內容管理
export interface CopyVariant {
  id: string;
  name: string;
  content: {
    hero: {
      headline: string;
      subheadline: string;
      cta: {
        primary: string;
        secondary: string;
      };
    };
    features: Array<{
      title: string;
      description: string;
      proof: string;
    }>;
    pricing: {
      title: string;
      subtitle: string;
      plans: Array<{
        name: string;
        price: string;
        features: string[];
        cta: string;
      }>;
    };
  };
}

export const copyVariants: CopyVariant[] = [
  {
    id: "default",
    name: "預設版本",
    content: {
      hero: {
        headline: "和秦始皇對話，第一人稱學歷史",
        subheadline:
          "革命性 LLM 互動教學平台，讓學生身歷其境體驗歷史事件，提升學習興趣與記憶效果",
        cta: {
          primary: "立即免費試用",
          secondary: "觀看互動展示",
        },
      },
      features: [
        {
          title: "沉浸式第一人稱對話",
          description:
            "學生可直接與秦始皇對話，詢問統一六國、建造長城等歷史決策，從當事人角度理解歷史脈絡。史料分歧時以多元觀點呈現，培養批判思考能力。",
          proof: "30 秒內啟動對話，支援 200+ 歷史主題問答",
        },
        {
          title: "教師友善控制面板",
          description:
            "教師可預設課程主題、調整對話難度、監控學習進度，並匯出學生問答記錄作為評量參考。完整符合教學需求設計。",
          proof: "5 分鐘完成課程設定，支援 40 人同時上線",
        },
        {
          title: "符合課綱學習目標",
          description:
            "對話內容緊扣國高中歷史課綱，涵蓋政治、經濟、社會、文化各面向，幫助學生深度理解歷史因果關係與時代背景。",
          proof: "100% 符合 108 課綱歷史領域核心素養",
        },
      ],
      pricing: {
        title: "選擇最適合的授權方案",
        subtitle: "不同需求的使用者都能找到合適的方案",
        plans: [
          {
            name: "免費體驗",
            price: "完全免費",
            features: [
              "與秦始皇對話 3 次",
              "基礎歷史問答功能",
              "單人使用模式",
              "標準回應速度",
            ],
            cta: "開始免費體驗",
          },
          {
            name: "個人版",
            price: "NT$ 299/月",
            features: [
              "無限次歷史人物對話",
              "包含 5+ 歷史人物",
              "進階主題討論",
              "個人學習記錄",
              "優先技術支援",
            ],
            cta: "選擇個人版",
          },
          {
            name: "校園授權",
            price: "客製化報價",
            features: [
              "全校師生無限使用",
              "教師管理控制台",
              "學習數據分析",
              "客製化課程內容",
              "專屬技術支援",
              "教師培訓服務",
            ],
            cta: "洽詢教育授權",
          },
        ],
      },
    },
  },
  {
    id: "variant-a",
    name: "A 版本（情境導向）",
    content: {
      hero: {
        headline: "穿越時空，與千古一帝面對面",
        subheadline:
          "透過 AI 技術重現歷史場景，讓學生與秦始皇直接對話，體驗真實的歷史決策過程",
        cta: {
          primary: "開始時空對話",
          secondary: "預覽對話場景",
        },
      },
      features: [
        {
          title: "真實歷史情境重現",
          description:
            "基於史料還原秦朝宮廷場景，學生可體驗重大歷史決策時刻，理解君王心境與時代壓力。",
          proof: "重現 50+ 重要歷史事件場景",
        },
        {
          title: "互動式歷史探索",
          description:
            "不再是被動接受知識，學生主動提問、探索、思辨，培養歷史思維與邏輯推理能力。",
          proof: "學習參與度提升 85%，記憶效果持續 3 倍",
        },
        {
          title: "課堂即用教學設計",
          description:
            "符合 50 分鐘課堂節奏，提供完整教案與學習單，教師輕鬆融入現有教學流程。",
          proof: "10 分鐘完成課前準備，零技術門檻",
        },
      ],
      pricing: {
        title: "彈性授權，滿足不同需求",
        subtitle: "從個人探索到全校推廣，都有合適方案",
        plans: [
          {
            name: "探索體驗",
            price: "免費試用",
            features: [
              "體驗完整對話流程",
              "3 次深度互動機會",
              "基礎歷史問答",
              "了解產品核心功能",
            ],
            cta: "開始探索",
          },
          {
            name: "個人深度",
            price: "NT$ 299/月",
            features: [
              "解鎖全部歷史人物",
              "無限對話次數",
              "專屬學習報告",
              "進階互動功能",
            ],
            cta: "深度學習",
          },
          {
            name: "教育夥伴",
            price: "專案洽談",
            features: [
              "全校師生共享",
              "教學管理平台",
              "客製化內容",
              "教師專業培訓",
            ],
            cta: "成為夥伴",
          },
        ],
      },
    },
  },
  {
    id: "variant-b",
    name: "B 版本（效益導向）",
    content: {
      hero: {
        headline: "讓歷史成績翻倍的秘密武器",
        subheadline:
          "基於 LLM 的互動對話系統，讓學生愛上歷史課，學習效果立竿見影",
        cta: {
          primary: "提升成績現在開始",
          secondary: "查看學習效果",
        },
      },
      features: [
        {
          title: "學習效果顯著提升",
          description:
            "透過沉浸式對話學習，學生記憶效果比傳統教學提升 300%，歷史科成績平均進步 2 個等第。",
          proof: "已協助 1000+ 學生提升歷史成績",
        },
        {
          title: "教學負擔大幅減輕",
          description:
            "自動化互動教學系統，教師不需額外備課，課堂氣氛活躍，學生主動參與討論。",
          proof: "教師備課時間減少 70%，課堂參與度提升 90%",
        },
        {
          title: "家長看得見的進步",
          description:
            "詳細學習報告顯示孩子學習歷程，歷史知識掌握度一目了然，家長更安心。",
          proof: "家長滿意度 95%，續用率超過 80%",
        },
      ],
      pricing: {
        title: "投資孩子的未來，從歷史開始",
        subtitle: "選擇最適合的方案，見證學習奇蹟",
        plans: [
          {
            name: "免費見證",
            price: "0 元體驗",
            features: [
              "見證學習效果",
              "體驗完整功能",
              "3 次免費對話",
              "無需信用卡",
            ],
            cta: "見證奇蹟",
          },
          {
            name: "個人突破",
            price: "NT$ 299/月",
            features: [
              "個人專屬學習",
              "無限制使用",
              "學習進度追蹤",
              "專業客服支援",
            ],
            cta: "開始突破",
          },
          {
            name: "學校轉型",
            price: "量身訂製",
            features: [
              "全校數位轉型",
              "教學品質提升",
              "競爭力大幅增強",
              "完整導入支援",
            ],
            cta: "開始轉型",
          },
        ],
      },
    },
  },
];

// 取得當前使用的文案版本
export const getCurrentCopy = (
  variantId: string = "default"
): CopyVariant["content"] => {
  const variant = copyVariants.find((v) => v.id === variantId);
  return variant?.content || copyVariants[0].content;
};
