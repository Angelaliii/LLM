# 歷史任務制 AI 系統 - 完整實作指南

## 🎯 系統概要

本系統是一個創新的歷史教育平台，採用任務制學習模式（S0→S5），結合 LLM 雙過程理論（System 1/2），提供沉浸式歷史學習體驗。學生透過與 NPC 對話探索歷史事件，系統智能評估學習進度並自動調整教學節奏。

### 📚 學習流程設計

**S0 任務選單** → **S1 任務開場故事** → **S2 選擇對話角色** → **S3 NPC 對話（System 1）** ↔ **S3-EVAL 進度評估（System 2）** → **S4 系統重述完整故事** → **S5 測驗與回饋**

### 🏗️ 技術架構

#### 前端架構
- **框架**：React 18 + TypeScript + Vite
- **狀態管理**：Zustand（任務流程 + 對話狀態）
- **樣式系統**：Tailwind CSS（響應式、深色模式）
- **路由系統**：React Router v6

#### 後端架構
- **運行環境**：Node.js + Express + TypeScript
- **LLM 服務**：本機 Ollama（llama3.2:3b 模型）
- **AI 功能**：RAG 檢索 + 雙過程評估 + 智能提示詞工程
- **安全防護**：多層內容過濾與教育性重導向

## 🚀 快速開始

### 1. 環境要求

```bash
Node.js >= 18.0.0
npm >= 8.0.0
Ollama >= 0.1.0（本機 LLM 服務）
```

### 2. 安裝與啟動

#### 步驟 1：安裝並啟動 Ollama
```powershell
# 下載安裝 Ollama Desktop 或 CLI
# https://ollama.ai/

# 拉取模型
ollama pull llama3.2:3b

# 啟動 Ollama 服務（Desktop 版會自動啟動）
ollama serve
```

#### 步驟 2：啟動後端服務
```powershell
# 進入後端目錄
cd backend

# 安裝依賴
npm install

# 啟動後端開發服務器
npm run dev

# 後端將在 http://localhost:4000 運行
```

#### 步驟 3：啟動前端應用
```powershell
# 在專案根目錄
npm install

# 啟動前端開發服務器
npm run dev

# 前端將在 http://localhost:3000 運行
```

### 3. 項目結構總覽

```
🏠 專案根目錄/
├── 📁 frontend/           # 前端應用程式
│   ├── 🎨 components/
│   │   ├── chat/              # 對話系統核心組件
│   │   │   ├── ChatWindow.tsx      # 主對話視窗
│   │   │   ├── MessageBubble.tsx   # 消息氣泡（支援串流）
│   │   │   └── PersonaSidebar.tsx  # NPC 切換面板
│   │   ├── mission/           # 任務流程組件（S0-S5）
│   │   │   ├── MissionList.tsx     # S0: 任務選單
│   │   │   ├── MissionIntro.tsx    # S1: 任務開場故事
│   │   │   ├── NPCSelector.tsx     # S2: 選擇 NPC
│   │   │   ├── ChatRoom.tsx        # S3: NPC 對話
│   │   │   ├── SummaryView.tsx     # S4: 故事重述
│   │   │   └── QuizView.tsx        # S5: 測驗回饋
│   │   └── ui/               # 通用 UI 組件
│   ├── 🔧 services/
│   │   ├── llmClient.ts           # 前端 API 包裝層
│   │   └── analytics.ts           # 學習數據分析
│   ├── 📊 store/
│   │   ├── useChatStore.ts        # 任務與對話狀態
│   │   └── useUIStore.ts          # UI 狀態管理
│   ├── 📝 types/              # 前端類型定義
│   └── 🛠 utils/              # 前端工具函數
│
├── 📁 backend/            # 後端 API 服務
│   ├── 🚀 services/
│   │   ├── ollamaClient.ts        # Ollama LLM 客戶端
│   │   ├── missionPrompt.ts       # RAG + 提示詞工程
│   │   ├── progressEval.ts        # S3-EVAL 進度評估
│   │   ├── llmClient.ts           # LLM 業務邏輯
│   │   └── prompts/
│   │       ├── persona.qinShihuang.ts  # 秦始皇角色配置
│   │       └── safety.guardrails.ts    # 安全防護機制
│   ├── 🛣 routes/
│   │   ├── ollama.ts              # POST /api/ollama/chat
│   │   └── eval.ts                # POST /api/eval
│   ├── 📁 data/
│   │   └── missions/
│   │       └── e2-industrial-agri.ts   # E2 任務資料
│   ├── 📝 types/              # 後端類型定義
│   └── 📋 README.md           # 後端詳細文檔
│
└── 📄 vite.config.ts      # 前端構建配置（代理後端 API）
```

## 📚 使用者流程詳解（S0-S5 任務制學習）

### 📄 S0 - 任務選單（Mission List）

**使用者行為**：
從任務列表中選擇要挑戰的歷史情境（例：E2 工業日本・農業臺灣）

