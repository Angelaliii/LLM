# 歷史人物對話系統 - 完整實作指南

## 🎯 系統概要

本系統是一個專業的歷史教育對話平台，以秦始皇為首個可互動歷史人物，提供三種對話模式（教學、快問快答、蘇格拉底式）與三種史實嚴謹度選擇，面向國中至高中的歷史教學場景。

### 🏗️ 技術架構

- **前端框架**：React 18 + TypeScript + Vite
- **狀態管理**：Zustand（輕量級、高性能）
- **樣式系統**：Tailwind CSS（響應式、深色模式支援）
- **路由系統**：React Router v6
- **安全防護**：內建內容過濾與教育性重導向

## 🚀 快速開始

### 1. 環境要求

```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### 2. 安裝與啟動

```bash
# 克隆並進入專案目錄
cd sale

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 應用將在 http://localhost:3000 運行
```

### 3. 項目結構總覽

```
src/
├── components/
│   ├── chat/              # 對話系統核心組件
│   │   ├── ChatWindow.tsx      # 主對話視窗
│   │   ├── MessageBubble.tsx   # 消息氣泡（支援串流）
│   │   ├── InputArea.tsx       # 輸入區域（含安全檢查）
│   │   └── TypingIndicator.tsx # 打字指示器
│   ├── controls/          # 控制面板組件
│   │   └── Controls.tsx        # 模式與嚴謹度控制
│   ├── ui/               # 通用 UI 組件
│   │   └── PersonaBadge.tsx    # 人物標識
│   └── teacher/          # 教師面板（待實現）
├── services/
│   ├── llmClient.ts           # LLM 客戶端（含模擬實現）
│   └── prompts/
│       ├── persona.qinShihuang.ts  # 秦始皇完整配置
│       └── safety.guardrails.ts    # 安全防護機制
├── store/
│   ├── useChatStore.ts        # 對話狀態管理
│   ├── useUIStore.ts          # UI 狀態管理
│   └── useTeacherStore.ts     # 教師面板狀態
├── types/
│   ├── chat.ts               # 對話相關類型
│   ├── persona.ts            # 人物配置類型
│   └── api.ts                # API 相關類型
└── utils/
    ├── text.ts               # 文本處理工具
    └── textAnalysis.ts       # 可讀性分析
```

## 📋 核心功能詳解

### 1. 對話系統 (`ChatWindow.tsx`)

**主要特性**：

- 🔄 **串流顯示**：逐字符顯示，提供真實對話感受
- 📊 **可讀性指標**：實時顯示回覆的可讀性評分
- 🔍 **史實檢查**：標示史實可信度（預留接口）
- 🎨 **響應式設計**：支援深色模式與無障礙功能

**使用範例**：

```typescript
// 在任何組件中使用對話功能
import { useChatStore } from "../store/useChatStore";

const MyComponent = () => {
  const { actions } = useChatStore();

  const handleQuickStart = () => {
    actions.setMode("teaching"); // 設定教學模式
    actions.setRigorLevel("balanced"); // 設定平衡嚴謹度
    actions.sendMessage("你為什麼要統一六國？");
  };
};
```

### 2. 人物配置系統 (`persona.qinShihuang.ts`)

**配置架構**：

```typescript
interface PersonaConfig {
  // 基本資訊
  id: string;
  name: string;
  period: string;

  // 語言特徵
  language: {
    firstPerson: string; // "朕"
    tone: "formal"; // 語氣風格
    vocabulary: string[]; // 專有詞彙
    forbiddenWords: string[]; // 禁用詞彙
  };

  // 知識領域與限制
  expertise: {
    primary: string[]; // 主要專長
    secondary: string[]; // 次要知識
    limitations: string[]; // 明確限制
  };

  // 教學配置
  teaching: {
    maxResponseLength: {
      teaching: 600; // 教學模式字數
      quick: 150; // 快問快答字數
      socratic: 200; // 蘇格拉底模式字數
    };
  };
}
```

### 3. 安全防護機制 (`safety.guardrails.ts`)

**多層防護**：

```typescript
// 1. 輸入內容檢查
const safetyResult = checkContentSafety(userInput);

