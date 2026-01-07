# 歷史任務制 AI 學習系統

## 專案總覽

本系統是一個基於大型語言模型的歷史教育平台,採用任務制學習模式（S0→S5）,透過多視角 NPC 對話引導學生探索歷史情境。系統結合 RAG 檢索技術與智能提示詞工程,提供受控且具教育意義的歷史學習體驗。

### 核心特性

- **任務制學習流程**：S0（任務選單）→ S1（背景故事）→ S2（選擇 NPC）→ S3（對話探索）→ S4（鑰匙配對）→ S5（完成確認）
- **多視角歷史探索**：三個 NPC 角色提供不同階層的歷史視角
- **RAG 增強對話**：向量化知識檢索確保 NPC 回應的歷史準確性
- **受控角色扮演**：嚴格的 Persona 約束與知識域限制
- **安全防護機制**：多層內容過濾與教育性引導

### 技術架構摘要

- **前端**：React 18 + TypeScript + Zustand + Tailwind CSS
- **後端**：Node.js + Express + TypeScript
- **LLM 引擎**：
  - Mistral API（mistral-small-latest）：NPC 對話生成
  - Ollama（nomic-embed-text）：向量嵌入
- **資料層**：記憶體向量資料庫 + JSON 知識庫

---

## 快速開始

### 環境需求

```bash
Node.js >= 18.0.0
npm >= 8.0.0
Ollama >= 0.1.0
Mistral API Key（必需）
```

### 安裝與啟動

#### 1. 安裝 Ollama 與模型

```powershell
# 下載並安裝 Ollama（https://ollama.ai/）

# 拉取向量嵌入模型
ollama pull nomic-embed-text:latest
```

#### 2. 配置環境變數

在 `backend` 目錄建立 `.env` 檔案：

```bash
# Ollama 配置（向量嵌入）
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBED_MODEL=nomic-embed-text:latest

# Mistral API（NPC 對話生成，必需）
MISTRAL_API_KEY=your_api_key_here

# 伺服器設定
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

#### 3. 啟動後端服務

```powershell
cd backend
npm install
npm run dev
# 預期輸出：
#  Vector database initialized
#  Mission data loaded
#  Server running on port 4000
```

#### 4. 啟動前端應用

```powershell
# 回到專案根目錄
cd ..
npm install
npm run dev
# 前端運行於 http://localhost:3000
```

#### 5. 驗證系統狀態

```bash
curl http://localhost:4000/api/health
# 應返回：{ "status": "ok", "knowledgeBase": {...} }
```

---

## 系統整體架構概念

### 前後端分離架構

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │ UI 組件層  │  │ 狀態管理層  │  │  llmClient 服務  │    │
│  │  (S0-S5)   │  │  (Zustand)  │  │   (API 包裝)     │    │
│  └────────────┘  └─────────────┘  └──────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP /api/* (Vite Proxy)
┌──────────────────────────┴──────────────────────────────────┐
│                    Backend (Express + TS)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              routes/game.ts (API Layer)              │  │
│  └─────────────────────────┬────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────┴────────────────────────────┐  │
│  │         services/gameService.ts (核心邏輯)          │  │
│  │  1. RAG 檢索 → 2. 提示詞組裝 → 3. LLM 呼叫          │  │
│  └─────┬────────────────────────────────────┬───────────┘  │
│        │                                    │                │
│  ┌─────┴─────────┐                   ┌─────┴──────────┐    │
│  │ Vector Search │                   │ Mistral Client │    │
│  │  (embeddings) │                   │  (chat API)    │    │
│  └───────────────┘                   └────────────────┘    │
└─────────────────────────────────────────────────────────────┘
          │                                       │
┌─────────┴─────────┐                   ┌─────────┴──────────┐
│  Ollama Service   │                   │   Mistral API      │
│  (localhost:11434)│                   │   (Cloud Service)  │
└───────────────────┘                   └────────────────────┘
```

### 資料流概覽

**S3 對話流程**：

```
使用者訊息
  ↓
前端 llmClient.streamChatViaBackend()
  ↓
POST /api/game/chat
  ↓
gameService.handleGameChat()
  ├─→ embeddingService.generateEmbedding() → Ollama
  ├─→ simpleVectorDB.searchKnowledge()
  ├─→ personaCache.get() + npcConfigManager
  ├─→ promptService (話題偵測、追問生成)
  ├─→ mistralClient.chatWithMistral() → Mistral API
  └─→ safety.guardrails.checkContentSafety()
  ↓
解析三段式回應：<thinking> <reply> <suggestions>
  ↓
回傳前端 → 逐字顯示 → 延遲後顯示追問建議
```

