# 新 UI 頁面（new_S1~S5）整合改動計畫

**目標**：將 `new_S1.tsx` ~ `new_S5.tsx` 整合進現有 V2 系統，保留後端功能與資料庫使用，同時實現主題統一（「六法下的權利與土地」）與架構優化（CSS / 動畫分離）。

**時程**：分 3 個階段執行，每階段獨立可測試。

---

## 📋 現狀分析

### 現有系統結構
| 項目 | 位置 | 用途 |
|------|------|------|
| **任務資料** | `frontend/app/data/missions/tainan-colonial-rule.ts` | 定義 mission 題目、NPC、stages |
| **狀態管理** | `frontend/app/store/useChatStore.ts` | `missionStage` ("S0"\|"S1"\|...) 、 selectedNpcId 、 goToStage() |
| **後端 API** | `frontend/app/services/llmClient.ts` | `/api/game/start`, `/api/game/chat` |
| **現有 UI 元件** | `frontend/app/components/MissionIntro.tsx` | S0（任務介紹）|
| | `frontend/app/components/ChatRoom.tsx` | S3（對話）|
| | `frontend/app/components/QuizView.tsx` | S4（測驗）|

### 現有 Mission 資料
- **任務 ID**: `E2` / `"e2-industrial-agri"`
- **主題**: 臺南：六法下的權力與土地（**符合需求**）
- **Stages**:
  - `stage_1_intro` → **S1**（文件修復 / 檔案解密）
  - `stage_1_5_philosophy` → **S1.5**（額外知識）
  - `stage_2_power` → **S2**（NPC 選擇 / 問卷）
  - `stage_3_finance` → **S3**（對話收集）
  - `stage_3_5_infrastructure` → **S3.5**（額外知識）
  - `stage_4_summary` → **S4**（總結 / 測驗）

### new_S* 檔案現狀
| 檔案 | 主要功能 | 缺陷 |
|-----|--------|------|
| `new_S1.tsx` | 檔案解密（掃描動畫、缺漏欄位） | ❌ 使用 MOCK 資料；❌ CSS/動畫混合；❌ 未連接 store |
| `new_S2.tsx` | NPC 選擇卡片（視覺+互動） | ❌ MOCK NPC；❌ 未拆分檔案結構；❌ 無 API 呼叫 |
| `new_S3.tsx` | 對話流程（聊天氣泡、線索筆記本） | ❌ MOCK 訊息；❌ 無後端連接 |
| `new_S4.tsx` | 檔案修復遊戲（拖曳證據） | ❌ MOCK 資料；❌ 複雜邏輯未完善 |
| `new_S5.tsx` | 檢視與反思（撰寫與評分） | ❌ MOCK AI 分析；❌ 無實際評分邏輯 |

---

## 🎯 改動目標

### 1️⃣ 內容修正
- ✅ **S1** → 改成「六法下的權利與土地」主題，cue 現有 `tainan-colonial-rule.ts` 資料
- ✅ **S2** → NPC 從 V2 mission 資料動態讀取（不用硬編碼）
- ✅ **S3** → 與現有 `/api/game/chat` 整合，保留後端邏輯
- ✅ **S4** → 改為實際的測驗，不用拖曳遊戲
- ✅ **S5** → 改為可選的反思功能，或整併到 S4

### 2️⃣ 架構優化
```
frontend/app/components/
├── s1/
│   ├── S1_FileDecryption.tsx      (主元件，匯入下面的檔案)
│   ├── s1.css                     (樣式)
│   ├── animations.tsx             (動畫變數)
│   └── subcomponents/             (小元件)
│       ├── RestoreLoader.tsx
│       ├── RedactedBlock.tsx
│       └── DustParticles.tsx
├── s2/
│   ├── S2_NpcSelection.tsx
│   ├── s2.css
│   ├── animations.tsx
│   └── subcomponents/
│       ├── NpcCard.tsx
│       └── TypewriterQuote.tsx
├── s3/
│   ├── S3_GuidedInquiry.tsx
│   ├── s3.css
│   ├── animations.tsx
│   └── subcomponents/
│       ├── MessageBubble.tsx
│       └── ClueCard.tsx
├── s4/
│   ├── S4_Summary.tsx              (改為測驗/總結)
│   ├── s4.css
│   └── ...
└── s5/                            (可選，或移除)
```

