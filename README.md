# 歷史任務制 AI 系統 - 完整實作指南

## 🎯 系統概要

本系統是一個創新的歷史教育平台，採用任務制學習模式（S0→S5），結合 LLM 雙過程理論（System 1/2），提供沉浸式歷史學習體驗。學生透過與 NPC 對話探索歷史事件，系統智能評估學習進度並自動調整教學節奏。

### 📚 學習流程設計

**S0 任務選單** → **S1 任務開場故事** → **S2 選擇對話角色** → **S3 NPC 對話** → **S4 鑰匙配對確認學習指標** → **S5 完成畫面**

### 🏗️ 技術架構

#### 前端架構

- **框架**：React 18 + TypeScript + Vite
- **狀態管理**：Zustand（任務流程 + 對話狀態）
- **樣式系統**：Tailwind CSS + PostCSS
- **路由系統**：React Router v6
- **API 通訊**：Fetch API（自動代理至後端）

#### 後端架構

- **運行環境**：Node.js 18+ + Express 5 + TypeScript
- **LLM 服務**：多引擎架構
  - **Mistral API**（雲端）：mistral-small-latest（NPC 對話生成 + 追問建議）
  - **Ollama**（本機）：llama3.2:3b 模型（向量嵌入 + 進度評估）
- **AI 功能**：RAG 檢索 + 進度評估 + 智能提示詞工程
- **向量資料庫**：記憶體快取 + 向量搜尋（Ollama embeddings）
- **安全防護**：多層內容過濾與教育性重導向

## 🚀 快速開始

### 1. 環境要求

```bash
Node.js >= 18.0.0
npm >= 8.0.0
Ollama >= 0.1.0（本機 LLM 服務）
Mistral API Key（可選，用於進度評估）
```

### 2. 安裝與啟動

#### 步驟 1：安裝並啟動 Ollama

```powershell
# 下載安裝 Ollama Desktop 或 CLI
# https://ollama.ai/

# 拉取模型
ollama pull llama3.2:3b
ollama pull nomic-embed-text:latest

# 啟動 Ollama 服務（Desktop 版會自動啟動）
ollama serve
```

#### 步驟 2：配置環境變數

```powershell
# 在 backend 目錄建立 .env 文件
cd backend
copy .env.example .env  # 或手動建立

# 編輯 .env，至少需要設定：
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
MISTRAL_API_KEY=your_api_key_here  # 可選
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

#### 步驟 3：啟動後端服務

```powershell
# 進入後端目錄
cd backend

# 安裝依賴
npm install

# 啟動後端開發服務器（會初始化向量資料庫）
npm run dev