**系統功能**：
- 任務卡片列表：時代標籤、難度、完成狀態
- 從前端靜態資料載入任務清單
- 無需 LLM 介入，直接進入 S1

### 📜 S1 - 任務開場故事（Narrative Intro）

**使用者行為**：
閱讀歷史背景故事（150-200字），理解核心問題

**LLM 使用**（System 1）：
```typescript
// 從 missionId 取得背景 chunk 與任務目標
// 使用 llama3.2:3b 產生：
// - 任務背景故事
// - 引導性問題。
const storyResult = await missionPrompt.generateIntro(missionId);
```

### 💭 S2 - 選擇對話角色（NPC Select）

**使用者行為**：
從 NPC 清單中選擇要先詢問的角色：
- 🏭 日本技師（山田清一）
- 👨‍🌾 伃農（陳阿中）
- 🏢 製糖會社幹部（佐藤武）

### 💬 S3 - NPC 對話（System 1：直覺聊天）

**使用者行為**：
以類似聊天視窗的方式，和選定的 NPC 來回對話

**技術實現**：
```typescript
// 每次使用者送出訊息：
// 1. RAG 檢索：從任務 chunks 中找到相關內容
// 2. 角色設定：取出當前 NPC 的 persona
// 3. LLM 產生回應
const response = await ollamaClient.chat({
  messages: [systemPrompt, userMessage],
  context: ragResults,
  persona: currentNPC
});
```

### 🔍 S3-EVAL - 進度評估（System 2：慢思考老師）

**觸發時機**：每過 2-3 輪對話，或關鍵用語出現時

**LLM 使用**（System 2）：
```typescript
// 在背景惄惄進行，不直接顯示給學生
const evalResult = await progressEval.assess({
  learningGoals,        // 該任務的學習目標
  conversationSummary,  // 壓縮過的對話摘要
  expectedOutput: 'JSON' // 每個目標標記：not_mentioned|wrong|partial|mastered
});

// 達到門檼判斷
if (conversationTurns >= 6 && 
    evalResult.masteredCount >= 3 && 
    evalResult.confidence >= 0.7) {
  進入 S4;
}
```

### 📜 S4 - 系統重述完整故事（Mission Summary）

**使用者行為**：
閱讀系統整理過的完整故事，把剛剛對話得到的零碎線索串起來

**LLM 使用**：
```typescript
// 結合所有資訊產生結構化故事
const summary = await missionPrompt.generateSummary({
  chunks: 任務核心內容,
  goals: 學習目標,
  conversation: 對話摘要,
  evalResult: S3評估結果,
  style: '國中程度、條理清楚、300-500字'
});
```

### 📋 S5 - 測驗與回饋（Quiz & Feedback）

**使用者行為**：
作答 3-10 題選擇題/判斷題/資料題，查看分數與解析

**技術實現**：
- 題目來源：主要使用事先設計好的 `missionQuizzes`
- 作答時：前端根據題庫中的 `answer` 判斷對錯，無需再叫 LLM
- 結果記錄：正確題數、使用提示次數、作答時間

## 🏛️ 教師監控功能

### 1. 即時任務控制

```typescript
// 控制學生任務參數
const { actions } = useTeacherStore();

actions.updateClassroomSettings({
  allowStudentMissionSwitch: false, // 限制學生切換任務
  moderationLevel: "high", // 提高監控等級
  maxNPCInteractions: 10, // 限制 NPC 互動次數
  enableProgressHints: true, // 啟用進度提示
});
```

### 2. 學習進度監控

```typescript
// 即時查看學生狀態
const studentProgress = useTeacherStore(state => ({
  currentStage: state.currentStage, // S0-S5 當前階段
  conversationTurns: state.conversationTurns, // 對話輪數
  masteredGoals: state.evalResult?.masteredCount, // 已掌握目標數
  timeSpent: state.sessionDuration, // 學習時間
  flaggedContent: state.safetyAlerts // 安全警示
}));
```

### 3. 智能警示系統

```typescript
// 監控標記內容
actions.addFlaggedContent({
  sessionId: "student-123",
  content: "不當歷史美化問題",
  flagReason: "包含不適當的歷史美化",
  stage: "S3", // 發生在哪個階段
  resolved: false,
});

// 自動觸發教育引導
if (flaggedContent.severity === 'high') {
  triggerEducationalRedirect(flaggedContent.alternativePrompt);
}
```

## 🔧 擴展新歷史任務

### 步驟一：建立任務資料結構（15 分鐘）