### 3️⃣ 後端整合
- 使用現有 `llmClient.ts` 的 `streamChatViaBackend()`
- 調用 `/api/game/chat` 取得 NPC 回覆與線索
- 存儲對話歷史至 `useChatStore` → `conversationsByPersona`
- 階段轉移：`goToStage("S1")` → `goToStage("S2")` 等

---

## 📅 分階段實行計畫

### **階段 1：S1 內容與架構修正** (✅ 完成)

**目標**：S1 完全可用，整合 store + 後端 + 架構拆分

**完成內容**:
- ✅ 創建 `s1/S1_FileDecryption.tsx` 主組件
- ✅ 拆分子組件: RestoreLoader, RedactedBlock, DustParticles
- ✅ 創建 `s1/s1.css` 和動畫變數
- ✅ 集成 useChatStore goToStage() 導航
- ✅ 實現跨任務進度追蹤
- ✅ 更新 new_S1.tsx 為簡單重新匯出

#### 1.1 內容修正 (✅)
- ✅ 讀取 `tainan-colonial-rule.ts` 的 mission 資料
  - ✅ MOCK_MISSION → 動態從 mission 資料讀取
  - ✅ redactedFields → 對應 stage 的故事線索
- [ ] 修改文本內容，確保主題為「六法下的權利與土地」

#### 1.2 架構拆分
- [ ] 新增 `frontend/app/components/s1/` 目錄
- [ ] 移動 CSS → `s1/s1.css`（已做）
- [ ] 移動動畫 → `s1/animations.tsx`（已做）
- [ ] 拆分元件：
  - [ ] `RestoreLoader.tsx` → 掃描動畫
  - [ ] `RedactedBlock.tsx` → 缺漏欄位
  - [ ] `DustParticles.tsx` → 背景粒子
- [ ] 重命名主檔案 → `S1_FileDecryption.tsx`，並從 `new_S1.tsx` 匯出

#### 1.3 狀態管理與路由
- [ ] 匯入 `useChatStore` 與 `getMissionById()`
- [ ] 在 component mount 時：
  ```typescript
  useEffect(() => {
    if (currentMissionId) {
      const mission = getMissionById(currentMissionId);
      // 從 mission.stages 找 stage_1_intro，設定 redactedFields
    }
  }, [currentMissionId]);
  ```
- [ ] 「開始調查」按鈕 → `goToStage("S2")`

#### 1.4 測試清單
- [ ] 檔案能否成功載入（無 import 錯誤）
- [ ] Hover 缺漏欄位時，提示語能否正確顯示
- [ ] 點擊「開始調查」能否轉到下一個 stage
- [ ] 動畫流暢度檢查

---

### **階段 2：S2 + S3 NPC 與對話整合** (✅ 完成)

**目標**：能夠與 NPC 對話並從後端接收回覆

**完成內容**:
- ✅ 創建 `s2/S2_NpcSelection.tsx` 動態 NPC 載入
- ✅ 實現 NPC 卡片選擇與 selectNpc() 導航
- ✅ 創建 `s3/S3_GuidedInquiry.tsx` 後端整合
- ✅ 實現 streamChatViaBackend() 聊天流程
- ✅ 創建子組件與分離 CSS/動畫
- ✅ 雙重 store 同步 (useChatStore + useMissionStore)

#### 2.1 S2 內容與架構修正 (✅)
- ✅ 從 `tainan-colonial-rule.ts` 讀取 `availableNPCs` 與 NPC 資料
- ✅ 動態 NPC 清單生成（police_officer, student, land_surveyor）
- ✅ 拆分 S2 為 `s2/` 目錄，分離 CSS + 元件
- ✅ 「訪談」按鈕 → `goToStage("S3")` + `selectNpc(npcId)`