---

## 任務制學習流程（S0–S5）

### S0：任務選單

**目的**：學生選擇歷史情境  
**實現**：前端靜態資料，無 LLM 介入  
**檔案**：[frontend/app/components/MissionList.tsx](frontend/app/components/MissionList.tsx)

選擇後進入 `useMissionStore` 記錄 `currentMissionId`，轉至 S1。

---

### S1：任務開場故事

**目的**：呈現歷史背景與學習目標  
**實現**：顯示預定義任務描述與填空遊戲  
**檔案**：[frontend/app/components/s1/S1_FileDecryption.tsx](frontend/app/components/s1/S1_FileDecryption.tsx)

無 LLM 生成內容，資料來自 `frontend/app/data/missions/`。

---

### S2：選擇對話角色

**目的**：學生選擇要先詢問的 NPC  
**實現**：顯示 NPC 卡片（姓名、職業、視角）  
**檔案**：[frontend/app/components/s2/S2_NpcSelection.tsx](frontend/app/components/s2/S2_NpcSelection.tsx)

可用 NPC：

- 小清（公學校學生）：基層民眾視角
- 佐藤敬一（警察）：日本官員視角
- 山本勘助（土地測量員）：技術官僚視角

NPC 配置定義於 [backend/services/npcConfigManager.ts](backend/services/npcConfigManager.ts)。

---

### S3：NPC 對話探索

**目的**：透過對話收集關鍵字線索  
**實現**：即時 LLM 驅動對話 + RAG 增強  
**檔案**：

- 前端：[frontend/app/components/new_S3.tsx](frontend/app/components/new_S3.tsx)
- 後端：[backend/services/gameService.ts](backend/services/gameService.ts)

**關鍵機制**：

- 每則使用者訊息觸發 RAG 檢索
- Mistral API 生成 NPC 回應
- 系統自動提取關鍵字並加入筆記本
- 每次回應附帶三個追問建議（fact / conflict / empathy）

**轉換條件（S3 → S4）**：

- 學生收集到所有必需關鍵字
- 學生主動點擊「進入下一階段」
- **非自動觸發**，允許學生在完成後繼續對話

詳見下方 **LLM 與 NPC 對話核心架構** 章節。

---

### S4：鑰匙配對與故事完成

**目的**：驗證學生是否理解歷史事實  
**實現**：拖拽關鍵字至對應欄位（純前端邏輯）  
**檔案**：[frontend/app/components/s4/S4_ArchiveRepair.tsx](frontend/app/components/s4/S4_ArchiveRepair.tsx)

當所有欄位填滿時自動進入 S5，無 LLM 介入。

---

### S5：完成確認

**目的**：顯示任務完成狀態  
**實現**：靜態卡片 + 蓋章動畫  
**檔案**：[frontend/app/components/s5/S5_ViewpointVerification.tsx](frontend/app/components/s5/S5_ViewpointVerification.tsx)

無 LLM 生成內容。

---

## LLM 與 NPC 對話核心架構

### LLM 引擎分工

#### Mistral API

**用途**：S3 NPC 即時對話生成  
**模型**：`mistral-small-latest`  
**責任**：

- 生成符合 Persona 的 NPC 回應
- 產出三個追問建議（JSON）
- 內部推理過程（`<thinking>`）

**配置**：

- 溫度：根據 NPC 個性調整（0.3-0.7）
- Token 限制：~750 tokens per response
- 環境變數：`MISTRAL_API_KEY`（必需）

**重要**：若未設定 API Key，S3 對話功能無法運作。

#### Ollama

**用途**：向量嵌入（RAG 檢索）  
**模型**：`nomic-embed-text:latest`  
**責任**：

- 將查詢文本轉換為向量
- 支援知識庫的相似度搜尋

**不用於**：

- NPC 對話生成
- 任何使用者可見的文本生成

**配置**：

- 地址：`http://localhost:11434`（預設）
- 環境變數：`OLLAMA_BASE_URL`

---

### NPC 對話生成流程

以下為 `gameService.handleGameChat()` 的核心邏輯：

#### 1. 輸入處理

```typescript
interface GameChatRequest {
  sessionId: string;
  npcId: string;
  message: string;
  conversationHistory: MistralChatMessage[];
  summaries: string[];
  keyPoints: string[];
}
```

#### 2. RAG 檢索（向量搜尋）