```

#### 步驟 4：啟動前端應用

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
├── 📁 frontend/                    # 前端應用程式 (React + TypeScript)
│   ├── 📁 app/
│   │   ├── AppMain.tsx                 # S0-S5 主應用入口
│   │   ├── 🎨 components/
│   │   │   ├── MissionList.tsx         # S0: 任務選單
│   │   │   ├── s1/S1_FileDecryption    # S1: 任務開場故事
│   │   │   ├── s2/S2_NpcSelection      # S2: 選擇 NPC
│   │   │   ├── new_S3.tsx              # S3: NPC 對話 (LINE 式聊天)
│   │   │   ├── s4/S4_ArchiveRepair     # S4: 故事重述
│   │   │   ├── s5/S5_ViewpointVerification  # S5: 測驗與回饋
│   │   │   ├── PromptChips.tsx         # 追問提示組件
│   │   │   └── AppErrorBoundary.tsx    # 錯誤邊界處理
│   │   ├── 🔧 services/
│   │   │   ├── llmClient.ts            # 後端 API 包裝 (game/chat session)
│   │   │   ├── rag.ts                  # RAG 檢索客戶端
│   │   │   └── analytics.ts            # 學習數據分析
│   │   ├── 📊 store/
│   │   │   ├── useMissionStore.ts      # 任務流程狀態 (S0-S5)
│   │   │   ├── useChatStore.ts         # 對話狀態管理
│   │   │   ├── useMultiChatStore.ts    # 多 NPC 對話狀態
│   │   │   └── useUIStore.ts           # UI 狀態管理
│   │   ├── 📝 types/
│   │   │   ├── api.ts                  # API 類型定義
│   │   │   ├── chat.ts                 # 對話相關類型
│   │   │   ├── history.ts              # 歷史記錄類型
│   │   │   └── persona.ts              # NPC 角色類型
│   │   ├── 📁 config/
│   │   │   └── keywords.ts             # 關鍵詞配置
│   │   ├── 📁 data/
│   │   │   ├── missions/               # 前端任務數據
│   │   │   ├── copy.ts                 # 文案內容
│   │   │   ├── faq.ts                  # FAQ 數據
│   │   │   └── predefinedQA.ts         # 預定義問答
│   │   ├── 🛠 utils/
│   │   │   ├── clearGameData.ts        # 遊戲數據清除
│   │   │   ├── textAnalysis.ts         # 文本分析工具
│   │   │   └── validators.ts           # 表單驗證
│   │   └── 🎨 styles/
│   │       └── index.css               # 全局樣式
│   ├── 📁 sales/                   # 銷售頁面 (行銷)
│   │   ├── SalesPage.tsx
│   │   └── components/
│   ├── App.tsx                     # 應用根組件 (路由總入口)
│   ├── main.tsx                    # React 初始化入口
│   └── index.html
│
├── 📁 backend/                     # 後端 API 服務 (Node.js + Express)
│   ├── index.ts                    # 應用入口 (初始化 VectorDB、任務數據)
│   ├── 🚀 services/                # 核心業務邏輯
│   │   ├── ollamaClient.ts         # ⭐ Ollama LLM 客戶端 (對話生成)
│   │   ├── mistralClient.ts        # ⭐ Mistral API 客戶端 (評估、審查)
│   │   ├── gameService.ts          # 遊戲邏輯核心 (RAG + NPC 回應)
│   │   ├── progressEval.ts         # ⭐ S3-EVAL 進度評估 (System 2)
│   │   ├── embeddingService.ts     # ⭐ 向量嵌入生成 (Ollama embeddings)
│   │   ├── simpleVectorDB.ts       # ⭐ 向量資料庫 (記憶體 + 快取)
│   │   ├── npcConfigManager.ts     # NPC 配置管理 (角色、知識域、轉接規則)
│   │   ├── personaCache.ts         # NPC Persona 快取管理
│   │   ├── promptService.ts        # ⭐ 智能提示詞工程 (話題偵測、追問建議)
│   │   ├── missionLoader.ts        # 任務資料預載入
│   │   ├── demoStream.ts           # 串流演示服務
│   │   ├── ragToneFilter.ts        # RAG 內容轉換 + 語調過濾
│   │   └── prompts/
│   │       ├── safety.guardrails.ts    # ⭐ 安全防護機制 (關鍵字檢查、時代檢驗)
│   │       └── README_PromptService.md
│   ├── 🛣 routes/                  # API 路由
│   │   ├── game.ts                 # POST /api/game/start, POST /api/game/chat
│   │   ├── ollama.ts               # POST /api/ollama/chat (直接對話)
│   │   ├── eval.ts                 # POST /api/eval (進度評估)
│   │   ├── missions.ts             # GET /api/missions (任務列表)
│   │   └── missions.ts             # GET /api/missions/:id (任務詳情)
│   ├── 📁 config/
│   │   └── keywords.ts             # 中英文關鍵詞映射
│   ├── 📁 data/
│   │   ├── missions/
│   │   │   ├── mission.ts          # ⭐ E2 任務資料 (chunks, NPCs, quizzes)
│   │   │   └── index.ts
│   │   ├── knowledge/
│   │   │   ├── knowledge_base.json     # ⭐ 知識庫 (RAG 文檔)
│   │   │   └── knowledge_vectors_cache.json  # 向量快取
│   │   ├── persona/
│   │   │   ├── NPC_JP01_Student.md       # ⭐ 小清 (學生) Persona 文件
│   │   │   ├── NPC_JP02_Police.md        # ⭐ 佐藤 (警察) Persona 文件
│   │   │   └── NPC_JP03_LandSurveyor.md  # ⭐ 山本 (土地測量員) Persona 文件
│   │   └── missions/
│   │       └── mission.ts          # 任務定義
│   ├── 📝 types/
│   │   ├── api.ts                  # API 類型
│   │   ├── chat.ts                 # 對話類型
│   │   └── persona.ts              # NPC 類型
│   ├── package.json                # 後端依賴
│   ├── tsconfig.json               # TypeScript 配置
│   ├── README.md                   # 後端詳細文檔
│   └── start.bat                   # 啟動腳本

├── 📁 docs/                        # 系統文檔
│   ├── NPC回答規則.md
│   ├── 任務與對話機制說明.md
│   ├── 使用流程V2.md
│   ├── 對話系統架構.md
│   ├── 關卡破關機制.md
│   └── assets/

├── 📁 scripts/                     # 實用腳本
│   └── clear-local-storage.js      # 清除本地數據

├── 📄 package.json                 # 前端依賴
├── 📄 vite.config.ts               # Vite 配置 (代理 /api 至後端)
├── 📄 tsconfig.json                # TypeScript 配置
├── 📄 tailwind.config.js           # Tailwind CSS 配置
├── 📄 postcss.config.js            # PostCSS 配置
├── 📄 index.html                   # 前端入口 HTML
├── 📄 server.js                    # 開發服務器
├── 📄 README.md                    # 本文檔
└── 📄 SIMPLE_CHAT_README.md        # 簡易聊天模式說明
```

### ⭐ LLM 相關核心檔案位置