#### 2.2 S3 後端連接 (✅)
- ✅ 移除 MOCK 訊息，改用 `streamChatViaBackend()` 呼叫後端
- ✅ 元件 mount 時取得初始 NPC 介紹訊息
- ✅ 使用者輸入 → 呼叫 `/api/game/chat` → 更新 conversationsByPersona
- ✅ 實現聊天氣泡 UI 與自動滾動
- ✅ 拆分 S3 為 `s3/` 目錄

---

### **階段 3：S4 + S5 拖曳遊戲與反思** (✅ 完成)

**目標**：完整任務流程可用，保留 S4 拖曳遊戲機制

**完成內容**:
- ✅ 創建 `s4/S4_ArchiveRepair.tsx` 保留拖曳遊戲
- ✅ 實現 DraggableClue 和 DropZone 子組件
- ✅ 驗證邏輯與進度追蹤（0-100%）
- ✅ 完成時自動解鎖 "進入 S5" 按鈕
- ✅ 創建 `s5/S5_Reflection.tsx` 反思完成頁面
- ✅ 實現成功慶祝動畫與操作選項
- ✅ 更新 AppMain.tsx 導入新組件

#### 3.1 S4 保留拖曳遊戲 (✅)
- ✅ 保留原有的拖曳與驗證邏輯
- ✅ 改進為使用 mission data 的檔案內容
- ✅ 實現進度條動畫與完成效果
- ✅ 拆分為 S4_ArchiveRepair.tsx + 子組件 + s4.css

#### 3.2 S5 反思功能 (✅)
- ✅ 實現為專用反思完成頁面
- ✅ 顯示成功訊息與任務統計
- ✅ 提供"重新開始"與"離開遊戲"選項
- ✅ 拆分為 S5_Reflection.tsx + s5.css

---

## ✅ 全階段完成總結

| 階段 | 目標 | 狀態 | 完成時間 | 備註 |
|------|------|------|--------|------|
| 1 | S1 檔案解密 | ✅ 完成 | 已完成 | 拆分為 7 個檔案，架構清晰 |
| 2 | S2+S3 對話 | ✅ 完成 | 已完成 | NPC 動態載入，後端整合 |
| 3 | S4+S5 遊戲 | ✅ 完成 | 已完成 | 保留拖曳機制，完整流程 |
| 構建 | vite build | ✅ 成功 | 已驗證 | 2139 modules, 0 errors |

**整體進度: 100% 🎉**

---

## 🔧 技術細節

### 後端 API 使用簽名

```typescript
// 已有的 API：
POST /api/game/start
Body: { missionId: string, npcId: string }
Response: { success: bool, data: { sessionId: string } }

// 已有的 API：
POST /api/game/chat
Body: { sessionId: string, userMessage: string, npcId: string, ... }
Response: (stream) { npcResponse: string, clues: [...], ... }

// 可能需要新增：
POST /api/game/evaluate  (用於 S4 評分，如無則用本地邏輯)
Body: { sessionId: string, userAnswer: string, stage: string }
Response: { score: number, feedback: string, ... }
```

### 檔案結構變更範例（S1）

**現在**：
```
frontend/app/components/new_S1.tsx (所有程式碼混在一起)
```

**目標**：
```
frontend/app/components/s1/
├── S1_FileDecryption.tsx (主元件，<80 行)
├── s1.css
├── animations.tsx
└── subcomponents/
    ├── RestoreLoader.tsx
    ├── RedactedBlock.tsx
    └── DustParticles.tsx
```

**匯出 (在 `MissionIntro.tsx` / `AppMain.tsx` 等地)**：
```typescript
import S1_FileDecryption from './s1/S1_FileDecryption';
```

### 狀態管理整合

```typescript
// S1 mount 時
useEffect(() => {
  if (currentMissionId) {
    const mission = getMissionById(currentMissionId);
    if (!mission) {
      console.warn('Mission not found');
      return;
    }
    // 使用 mission.stages[0] 的 requiredKnowledgeIds 設定缺漏欄位
    setRedactedFields(mission.stages[0]?.requiredKnowledgeIds);
  }
}, [currentMissionId]);

// 按鈕點擊
const handleStartInvestigation = () => {
  goToStage("S2");
};
```

