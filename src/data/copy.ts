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
];

export const getCurrentCopy = (
  variantId = "default"
): CopyVariant["content"] => {
  const variant = copyVariants.find((v) => v.id === variantId);
  return variant?.content || copyVariants[0].content;
};