詳見下方 **[LLM 核心模組指南](#-llm-核心模組指南)** 段落。

## 📚 使用者流程詳解（S0-S5 任務制學習）

### 📄 S0 - 任務選單（Mission List）

**檔案**：[frontend/app/components/MissionList.tsx](frontend/app/components/MissionList.tsx)

**使用者行為**：
從任務列表中選擇要挑戰的歷史情境

**系統功能**：

- 任務卡片列表：時代標籤、難度、完成狀態
- 從前端靜態資料載入任務清單
- 無需 LLM 介入，直接進入 S1

**狀態流**：`useMissionStore` 紀錄 `currentMissionId`，進入 S1

---

### 📜 S1 - 任務開場故事（Narrative Intro）

**檔案**：[frontend/app/components/s1/S1_FileDecryption.tsx](frontend/app/components/s1/S1_FileDecryption.tsx)

**使用者行為**：
閱讀歷史背景故事（150-200 字），理解核心問題

**系統實現** (無 LLM)：

```typescript
// frontend/app/components/s1/S1_FileDecryption.tsx 實際使用
import { getMissionById } from "../../data/missions";

const mission = getMissionById(missionId);
const missionData = mission || FALLBACK_MISSION;

// 顯示任務背景故事 + 填空遊戲 UI
return (
  <div className="mission-document">
    <h2>{missionData.title}</h2>
    <p className="period">{missionData.period}</p>
    <RedactedBlock
      contentTemplate={missionData.contentTemplate}
      redactedFields={missionData.redactedFields}
      onFieldRevealed={handleReveal}
    />
  </div>
);
```

**LLM 使用**：無 - S1 僅展示預設靜態內容，不需要 LLM 生成

---

### 💭 S2 - 選擇對話角色（NPC Select）

**檔案**：[frontend/app/components/s2/S2_NpcSelection.tsx](frontend/app/components/s2/S2_NpcSelection.tsx)

**使用者行為**：
從 NPC 清單中選擇要先詢問的角色：

- 小清（學生）- 從基層民眾視角看日治
- 佐藤敬一（警察）- 從日本官員視角看統治
- 山本勘助（土地測量員）- 從技術官僚視角看經濟

**系統資訊**：

- NPC 定義：[backend/services/npcConfigManager.ts](backend/services/npcConfigManager.ts) (NPC_GAME_CONFIGS)
- Persona 文件：[backend/data/persona/\*.md](backend/data/persona/)

---

### 💬 S3 - NPC 對話（System 1：直覺聊天）

**檔案**：[frontend/app/components/new_S3.tsx](frontend/app/components/new_S3.tsx)（前端）
[backend/services/gameService.ts](backend/services/gameService.ts)（後端核心）
[backend/routes/game.ts](backend/routes/game.ts)（API 端點）

**使用者行為**：
以類似聊天視窗的方式，和選定的 NPC 來回對話

**技術實現流程**：

```typescript
// ============ 前端 ============
// frontend/app/services/llmClient.ts 實際使用
streamChatViaBackend(userMessage, { npcId, missionId, handlers }) {
  // 1. 獲取或創建遊戲 session
  const sessionId = await getOrCreateGameSession(npcId, missionId)
  // POST /api/game/start → 返回 { sessionId, initialContext }

  // 2. 發送聊天訊息到後端
  const response = await fetch('/api/game/chat', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      message: userMessage,
      conversationHistory,
      summaries,
      keyPoints
    })
  });

  // 3. 逐字顯示回應（打字效果）
  for (const char of npcResponse) {
    displayChar(char); // React state update
  }

  // 4. 短暫延遲後顯示追問建議
  setTimeout(() => {
    displaySuggestions(suggestions); // 三個推薦追問
  }, 2000);
}

// ============ 後端（gameService.ts） ============
export async function handleGameChat(request: GameChatRequest) {
  const { npcId, message, conversationHistory, summaries, keyPoints } = request;

  // a) 過濾對話歷史 → 移除重複自介、教學口吻
  const filteredHistory = filterConversationHistory(conversationHistory, npcId);

  // b) 建構系統提示詞
  const systemPrompt = await buildSystemPrompt(
    npcId,
    message,
    conversationHistory.length / 2,  // 對話輪數
    'E2',  // missionId
    summaries,  // 記憶摘要
    keyPoints   // 已掌握的知識點
  );

  // c) 整合所有訊息
  const messages: MistralChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...filteredHistory,
    { role: 'user', content: message }
  ];

  // d) 調用 Mistral API 生成完整回應
  const tempPrimary = getNpcTemperature(npcId, 0.7);
  let primaryResponse = await chatWithMistral(messages, {
    temperature: tempPrimary,
    maxTokens: 750
  });

  // e) 品質檢查 + 回退策略
  const qualityCheck = checkResponseQuality(primaryResponse, npcId);
  if (qualityCheck.hasIssues) {
    // 低溫重試 (temperature: 0.3)
    primaryResponse = await chatWithMistral(messages, {
      temperature: 0.3,
      maxTokens: 750
    });
  }

  // f) 解析 Mistral 回應結構
  const parsed = parseResponse(primaryResponse);
  // 提取：thinking、reply、suggestions (JSON)

  return {
    reply: parsed.reply,
    suggestions: parsed.suggestions,
    thinking: parsed.thinking  // 內部邏輯，不顯示給用戶
  };
}
```

// ============ 前端顯示 ============
// 5. 逐字顯示回應 + 延遲後顯示追問

```typescript
for (const char of response) {
  displayChar(char); // 打字效果
}
// 短暫延遲...
displaySuggestions(suggestions); // 顯示三個追問建議
```

**關鍵模組使用詳情**：

| 模組                  | 函數                                  | 用途                        |
| --------------------- | ------------------------------------- | --------------------------- |
| **simpleVectorDB**    | `searchKnowledge(query, npcRole)`     | 檢索最相關的 3-4 個知識片段 |
| **embeddingService**  | `generateEmbedding(text)`             | 將查詢轉換為向量            |
| **personaCache**      | `get(npcId)`                          | 載入 NPC Persona 原始文本   |
| **promptService**     | `detectTopic(message, npcId)`         | 偵測對話話題 (11 種)        |
| **promptService**     | `getSmartPrompts(npcId, lastMessage)` | 取得該話題相關的追問建議    |
| **ragToneFilter**     | `convertRAGToRoleTone(rag, npcId)`    | 將 RAG 知識轉為 NPC 語調    |
| **npcConfigManager**  | `getNpcTemperature(npcId)`            | 取得該 NPC 的溫度設定       |
| **safety.guardrails** | `checkContentSafety(response)`        | 檢查回應內容安全性          |

---

### 🔍 S3 - NPC 對話進行

**系統實現** ：

學生可以自由對話，直到蒐集到所有的關鍵字。

**S3 → S4 轉換條件**：

用戶收集足夠的關鍵字後，點擊進入下一階段，通過前端狀態管理進入 S4：

```typescript
// frontend/app/store/useMissionStore.ts
goToStage: (stage: MissionStage) => {
  set({ currentStage: stage });
  // 同步更新 ChatStore
  const chatStore = useChatStore.getState();
  chatStore.actions.goToStage(stage);
};
```

**評估相關說明**：

- 評估路由 `/api/eval` 接收 `conversationSummary` 但不影響 S3→S4 轉換
- 轉換條件：**用戶主動決定進入 S4**，而非自動觸發

---

### 📜 S4 - 鑰匙配對與故事完成（Archive Repair）

**檔案**：[frontend/app/components/s4/S4_ArchiveRepair.tsx](frontend/app/components/s4/S4_ArchiveRepair.tsx)

**使用者行為**：
將對話中收集到的**關鍵字線索**拖拽到對應的檔案欄位中，完成故事拼圖。此階段主要是讓學生通過拖拽驗證是否真正理解了歷史事實。

**系統實現** (純前端遊戲)：

```typescript
// frontend/app/components/s4/S4_ArchiveRepair.tsx 實際使用
export default function S4_ArchiveRepair() {
  // 從筆記本獲取收集到的線索（來自 S3 對話中用戶收集的關鍵字）
  const { collectedClues } = useNotebookStore();

  // 根據收集到的線索動態生成待填補的欄位
  const clues: ClueCard[] = Object.values(collectedClues).map((clue) => ({
    id: clue.id,
    text: clue.text,
    type: clue.type === "fact" ? "key" : "info",
    source: clue.source,
  }));

  // 拖拽邏輯 - 驗證線索是否符合欄位（前端本地判斷）
  const handleDragEnd = (event: any, clue: ClueCard, fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);

    // 匹配驗證：ID 或文本內容
    const isCorrect =
      clue.id === field.correctClueId || clue.text.includes(field.correctText);

    if (isCorrect) {
      setFieldStates((prev) => ({
        ...prev,
        [fieldId]: { status: "filled", filledBy: clue.id },
      }));
      // 顯示成功反饋
    } else {
      // 顯示錯誤反饋並允許重試
    }
  };

  // 當所有欄位填滿（100%）時，自動進入 S5
  useEffect(() => {
    if (progress === 100 && !autoProgressedRef.current) {
      autoProgressedRef.current = true;
      setTimeout(() => {
        missionActions.goToStage("S5");
      }, 2400); // 顯示完成動畫後進入
    }
  }, [progress]);

  return (
    <div className="archive-repair">
      <DropZone fields={fields} fieldStates={fieldStates} />
      <DraggableClue clues={clues} />
    </div>
  );
}
```

**進度判斷**：

- **前端本地判斷**，無後端評估
- 當所有欄位填滿時自動進入 S5
- **無 LLM 生成故事總結**——故事是由用戶通過拖拽驗證而「完成」的

---

### 📋 S5 - 完成蓋章（Completion Certificate）

**檔案**：[frontend/app/components/s5/S5_ViewpointVerification.tsx](frontend/app/components/s5/S5_ViewpointVerification.tsx)

**使用者行為**：
查看任務完成的典藏卡片，顯示蓋章動畫

**系統實現** (無 LLM)：

```typescript
// S5_ViewpointVerification.tsx - 典藏卡片
const ARCHIVE_INFO = {
  id: "LAW-1905-SIXCODES",
  title: "日本統治下的權利與土地：歷史修復任務",
  summary: "透過本次修復行動，我們成功還原了1905年日本治下的權利與土地狀況。",
  integrity: "100%",
};

// 蓋章動畫特效
<motion.div
  initial={{ scale: 2, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ delay: 0.5, type: "spring" }}
  className="absolute bottom-4 right-4 border-2 border-red-800/60 text-red-800 rounded-full w-24 h-24"
>
  Museum Collection
</motion.div>;
```

**功能**：

- 顯示修復任務的完成卡片
- 播放印章蓋下的彈簧動畫（延遲 0.5 秒後開始）
- 提供「重新開始」和「返回任務大廳」按鈕

**LLM 使用**：無 - S5 是靜態完成頁面，無需 LLM

---

## 📚 學習進度分析

### 1. 任務完成度追蹤

```typescript
// 學生學習狀態監控
const progress = useMissionStore((state) => ({
  currentStage: state.currentStage, // S0-S5 當前階段
  conversationTurns: state.conversationTurns, // 對話輪數
  masteredGoals: state.lastEvalResult?.overall.masteredCount, // 已掌握目標數
  timeSpent: Date.now() - state.startTime, // 學習時間
}));
```

### 2. 對話狀態管理

```typescript
// useChatStore.ts 維護對話上下文
const chatState = useChatStore((state) => ({
  conversationHistory: state.conversationHistory, // 完整對話記錄
  summaries: state.summaries, // 對話摘要
  keyPoints: state.keyPoints, // 關鍵點
}));
```

### 3. 對話摘要與關鍵詞追蹤

```typescript
// S3 對話進行中的即時更新
const updateChatState = (message: string, response: string) => {
  // 更新對話歷史
  useChatStore.setState((state) => ({
    conversationHistory: [
      ...state.conversationHistory,
      { role: "user", content: message },
      { role: "assistant", content: response },
    ],
    summaries: generateSummary(conversationHistory), // 對話摘要
    keyPoints: extractKeyPoints(response), // 自動抽取關鍵詞
  }));
};

// S3 → S4 轉換時記錄對話狀態
const handleTransitionToS4 = () => {
  useMissionStore.setState({
    currentStage: "S4",
    conversationSummary: generateFullSummary(conversationHistory),
    // 注意：無自動評估結果，轉換由用戶主動決定
  });
};
```

**說明**：

- 評估路由 `/api/eval` 存在但**不在 S3→S4 主流程中自動觸發**
- S3→S4 轉換條件：**用戶主動點擊進入下一階段**（通過 `goToStage()` 調用）
- 對話摘要與關鍵詞在 S3 進行中實時更新，用於後續 S4 拖拽驗證

## 🔧 技術架構詳細說明

### 1. 前後端整合架構

```typescript
// vite.config.ts - 前端代理配置
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000", // 後端 API
        changeOrigin: true,
      },
    },
  },
});

// frontend/services/llmClient.ts - API 包裝
export async function sendMessage(data: ChatRequest) {
  const response = await fetch("/api/ollama/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### 2. Ollama 整合架構

```typescript
// backend/services/ollamaClient.ts
export class OllamaClient {
  private baseURL = "http://localhost:11434";
  private model = "llama3.2:3b";

  async chat(messages: ChatMessage[], options?: ChatOptions) {
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    .filter((c) => c.text.includes(query) || c.topic.includes(query))
    .slice(0, limit);

  return scored;
}
```

## 📈 成功指標達成情況

### ✅ 已實現標準

- [x] **任務制學習流程**：S0-S5 完整情境學習
- [x] **LLM 雙過程理論**：System 1/2 分離架構
- [x] **RAG 知識檢索**：歷史知識片段管理
- [x] **安全防護機制**：多層內容過濾與教育引導

### 🟡 部分實現標準

- [~] **歷史任務擴展**：框架完整，後續可增加更多任務

### 📋 後續開發優先級

**P0（立即）**：

1. 完善錯誤處理與邊界情況
2. 添加更多歷史任務

**P1（短期）**：

1. 提升使用者介面設計
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
7. **統一 LLM 架構**：Mistral API (S3 對話) + Ollama (S3-EVAL 評估 + 向量嵌入)
8. **向量化知識檢索**：RAG + 向量嵌入的精準內容檢索

---

## 🤖 LLM 核心模組指南

本系統採用雙引擎設計：**Mistral API 負責 NPC 對話生成**，**Ollama 負責向量嵌入**。

### 1️⃣ **Mistral API 雲端引擎** (S3 NPC 對話生成)

**用途**：實時 NPC 對話生成 + 追問建議

| 模組               | 路徑                                                                                           | 功能                                       | 使用時機              |
| ------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------- |
| **Mistral 客戶端** | [backend/services/mistralClient.ts](backend/services/mistralClient.ts)                         | Mistral API 整合 (mistral-small-latest)    | S3 對話每一輪         |
| **遊戲服務核心**   | [backend/services/gameService.ts](backend/services/gameService.ts)                             | ⭐ 完整對話邏輯 (RAG → Mistral → 安全檢查) | 每個用戶訊息          |
| **安全防護系統**   | [backend/services/prompts/safety.guardrails.ts](backend/services/prompts/safety.guardrails.ts) | 多層內容過濾 + 時代驗證 + 教育引導         | 所有 Mistral 輸出檢查 |

**配置文件**：

- 模型：`mistral-small-latest`（高質量中等模型，適合複雜任務）
- 環境變數：`MISTRAL_API_KEY`（需自行配置）
- Token 限制：~750 tokens per response
- 溫度：每個 NPC 有特定偏好 (0.3-0.7)

**核心流程** (S3 NPC 對話)：

```typescript
使用者訊息 → RAG 檢索 (embeddingService) → 向量搜尋 (simpleVectorDB)
  ↓
組建完整提示詞 (systemPrompt + NPC Persona + RAG 知識 + 對話歷史)
  ↓
調用 Mistral API 生成回應 (thinking + reply + suggestions JSON)
  ↓
品質檢查 + 低溫重試 (如果品質不佳)
  ↓
內容安全檢查 (safety.guardrails) → 語調調整 (ragToneFilter)
  ↓
NPC 回應呈現 (逐字打字效果 + 延遲後顯示追問建議)
```

**實際代碼** (gameService.ts)：

```typescript
// d) 調用 Mistral API 生成完整回應
const tempPrimary = getNpcTemperature(npcId, 0.7);
let primaryResponse = await chatWithMistral(messages, {
  temperature: tempPrimary,
  maxTokens: 750,
});

// e) 品質檢查 + 回退策略
const qualityCheck = checkResponseQuality(primaryResponse, npcId);
if (qualityCheck.hasIssues) {
  // 低溫重試 (temperature: 0.3)
  primaryResponse = await chatWithMistral(messages, {
    temperature: 0.3,
    maxTokens: 750,
  });
}

// f) 解析 Mistral 回應結構
const parsed = parseResponse(primaryResponse);
// 提取：thinking、reply、suggestions (JSON)
```

---

### 2️⃣ **Ollama 本機引擎** (向量嵌入 )

**用途**：向量嵌入（RAG 檢索）

| 模組             | 路徑                                                                         | 功能                                  | 使用時機             |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------------------- | -------------------- |
| **嵌入向量服務** | [backend/services/embeddingService.ts](backend/services/embeddingService.ts) | 生成文本 embedding (nomic-embed-text) | RAG 初始化、向量檢索 |

**配置文件**：

- 模型：`llama3.2:3b`（3B 參數輕量級模型，適合本機運行）
- 地址：`http://localhost:11434`（默認）
- **重要說明**：Ollama **不用於對話生成**，僅用於向量嵌入和可選評估

**核心流程** (向量化檢索)：

```
使用者訊息 → 生成 embedding (embeddingService 呼叫 Ollama) → 向量相似度搜尋 (simpleVectorDB)
  ↓
檢索相關知識 (RAG) → 組建提示詞 (promptService)
  ↓
發送至 Mistral API → NPC 回應
```

**進度評估說明**：

- `evaluateProgress()` 函數存在並使用 Ollama
- **但 S3 → S4 轉換不依賴評估結果**
- 轉換條件：**用戶主動進入下一階段**（前端狀態管理）
- 評估端點仍可手動調用，但目前未整合至主流程

**對話生成引擎**：

- ⭐ **Mistral API**：所有 NPC 對話回應由 mistral-small-latest 生成

---

### 3️⃣ **NPC Persona 與提示詞工程**

| 模組             | 路徑                                                                                    | 功能                       | 說明                                  |
| ---------------- | --------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------- |
| **NPC 配置管理** | [backend/services/npcConfigManager.ts](backend/services/npcConfigManager.ts)            | 角色屬性、知識域、轉接規則 | 三個 NPC：學生、警察、測量員          |
| **Persona 快取** | [backend/services/personaCache.ts](backend/services/personaCache.ts)                    | Persona 文件加載與快取     | 懶加載策略，5 分鐘 TTL                |
| **提示詞工程**   | [backend/services/promptService.ts](backend/services/promptService.ts)                  | 話題偵測、追問建議生成     | 三個詢問層級：fact, conflict, empathy |
| **智能提示庫**   | [backend/services/promptService.ts](backend/services/promptService.ts) - PROMPT_LIBRARY | NPC 特定提示詞庫           | 基於話題自動選擇合適提示              |

**Persona 文件位置**：

```
backend/data/persona/
├── NPC_JP01_Student.md        ⭐ 小清（公學校學生）
├── NPC_JP02_Police.md         ⭐ 佐藤敬一（日本警察）
└── NPC_JP03_LandSurveyor.md   ⭐ 山本勘助（土地測量員）
```

**Persona 文件格式**：

```markdown
# [角色名]

## 基本資訊

- 名字：...
- 職業：...
- 時代背景：...
- 性格特徵：...

## 知識域限制

### 能回答的話題

- ...

### 不能回答的話題

- ...

## 語調與風格

- 語言風格：...
- 禁用詞彙：...
- 回應長度：...

## 對話規則

- 角色一致性要求
- 自我介紹規則
- 轉接條件
- ...

## 代表故事 / 背景場景

[具體場景描述]
```

---

### 4️⃣ **任務知識庫**

| 模組            | 路徑                                                                                                       | 功能                            | 說明                                     |
| --------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------- |
| **任務資料**    | [backend/data/missions/mission.ts](backend/data/missions/mission.ts)                                       | E2 任務的 chunks、NPCs、quizzes | RAG 的知識來源                           |
| **知識庫 JSON** | [backend/data/knowledge/knowledge_base.json](backend/data/knowledge/knowledge_base.json)                   | 結構化知識文檔                  | 包含 id, content, category, npc_role_tag |
| **向量快取**    | [backend/data/knowledge/knowledge_vectors_cache.json](backend/data/knowledge/knowledge_vectors_cache.json) | 預計算的 embeddings             | 加速啟動，支持增量更新                   |
| **任務預載入**  | [backend/services/missionLoader.ts](backend/services/missionLoader.ts)                                     | 任務數據緩存管理                | 在伺服器啟動時執行                       |

**知識庫 JSON 結構**：

```json
{
  "knowledge": [
    {
      "id": "kb_001",
      "content": "1905年的臺南，日本殖民統治已進入第十年...",
      "category": "historical_context",
      "knowledge_tag": "日治初期背景",
      "npc_role_tag": ["student", "police_officer", "land_surveyor"]
    },
    ...
  ]
}
```

---

### 5️⃣ **遊戲邏輯與 Session 管理**

| 模組             | 路徑                                                               | 功能                                | 說明                   |
| ---------------- | ------------------------------------------------------------------ | ----------------------------------- | ---------------------- |
| **遊戲服務核心** | [backend/services/gameService.ts](backend/services/gameService.ts) | 完整的 RAG + NPC 對話邏輯           | 整合所有 LLM 模組      |
| **遊戲路由**     | [backend/routes/game.ts](backend/routes/game.ts)                   | `/api/game/start`, `/api/game/chat` | Session 管理、對話路由 |
| **評估路由**     | [backend/routes/eval.ts](backend/routes/eval.ts)                   | `/api/eval`                         | S3-EVAL 觸發點         |

**gameService.ts 核心函數**：

- `handleGameChat()`：完整對話邏輯 (RAG → LLM → 安全檢查)
- `filterConversationHistory()`：歷史過濾 (移除自我介紹、教學口吻)
- `summarizeConversation()`：對話摘要 (用於評估、S4 總結)
- `detectKeyPoints()`：關鍵點偵測 (追蹤學習進度)

---

### 6️⃣ **前端 LLM 通訊**

| 模組                | 路徑                                                                           | 功能              | 說明                        |
| ------------------- | ------------------------------------------------------------------------------ | ----------------- | --------------------------- |
| **前端 LLM 客戶端** | [frontend/app/services/llmClient.ts](frontend/app/services/llmClient.ts)       | 後端 API 包裝     | streamChatViaBackend() 函數 |
| **RAG 前端**        | [frontend/app/services/rag.ts](frontend/app/services/rag.ts)                   | 前端 RAG 輔助服務 | 可選的本地 RAG 備用方案     |
| **任務狀態管理**    | [frontend/app/store/useMissionStore.ts](frontend/app/store/useMissionStore.ts) | S0-S5 狀態跟蹤    | 評估結果、進度記錄          |

**streamChatViaBackend() 工作流**：

```typescript
1. 獲取或創建 game session
2. 調用 /api/game/chat (包含 sessionId + message)
3. 檢查 keyPointAchieved (學習進度)
4. 提取 suggestions (LLM 生成的追問)
5. 逐字顯示回應 + 延遲後顯示追問
```

---

### 🔧 環境變數與配置

**後端 .env 必需變數**：

```bash
# Ollama 配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_EMBED_MODEL=nomic-embed-text:latest

# Mistral API（需自行申請）
MISTRAL_API_KEY=your_api_key_here

# 伺服器設定
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Persona 路由配置
PERSONA_ROUTE_ENABLED=true
PERSONA_ROUTE_REQUIRE_TOKEN=false
```

**前端 vite.config.ts 代理配置**：

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:4000',  // 指向後端
      changeOrigin: true,
    },
  },
}
```

---

### 📊 LLM 資源統計

| 項目             | 值               | 說明                       |
| ---------------- | ---------------- | -------------------------- |
| **對話生成引擎** | Mistral API      | ⭐ 主要 LLM（S3 對話生成） |
| **平均對話延遲** | 1-2 秒           | Mistral API 調用           |
| **Ollama 用途**  | 向量嵌入、RAG    | 用於知識檢索               |
| **向量模型**     | nomic-embed-text | RAG 知識檢索用             |
| **知識庫條目**   | ~100+            | RAG 文檔數量               |
| **NPC 角色**     | 3 個             | 小清、佐藤、山本           |
| **提示詞庫**     | 100+             | 各 NPC 特定提示            |

---

### 🧪 測試 LLM 模組

**測試 NPC 對話端點**：

```bash
# 建立遊戲 session
curl -X POST http://localhost:4000/api/game/start \
  -H "Content-Type: application/json" \
  -d '{
    "npcId": "student",
    "missionId": "E2"
  }'