```typescript
// a. 生成查詢向量
const queryEmbedding = await embeddingService.generateEmbedding(message);

// b. 向量相似度搜尋
const relevantKnowledge = await simpleVectorDB.searchKnowledge(
  queryEmbedding,
  npcId
);
// 返回 3-4 個最相關的知識片段
```

**注意**：實際檢索邏輯（純向量 vs. 混合關鍵字）應以 [backend/services/simpleVectorDB.ts](backend/services/simpleVectorDB.ts) 實作為準。

#### 3. 提示詞組裝

```typescript
// c. 載入 NPC Persona
const persona = await personaCache.get(npcId);
const npcConfig = npcConfigManager.getNpcConfig(npcId);

// d. 建構系統提示詞
const systemPrompt = buildSystemPrompt({
  persona,
  npcConfig,
  ragContext: relevantKnowledge,
  conversationHistory: filteredHistory,
  summaries,
  keyPoints,
  turnCount: conversationHistory.length / 2,
});
```

**filteredHistory**：移除重複自介與教學口吻的歷史訊息。

#### 4. Mistral API 呼叫

```typescript
// e. 組裝訊息陣列
const messages: MistralChatMessage[] = [
  { role: "system", content: systemPrompt },
  ...filteredHistory,
  { role: "user", content: message },
];

// f. 呼叫 Mistral API
const temperature = npcConfig.language.preferredTemperature;
let response = await mistralClient.chatWithMistral(messages, {
  temperature,
  maxTokens: 750,
});
```

#### 5. 品質檢查與低溫重試

```typescript
// g. 檢查回應品質
const qualityCheck = checkResponseQuality(response, npcId);

if (qualityCheck.hasIssues) {
  // 低溫重試（減少創造性，增加穩定性）
  response = await mistralClient.chatWithMistral(messages, {
    temperature: 0.3,
    maxTokens: 750,
  });
}
```

#### 6. 回應解析與安全檢查

```typescript
// h. 解析三段式結構
const parsed = parseResponse(response);
// { thinking: string, reply: string, suggestions: Suggestion[] }

// i. 安全性檢查
const safetyResult = checkContentSafety(parsed.reply);
if (!safetyResult.safe) {
  // 替換為教育性引導訊息
  parsed.reply = safetyResult.educationalRedirect;
}
```

#### 7. 輸出結構

```typescript
return {
  reply: parsed.reply,
  suggestions: parsed.suggestions,
  thinking: parsed.thinking, // 僅供除錯，不顯示給使用者
};
```

---

### NPC 輸出格式規範（三段式結構）

每次 Mistral API 回應必須遵循以下結構：

```
<thinking>
內部推理過程，例如：
- 偵測到學生問及土地調查動機
- 山本角色應強調技術層面，避免政治評論
- 需引導學生理解經濟脈絡
</thinking>

<reply>
這是顯示給學生的 NPC 第一人稱對話。
必須符合 Persona 設定，不得包含旁白或動作描述。
</reply>

<suggestions>
[
  { "type": "fact", "text": "土地調查具體是怎麼進行的？" },
  { "type": "conflict", "text": "這項調查對原住民有什麼影響？" },
  { "type": "empathy", "text": "你在工作中有遇到什麼困難嗎？" }
]
</suggestions>
```

#### `<thinking>` 區塊

- **用途**：內部推理，不顯示給使用者
- **內容**：話題判斷、角色定位、回應策略
- **注意**：這不是穩定的公開 API，僅供系統內部使用

#### `<reply>` 區塊

- **用途**：NPC 第一人稱對話（唯一顯示給使用者的文本）
- **約束**：
  - 必須遵守 Persona 文件中的語調與知識域
  - 禁止使用學術或歷史學家口吻
  - 不得包含旁白（如「他看著你」）
  - 必須使用時代適當的語言
- **長度**：20- 30 字（根據 NPC 設定）

#### `<suggestions>` 區塊

- **用途**：提供三個認知層級的追問建議
- **格式**：JSON 陣列
- **必需性**：每次回應必須包含
- **三個層級**：
  - `fact`：事實性追問（基礎資訊）
  - `conflict`：衝突性追問（多元觀點）
  - `empathy`：同理性追問（個人經驗）
- **生成原則**：
  - 必須基於當前 `<reply>` 內容
  - 不得跨輪重複
  - 應引導學生深化理解

**實作位置**：[backend/services/promptService.ts](backend/services/promptService.ts) 中的 `getSmartPrompts()`

---

### 關鍵模組職責