---

## ⚠️ 風險評估與緩解

| 風險 | 影響 | 緩解方案 |
|------|------|--------|
| 後端 API 簽名變更 | 前端無法連接 | 先驗證現有 `/api/game/chat` 實際回傳格式 |
| NPC / 知識庫資料結構不匹配 | 顯示錯誤 | 在各階段完成後立即測試資料流 |
| 動畫性能下降 | 使用體驗差 | 在測試時監控 FPS；必要時簡化動畫 |
| 舊版 `MissionIntro.tsx` 路由依賴 | 頁面破損 | 保留 `new_S1.tsx` 作為 fallback，或完全替換 |
| 資料庫遷移 / 知識點 ID 變更 | 後端找不到資料 | 同步後端 `knowledge_base.json` 更新 |

---

## ✅ 完成標準

### 階段 1 完成標準
- [ ] S1 能成功載入（無 console 錯誤）
- [ ] Hover 缺漏欄位顯示正確提示
- [ ] 「開始調查」按鈕轉到 S2（驗證 `goToStage("S2")` 被呼叫）
- [ ] 所有 CSS 與動畫檔案正確拆分，無重複定義

### 階段 2 完成標準
- [ ] S2 顯示 3 位 NPC（從後端或本地資料讀取）
- [ ] 選擇 NPC 後轉到 S3 + 儲存 `selectedNpcId`
- [ ] S3 顯示初始訊息（從後端取得）
- [ ] 使用者輸入後能接收 NPC 回覆
- [ ] 線索能正確新增到筆記本

### 階段 3 完成標準
- [ ] S4 顯示任務題目與評分邏輯正常
- [ ] 任務轉移流暢：S1 → S2 → S3 → S4 → 完成
- [ ] 所有頁面無 console 錯誤

---

## 📝 優先級排序

1. **高優先** → 階段 1 S1 架構拆分（影響其他頁面範本）
2. **高優先** → 階段 2 S3 後端連接（驗證 API 相容性）
3. **中優先** → 階段 2 S2 NPC 動態讀取
4. **中優先** → 階段 3 S4 測驗邏輯
5. **低優先** → 階段 3 S5 可選反思功能

---

## 📞 問題與決策點

### Q1: 舊 MissionIntro.tsx 如何處理？
**決策**：保留，改為包裝新 S1（或完全替換路由指向新 S1）

### Q2: 知識點 ID（JP001 等）與 new_S4 的對應關係？
**決策**：待確認後端 `knowledge_base.json` 結構，再決定如何動態載入

### Q3: S5 反思功能是否必須？
**決策**：可選；如時間緊張可跳過或作為額外功能

### Q4: 本地 Mock 資料何時移除？
**決策**：階段完成測試後移除（階段 1 完成後移除 S1 Mock，以此類推）

---

## 🎬 執行順序檢查清單

```markdown
- [ ] 階段 1：S1 檔案與架構
  - [ ] 1.1 內容修正
  - [ ] 1.2 架構拆分
  - [ ] 1.3 狀態管理
  - [ ] 1.4 測試驗證
  
- [ ] 階段 2：S2 + S3 對話
  - [ ] 2.1 S2 修正
  - [ ] 2.2 S3 後端連接
  - [ ] 2.3 測試驗證
  
- [ ] 階段 3：S4 + S5 完成
  - [ ] 3.1 S4 改為測驗
  - [ ] 3.2 S5 (可選)
  - [ ] 3.3 全流程測試
  
- [ ] 最終驗收
  - [ ] 無 console 錯誤
  - [ ] 所有階段轉移順暢
  - [ ] 後端 API 回覆正確
  - [ ] 資料持久化（store 正常）
```

---

**建議開始時間**：現在（階段 1 從 S1 開始）
**預估總耗時**：7-10 小時（3 個工作天）