# 返回: { "sessionId": "xxx", "initialContext": "..." }

# 發送對話訊息
curl -X POST http://localhost:4000/api/game/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "xxx",
    "message": "日本人為什麼要調查土地？",
    "conversationHistory": [],
    "summaries": [],
    "keyPoints": []
  }'
# 返回: { "reply": "...", "suggestions": [...], "thinking": "..." }
```

**測試向量資料庫初始化**：

```bash
curl http://localhost:4000/api/health
# 查看 knowledgeBase 統計資訊
```

**測試進度評估** (S3-EVAL)：

```bash
curl -X POST http://localhost:4000/api/eval \
  -H "Content-Type: application/json" \
  -d '{
    "missionId": "E2",
    "conversationSummary": "學生已詢問磅重問題並理解殖民經濟分工..."
  }'
```

---

## � 擴展新歷史任務（15 分鐘快速指南）

### 步驟一：建立任務資料結構

編輯檔案：[backend/data/missions/mission.ts](backend/data/missions/mission.ts)

```typescript
// 添加新任務的 chunks、NPCs、quizzes

export const e3Chunks = [
  {
    id: "e3-001",
    missionId: "E3",
    topic: "明清替代背景",
    type: "core_fact",
    text: "明末政治腐敗，農民起義频繁...",
    keywords: ["明朝", "清朝", "朝代"],
  },
];