| 模組                  | 函數                                 | 用途                          |
| --------------------- | ------------------------------------ | ----------------------------- |
| **mistralClient**     | `chatWithMistral()`                  | 呼叫 Mistral API              |
| **embeddingService**  | `generateEmbedding()`                | 生成查詢向量（via Ollama）    |
| **simpleVectorDB**    | `searchKnowledge()`                  | 向量相似度搜尋                |
| **personaCache**      | `get(npcId)`                         | 載入並快取 NPC Persona 文件   |
| **npcConfigManager**  | `getNpcConfig(npcId)`                | 取得 NPC 設定（溫度、禁用詞） |
| **promptService**     | `detectTopic()`, `getSmartPrompts()` | 話題偵測與追問建議生成        |
| **ragToneFilter**     | `convertRAGToRoleTone()`             | 將 RAG 文本轉為角色語調       |
| **safety.guardrails** | `checkContentSafety()`               | 內容安全檢查與教育引導        |

---

## NPC Persona 與提示詞工程

### Persona 文件結構

每個 NPC 由一個 Markdown 文件定義，位於 `backend/data/persona/`：

- [NPC_JP01_Student.md](backend/data/persona/NPC_JP01_Student.md)
- [NPC_JP02_Police.md](backend/data/persona/NPC_JP02_Police.md)
- [NPC_JP03_LandSurveyor.md](backend/data/persona/NPC_JP03_LandSurveyor.md)