// 2. 回應內容檢查
const responseCheck = checkResponseSafety(assistantResponse);

// 3. 教育性重導向
if (!safetyResult.isSafe) {
  // 提供適當的學習引導
  showEducationalRedirect(safetyResult.alternativePrompt);
}
```

**安全分類**：

- 🚫 **暴力與仇恨內容**：完全阻擋
- ⚠️ **時代錯置概念**：重導向至歷史脈絡
- 📚 **教育性引導**：提供替代學習方向

### 4. 提示詞工程系統

**三種對話模式**：

#### 教學模式 (Teaching Mode)

- **目標**：深度教學，詳細解釋
- **字數**：300-600 字
- **結構**：核心答案 → 歷史背景 → 政策動機 → 歷史影響 → 延伸思考

#### 快問快答模式 (Quick Mode)

- **目標**：快速獲得要點
- **字數**：80-160 字
- **結構**：直接回答 → 關鍵背景 → 簡要意義

#### 蘇格拉底模式 (Socratic Mode)

- **目標**：啟發式提問，引導思考
- **字數**：150-250 字
- **結構**：基礎資訊 → 引導性問題 → 思考層次遞進

**三種嚴謹度等級**：

- **嚴謹 (Strict)**：僅基於確切史料，學術嚴謹
- **平衡 (Balanced)**：史實與教學需求並重
- **輕鬆 (Casual)**：親和友善，易於理解

## 🎛️ 教師控制功能

### 1. 即時控制

```typescript
// 控制學生對話參數
const { actions } = useTeacherStore();

actions.updateClassroomSettings({
  allowStudentPersonaSwitch: false, // 限制學生切換人物
  moderationLevel: "high", // 提高監控等級
  maxResponseLength: 400, // 限制回應長度
  enableSourceCitations: true, // 顯示來源引用
});
```

### 2. 安全監控

```typescript
// 監控標記內容
actions.addFlaggedContent({
  sessionId: "student-123",
  content: "不當問題內容",
  flagReason: "包含不適當的歷史美化",
  resolved: false,
});
```

### 3. 數據分析（預留接口）

- 📈 **會話統計**：總會話數、平均時長、熱門話題
- 📊 **可讀性趨勢**：學生理解度變化軌跡
- ⚠️ **安全事件**：不當內容攔截記錄

## 🔧 擴展新歷史人物

### 步驟一：創建人物配置（15 分鐘）

```typescript
// 1. 新建檔案：src/services/prompts/persona.hanWuDi.ts
export const hanWuDiPersona: PersonaConfig = {
  id: "han-wu-di",
  name: "漢武帝",
  period: "西漢 (156-87 BCE)",

  language: {
    firstPerson: "朕",
    tone: "formal",
    vocabulary: ["推恩令", "絲綢之路", "霍去病", "衛青"],
    forbiddenWords: ["現代化", "科技", "民主"],
  },

  expertise: {
    primary: ["對外征伐", "推恩令", "絲綢之路開拓"],
    secondary: ["經濟政策", "人才選拔"],
    limitations: ["對後世朝代的了解"],
  },

  // ... 其他配置
};

// 2. 編寫提示詞
export const hanWuDiPrompts: PersonaPrompts = {
  system: `你是西漢武帝劉徹，以開疆拓土和文治武功著稱...`,
  // ... 完整提示詞配置
};
```

### 步驟二：註冊到系統

```typescript
// 在 useTeacherStore.ts 中添加
personas: [
  qinShiHuangPersona,
  hanWuDiPersona, // 新增
];
```

### 步驟三：測試與調優

```typescript
// 測試案例
const testCases = [
  {
    input: "推恩令是什麼政策？",
    persona: "han-wu-di",
    expectedKeywords: ["推恩令", "諸侯", "削藩"],
  },
];
```

## 🔍 評估與測試標準

### 自動化測試（建議實現）

```typescript
// 可讀性測試
describe("可讀性評估", () => {
  test("教學模式回應應符合目標年級", () => {
    const response = "朕統一六國...";
    const metrics = calculateReadabilityScore(response);
    expect(metrics.score).toBeGreaterThan(60);
    expect(metrics.gradeLevel).toBeLessThan(10);
  });
});