export const e3Npcs = [
  {
    id: "ming-scholar",
    name: "王夫之",
    role: "明末士大夫",
    persona: "你是明末的一位士大夫...",
    knowledgeScope: ["科舉制度", "政治改革", "文化传統"],
  },
];

export const e3Quizzes = [
  {
    id: "e3-q1",
    question: "明末最主要的政治問題是？",
    options: ["農民起義", "外族入侵", "宗教衝突", "經濟崩潰"],
    correctAnswer: 0,
    explanation: "明末農民起義頻繁，最終導致明朝覆滅...",
  },
];
```

### 步驟二：創建 NPC Persona 文件

新增檔案：[backend/data/persona/NPC_CH01_Scholar.md](backend/data/persona/NPC_CH01_Scholar.md)

```markdown
# 王夫之（明末士大夫）

## 基本背景

- 年代：1619-1692
- 身份：明末清初著名思想家
- 地點：湖南衡陽
- 特色：經歷明清更替，視野開闊

## 性格與語調

- 堅守傳統但能客觀分析
- 語言風格：文雅、沉著、帶有思考性
- 回應長度：中等（150-200 字）

## 知識域

### 能回答

- 科舉制度、士大夫身份
- 明朝政治腐敗原因
- 文化傳統的重要性

### 不能回答