```typescript
// 新建檔案：backend/data/missions/e3-ming-qing-transition.ts
export const e3MissionData: MissionData = {
  id: "E3",
  title: "明清替代與文化變遷",
  period: "明末清初 (1600-1700)",
  difficulty: "intermediate",

  // RAG 知識片段
  chunks: [
    {
      id: "e3-001",
      topic: "明清替代背景",
      type: "core_fact",
      text: "明末政治腐敗，農民起義频繁..."
    },
    // ... 更多 chunks
  ],

  // NPC 角色卡
  npcs: [
    {
      id: "npc-ming-scholar",
      name: "王夫之",
      role: "明末士大夫",
      persona: "你是明末的一位士大夫...",
      canTalkAbout: ["科舉制度", "政治改革", "文化传統"],
      avoid: ["對清朝的預知"]
    },
    // ... 更多 NPCs
  ],

  // 學習目標
  learningGoals: [
    {
      id: "e3-g1",
      description: "理解明清替代的歷史原因"
    },
    // ... 更多目標
  ],

  // 測驗題庫
  quizzes: [
    {
      id: "e3-q1",
      stem: "明末最主要的政治問題是？",
      options: [
        { key: "A", text: "農民起義" },
        // ... 更多選項
      ],
      answer: "A",
      explanation: "明末農民起義頁繁..."
    }
  ]
};
```

### 步驟二：註冊到系統

```typescript
// 在 backend/data/missions/index.ts 中添加
import { e3MissionData } from './e3-ming-qing-transition';

export const allMissions = [
  e2IndustrialAgriData,
  e3MissionData, // 新增
];
```

### 步驟三：測試與調優

```typescript
// 測試案例
const testCases = [
  {
    missionId: "E3",
    stage: "S3",
    input: "為什麼科舉制度會影響政治？",
    expectedNPCResponse: 包含["科舉", "士大夫", "政治參與"],
    expectedGoalProgress: "partial"
  },
];
```

## 🔧 技術架構詳細說明

### 1. 前後端整合架構

```typescript
// vite.config.ts - 前端代理配置
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // 後端 API
        changeOrigin: true,
      },
    },
  },
});

// frontend/services/llmClient.ts - API 包裝
export async function sendMessage(data: ChatRequest) {
  const response = await fetch('/api/ollama/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### 2. Ollama 整合架構

```typescript
// backend/services/ollamaClient.ts
export class OllamaClient {
  private baseURL = 'http://localhost:11434';
  private model = 'llama3.2:3b';

  async chat(messages: ChatMessage[], options?: ChatOptions) {
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: options?.stream ?? false,
        ...options,
      }),
    });

    return this.parseResponse(response);
  }
}
```

### 3. RAG 檢索系統

```typescript
// backend/services/missionPrompt.ts - 簡易 RAG
export function retrieveChunks(
  chunks: Chunk[],
  query: string,
  limit = 4
): Chunk[] {
  // 目前使用關鍵字配對，未來可升級為向量相似度
  const scored = chunks
    .filter(c => c.text.includes(query) || c.topic.includes(query))
    .slice(0, limit);
  
  return scored;
}
```

## 🚀 部署建議

### 生產環境配置

```bash
# Docker 部署（建議）
docker-compose up -d

# 或手動部署
npm run build          # 前端構建
npm run start:backend  # 後端生產服務
```

### 環境變數設定

```bash
# .env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
PORT=4000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
```

## 📈 成功指標達成情況

### ✅ 已實現標準

- [x] **任務制學習流程**：S0-S5 完整情境學習
- [x] **LLM 雙過程理論**：System 1/2 分離架構
- [x] **RAG 知識檢索**：歷史知識片段管理
- [x] **安全防護機制**：多層內容過濾與教育引導
- [x] **進度評估系統**：智能學習進度追蹤

### 🟡 部分實現標準

- [~] **歷史任務擴展**：框架完整，需增加更多任務
- [~] **教師監控面板**：狀態管理完成，UI 待開發
- [~] **學習數據分析**：基礎機制完成，需增強分析

### 📋 後續開發優先級

**P0（立即）**：
1. 完善錯誤處理與邊界情況
2. 添加更多歷史任務（E3, E4...）

**P1（短期）**：
1. 實現教師控制面板 UI
2. 添加數據持久化（學習歷程記錄）
3. 完善可讀性分析算法

**P2（長期）**：
1. 多語言支援（英文、日文）
2. 語音對話功能
3. 移動端優化

## 💡 創新特色總結

1. **任務制學習設計**：S0-S5 遊戲化歷史學習體驗
2. **LLM 雙過程架構**：System 1 直覺對話 + System 2 進度評估
3. **沉浸式歷史情境**：多角度 NPC 對話，探索歷史真相
4. **智能適性學習**：根據學習進度自動調整教學節奏
5. **教育安全保障**：將安全問題轉化為教學機會
6. **高度可擴展性**：15 分鐘新增歷史任務的高效流程

本系統為歷史教育數位化提供了一個專業、安全、高效的解決方案，具備良好的教學適用性與技術可持續性。

---

🔗 **相關文檔**：
- [後端 API 詳細文檔](backend/README.md)
- [使用者流程說明](docs/使用者流程.md)