**標準格式**：

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
```

### NPC 配置管理

**檔案**：[backend/services/npcConfigManager.ts](backend/services/npcConfigManager.ts)

**核心資料結構**：

```typescript
export interface NPCGameConfig {
  id: string;
  name: string;
  role: string;
  period: string;
  language: {
    tone: string;
    maxResponseLength: number;
    preferredTemperature: number;
    forbiddenPhrases: string[];
  };
  knowledge: {
    canAnswer: string[];
    cannotAnswer: string[];
    knowledgeSource: string;
  };
  persona: {
    personaFile: string;
    traits: string[];
  };
}
```

### 智能提示詞庫

**檔案**：[backend/services/promptService.ts](backend/services/promptService.ts)

**功能**：

1. **話題偵測**：`detectTopic(message, npcId)`

   - 辨識 11 種對話話題（政治、經濟、文化等）
   - 根據 NPC 專長調整回應策略

2. **追問建議生成**：`getSmartPrompts(npcId, topic, lastReply)`
   - 基於當前對話內容
   - 生成三層級提示（fact / conflict / empathy）
   - 避免跨輪重複

**PROMPT_LIBRARY 結構**：

```typescript
const PROMPT_LIBRARY = {
  student: {
    education: {
      fact: ["公學校和國語學校有什麼不同？", ...],
      conflict: ["學習日語對你的生活有什麼影響？", ...],
      empathy: ["你會想念以前的學校嗎？", ...]
    },
    ...
  },
  ...
};
```

---

## 任務資料結構

### 任務定義

**檔案**：[backend/data/missions/mission.ts](backend/data/missions/mission.ts)

**核心元素**：

```typescript
export interface Mission {
  id: string;
  title: string;
  period: string;
  difficulty: string;
  chunks: Chunk[]; // RAG 知識片段
  npcs: NPC[]; // 可用 NPC 列表
  quizzes: Quiz[]; // S5 測驗題目
  learningGoals: string[]; // 學習目標
}
```

### 知識庫

**檔案**：[backend/data/knowledge/knowledge_base.json](backend/data/knowledge/knowledge_base.json)

**格式**：

```json
{
  "knowledge": [
    {
      "id": "kb_001",
      "content": "1905年的臺南，日本殖民統治已進入第十年...",
      "category": "historical_context",
      "knowledge_tag": "日治初期背景",
      "npc_role_tag": ["student", "police_officer", "land_surveyor"]
    }
  ]
}
```

### 向量快取

**檔案**：[backend/data/knowledge/knowledge_vectors_cache.json](backend/data/knowledge/knowledge_vectors_cache.json)

**用途**：

- 預計算的向量嵌入
- 加速系統啟動
- 支援增量更新

**結構**：

```json
{
  "kb_001": [0.123, -0.456, 0.789, ...],
  "kb_002": [...]
}
```

---

## 安全防護

**檔案**：[backend/services/prompts/safety.guardrails.ts](backend/services/prompts/safety.guardrails.ts)

### 多層防護機制

#### 1. 關鍵字檢查

檢測敏感詞彙（政治、暴力、不當內容）並攔截。

#### 2. 時代驗證

確保 NPC 回應不包含時代錯誤（如現代科技、概念）。

#### 3. 教育性重導向

將不當問題轉化為教學機會：

```typescript
if (containsSensitiveContent(userMessage)) {
  return {
    safe: false,
    educationalRedirect:
      "這個問題涉及複雜的歷史脈絡，讓我們從另一個角度來理解...",
  };
}
```

#### 4. 角色一致性檢查

驗證回應是否符合 NPC Persona 設定。

---

## 已實現功能與 Roadmap

### 已實現

- 完整 S0-S5 任務制流程
- Mistral API 驅動的 NPC 對話（三段式輸出）
- Ollama 向量嵌入與 RAG 檢索
- 三個歷史視角 NPC（E2 任務）
- Persona 約束與知識域限制
- 多層安全防護機制
- 智能追問建議生成（fact / conflict / empathy）
- 前後端狀態管理（Zustand）
- 對話摘要與關鍵字追蹤

### 📋 未來功能（依優先級）

#### P0（立即）

- 完善錯誤處理與邊界情況
- 新增更多歷史任務

#### P1（短期）

- 學習歷程持久化（資料庫）
- 使用者帳號系統
- 任務進度追蹤與回顧

#### P2（長期）

- 多語言支援
- 語音對話功能
- 移動端優化
- 多人協作模式
- 多 npc 同時對話功能

---

## 附錄

### 重要檔案索引

#### 前端核心

| 檔案                                                                           | 用途             |
| ------------------------------------------------------------------------------ | ---------------- |
| [frontend/app/AppMain.tsx](frontend/app/AppMain.tsx)                           | S0-S5 主應用入口 |
| [frontend/app/services/llmClient.ts](frontend/app/services/llmClient.ts)       | 後端 API 包裝    |
| [frontend/app/store/useMissionStore.ts](frontend/app/store/useMissionStore.ts) | 任務流程狀態管理 |
| [frontend/app/store/useChatStore.ts](frontend/app/store/useChatStore.ts)       | 對話狀態管理     |

#### 後端核心

| 檔案                                                                                           | 用途                 |
| ---------------------------------------------------------------------------------------------- | -------------------- |
| [backend/index.ts](backend/index.ts)                                                           | 應用入口與初始化     |
| [backend/services/gameService.ts](backend/services/gameService.ts)                             | ⭐ NPC 對話核心邏輯  |
| [backend/services/mistralClient.ts](backend/services/mistralClient.ts)                         | Mistral API 整合     |
| [backend/services/embeddingService.ts](backend/services/embeddingService.ts)                   | Ollama 向量嵌入      |
| [backend/services/simpleVectorDB.ts](backend/services/simpleVectorDB.ts)                       | 向量資料庫與搜尋     |
| [backend/services/personaCache.ts](backend/services/personaCache.ts)                           | NPC Persona 快取管理 |
| [backend/services/npcConfigManager.ts](backend/services/npcConfigManager.ts)                   | NPC 配置管理         |
| [backend/services/promptService.ts](backend/services/promptService.ts)                         | 智能提示詞工程       |
| [backend/services/prompts/safety.guardrails.ts](backend/services/prompts/safety.guardrails.ts) | 安全防護機制         |

#### 資料與配置

| 檔案                                                                                     | 用途             |
| ---------------------------------------------------------------------------------------- | ---------------- |
| [backend/data/missions/mission.ts](backend/data/missions/mission.ts)                     | 任務資料定義     |
| [backend/data/knowledge/knowledge_base.json](backend/data/knowledge/knowledge_base.json) | 知識庫 JSON      |
| [backend/data/persona/](backend/data/persona/)                                           | NPC Persona 文件 |

### 新增歷史任務快速指南

**前置條件**：熟悉現有 E2 任務結構

**步驟**：

1. 編輯 [backend/data/missions/mission.ts](backend/data/missions/mission.ts)，新增 `e3Chunks`, `e3Npcs`, `e3Quizzes`
2. 在 [backend/data/persona/](backend/data/persona/) 建立新 NPC Persona 文件
3. 在 [backend/services/npcConfigManager.ts](backend/services/npcConfigManager.ts) 註冊 NPC 配置
4. 更新 [backend/data/knowledge/knowledge_base.json](backend/data/knowledge/knowledge_base.json)
5. 重啟後端服務，向量資料庫會自動重建

**預估時間**：15-20 分鐘

---

## 相關文檔

- [後端 API 詳細文檔](backend/README.md)
- [NPC 回答規則](docs/NPC回答規則.md)
- [任務與對話機制](docs/任務與對話機制說明.md)
- [對話系統架構](docs/對話系統架構.md)