- 現代政治概念
- 技術細節
- 預測未來

## 禁用詞彙

避免：民主、人權、自由、現代化、科技等
```

### 步驟三：在 NPC 配置中註冊

編輯：[backend/services/npcConfigManager.ts](backend/services/npcConfigManager.ts)

```typescript
export const NPC_GAME_CONFIGS: Record<string, NPCGameConfig> = {
  // 新增配置
  ming_scholar: {
    id: "ming_scholar",
    name: "王夫之",
    role: "士大夫",
    period: "1600-1700",
    language: {
      tone: "scholarly",
      maxResponseLength: 200,
      preferredTemperature: 0.6,
      forbiddenPhrases: ["民主", "人權", "自由", "電腦", "手機"],
    },
    knowledge: {
      canAnswer: ["科舉制度", "明朝政治", "文化傳統"],
      cannotAnswer: ["現代政治", "技術細節"],
      knowledgeSource: "philosophical",
    },
    // ... 其他配置
  },
};
```

### 步驟四：更新知識庫

編輯：[backend/data/knowledge/knowledge_base.json](backend/data/knowledge/knowledge_base.json)

```json
{
  "knowledge": [
    {
      "id": "ch_001",
      "content": "明末農民起義的背景與影響...",
      "category": "political_event",
      "knowledge_tag": "明朝衰亡",
      "npc_role_tag": ["ming_scholar"]
    }
  ]
}
```

### 步驟五：測試

```bash
cd backend
npm run dev