// 安全性測試
describe("安全防護", () => {
  test("應攔截不當歷史美化", () => {
    const input = "偉大的征服戰爭";
    const result = checkContentSafety(input);
    expect(result.isSafe).toBeFalsy();
  });
});
```

### 手動測試檢查清單

**對話品質檢查**：

- [ ] 回應符合人物時代背景
- [ ] 避免現代詞彙與概念
- [ ] 提供多元史學觀點
- [ ] 語氣與身分一致

**技術性能檢查**：

- [ ] 首次載入 < 2.5 秒
- [ ] 串流回應流暢
- [ ] 錯誤處理完善
- [ ] 響應式設計正確

## 🚀 部署建議

### 生產環境配置

```typescript
// 環境變數設定
VITE_LLM_API_KEY=your_api_key
VITE_LLM_BASE_URL=https://api.openai.com/v1
VITE_ANALYTICS_ID=your_analytics_id
```

### 性能優化

```typescript
// 代碼分割
const ChatWindow = lazy(() => import('./components/chat/ChatWindow'));
const TeacherPanel = lazy(() => import('./components/teacher/TeacherPanel'));

// 預載入關鍵資源
<link rel="preload" href="/avatars/qin-shi-huang.jpg" as="image">
```

### 安全配置

```typescript
// CSP 頭部設定
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
```

## 📊 成功指標達成情況

### ✅ 已實現標準

- [x] **架構完整性**：React + TypeScript + 組件化設計
- [x] **可讀性評估**：中文適配的 Flesch 算法
- [x] **安全防護**：多層內容過濾與教育引導
- [x] **人物可擴展性**：15 分鐘新增流程
- [x] **用戶體驗**：串流顯示、響應式設計

### 🟡 部分實現標準

- [~] **LLM 整合**：框架完整，需要真實 API
- [~] **史實檢查**：接口預留，演算法待實現
- [~] **教師面板**：狀態管理完成，UI 待開發

### 📋 後續開發優先級

**P0（立即）**：

1. 整合真實 LLM API
2. 完善錯誤處理與邊界情況

**P1（短期）**：

1. 實現教師控制面板 UI
2. 添加數據持久化
3. 完善史實檢查算法

**P2（長期）**：

1. 多語言支援
2. 語音對話功能
3. 移動端優化

## 🎓 教學使用指南

### 課堂應用場景

**投影互動模式**：

1. 教師控制模式與嚴謹度
2. 學生提問，全班共同觀看回應
3. 教師引導延伸討論

**個人學習模式**：

1. 學生自主選擇對話參數
2. 系統提供問題建議
3. 可讀性指標幫助理解

**混合學習模式**：

1. 課前預習：學生個別對話
2. 課堂討論：分享有趣問答
3. 課後複習：深化理解

### 教學最佳實踐

**問題設計建議**：

- 從具體事件開始：「你為什麼修築長城？」
- 逐步深入原因：「這與北方游牧民族有什麼關係？」
- 引導比較思考：「與戰國時期的防禦有何不同？」

**討論引導策略**：

- 鼓勵學生質疑與思辨
- 結合不同史料觀點
- 連結古今，啟發思考

---

## 💡 創新特色總結

1. **史實嚴謹性與教育適宜性的平衡**：三級嚴謹度滿足不同教學需求
2. **沉浸式學習體驗**：第一人稱對話，歷史語境完整
3. **安全防護與教育引導**：將安全問題轉化為教學機會
4. **可量化的學習效果**：可讀性指標、史實檢查、互動數據
5. **高度可擴展性**：15 分鐘添加新人物的高效流程

本系統為歷史教育數位化提供了一個專業、安全、高效的解決方案，具備良好的教學適用性與技術可持續性。
