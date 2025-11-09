export interface Testimonial {
  id: string;
  name: string;
  role: string;
  institution: string;
  content: string;
  rating: number;
  avatar: string;
  type: "teacher" | "student" | "parent";
}

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    name: "林雅惠",
    role: "歷史科教師",
    institution: "台北市立大同高中",
    content:
      "使用歷史對話系統後，學生上課專注度明顯提升。原本對歷史興趣缺缺的同學，現在會主動詢問更多歷史問題。系統的教師管理介面很直觀，我可以輕鬆追蹤每位學生的學習進度，大幅減少備課時間。",
    rating: 5,
    avatar: "<IMG_PLACEHOLDER>",
    type: "teacher",
  },
  {
    id: "testimonial-2",
    name: "王小明",
    role: "高二學生",
    institution: "新竹市立建功高中",
    content:
      "以前覺得歷史很無聊，都是死背年代和人名。但和秦始皇對話後，我才知道他統一天下背後的辛苦和壓力。現在我會主動查資料，想了解更多歷史故事。歷史從我最討厭的科目變成最期待的課程！",
    rating: 5,
    avatar: "<IMG_PLACEHOLDER>",
    type: "student",
  },
  {
    id: "testimonial-3",
    name: "陳美玲",
    role: "家長",
    institution: "國三學生家長",
    content:
      "孩子使用這個系統後，不只是歷史成績進步，連表達能力都變好了。他會跟我分享和秦始皇的對話內容，講得生動有趣。最重要的是，我能透過學習報告了解孩子的學習狀況，很放心讓他繼續使用。",
    rating: 5,
    avatar: "<IMG_PLACEHOLDER>",
    type: "parent",
  },
  {
    id: "testimonial-4",
    name: "張志明",
    role: "歷史科主任",
    institution: "高雄市立前鎮高中",
    content:
      "我們學校導入這套系統已經一學期，學生的歷史科平均成績提升了 15 分。老師們反映課堂氣氛更活潑，學生願意主動參與討論。技術支援團隊很專業，導入過程很順利。",
    rating: 5,
    avatar: "<IMG_PLACEHOLDER>",
    type: "teacher",
  },
  {
    id: "testimonial-5",
    name: "李小華",
    role: "國三學生",
    institution: "台中市立居仁國中",
    content:
      "會考前我最擔心社會科，特別是歷史。用了這個系統後，複習變得很有趣，我可以問秦始皇當時的想法，比課本更容易理解。會考社會科拿到 A++，謝謝這個神奇的系統！",
    rating: 5,
    avatar: "<IMG_PLACEHOLDER>",
    type: "student",
  },
  {
    id: "testimonial-6",
    name: "劉家豪",
    role: "教務主任",
    institution: "彰化縣立員林高中",
    content:
      "學校數位轉型需要找到真正有效的工具，歷史對話系統完全符合我們的需求。不只提升教學效果，也讓我們在招生時更有競爭力。家長對學校的創新教學方式印象深刻。",
    rating: 5,
    avatar: "<IMG_PLACEHOLDER>",
    type: "teacher",
  },
];

// 根據類型篩選見證
export const getTestimonialsByType = (
  type: Testimonial["type"]
): Testimonial[] => {
  return testimonials.filter((testimonial) => testimonial.type === type);
};

// 取得隨機見證
export const getRandomTestimonials = (count: number): Testimonial[] => {
  const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 合作單位（社會證明）
export const partnerships = [
  {
    name: "台北市教育局",
    type: "政府合作",
    description: "數位教學創新試點計畫合作夥伴",
  },
  {
    name: "國立台灣師範大學",
    type: "學術合作",
    description: "歷史教育研究中心技術顧問",
  },
  {
    name: "全國高級中等學校教育產業工會",
    type: "教育組織",
    description: "推薦數位教學工具",
  },
  {
    name: "108 課綱適性教學聯盟",
    type: "教育聯盟",
    description: "符合新課綱教學工具認證",
  },
];