# 檢查是否成功載入
# ✅ Mission data loaded: X NPCs, Y chunks, Z quizzes
# ✅ Vector database initialized
```

---

## 📈 成功指標達成情況

### ✅ 已實現標準

- [x] **任務制學習流程**：S0-S5 完整情境學習
- [x] **LLM 雙過程理論**：Ollama (System 1) + Mistral (System 2)
- [x] **RAG 知識檢索**：向量嵌入 + 相似度搜尋
- [x] **安全防護機制**：多層內容過濾與教育引導
- [x] **進度評估系統**：自動化學習進度追蹤
- [x] **NPC 角色扮演**：三個獨立角色的知識域限制
- [x] **智能提示詞**：話題偵測 + 動態提示生成

### 🟡 部分實現標準

- [~] **歷史任務擴展**：框架完整，已有 E2，可快速添加 E3+
- [~] **學生進度追蹤**：狀態管理完成，UI 呈現待優化
- [~] **學習數據分析**：基礎機制完成，深度分析待開發

### 🔮 未來發展方向（優先級排序）

**P0（立即）**：

1. 完善錯誤處理與邊界情況
2. 添加更多歷史任務（E3, E4...）
3. 優化 Ollama 推理速度（量化模型、批次優化）

**P1（短期）**：

1. 提升前端 UI/UX 設計
2. 添加數據持久化（學習歷程記錄到資料庫）
3. 完善可讀性分析算法
4. 實現教師管理後台

**P2（長期）**：

1. 多語言支援（英文、日文）
2. 語音對話功能（語音輸入/輸出）
3. 移動端優化
4. 多人協作學習模式
5. 遊戲化成就系統

---

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
- [NPC 回答規則](docs/NPC回答規則.md)
- [任務與對話機制](docs/任務與對話機制說明.md)
- [對話系統架構](docs/對話系統架構.md)

```

```
