# PromptService - 智能追問建議系統

## 📚 設計理念

基於 **知識圖譜的檢索式引導 (Knowledge-Graph based Retrieval Guidance)**：

1. **避免 LLM 幻覺** - 使用預定義的提問庫，不依賴 LLM 動態生成
2. **確保教學目標** - 每個提示對應特定學習階段和認知層級
3. **鷹架式學習** - 根據對話上下文動態推送引發後設認知的問題

## 🏗️ 架構設計

### 三層認知模型（基於 Bloom's Taxonomy）

```
┌─────────────────────────────────────┐
│  事實層 (Fact)                       │
│  - 詢問具體事件、時間、地點         │
│  - 對應記憶與理解層級               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  衝突層 (Conflict)                   │
│  - 詢問對立觀點、權力關係           │
│  - 對應分析與評價層級               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  同理層 (Empathy)                    │
│  - 詢問個人感受、情緒體驗           │
│  - 對應綜合與創造層級               │
└─────────────────────────────────────┘
```

### 學習階段映射

```
Stage 1: 總督權力與法律基礎
  - governor_power (總督權力)
  - law_63 (六三法)

Stage 2: 社會控制機制
  - police_authority (警察即決權)
  - hokko_system (保甲制度)
  - social_reform (舊習改良)

Stage 3: 經濟與財政系統
  - land_survey (土地調查)
  - monopoly_system (專賣制度)
```

## 🔧 使用方式

### 後端 API

```typescript
POST /api/game/prompts
Content-Type: application/json

{
  "sessionId": "session-xxx",
  "lastMessage": "警察大人很兇！"
}

Response:
{
  "success": true,
  "data": {
    "prompts": [
      {
        "id": "s_police_fact",
        "text": "警察大人在你們那邊都管些什麼事？",
        "level": "fact",
        "context": "police_authority",
        "stage": 2
      },
      // ... more prompts
    ],
    "isInitial": false
  }
}
```

### 前端元件

```tsx
import PromptChips from '@/components/PromptChips';

<PromptChips
  sessionId={sessionId}
  npcId={npcId}
  lastNpcMessage={lastMessage}
  onChipClick={(text, level) => {
    // 處理點擊
    console.log(`用戶選擇了 ${level} 層級問題：${text}`);
  }}
  disabled={isLoading}
/>
```

## 📊 知識圖譜結構

### NPC 特定提示庫

每個 NPC 都有專門設計的提示庫，確保問題符合角色知識範圍：

```
student (小清)
  ├─ governor_power: 3 個提示
  ├─ police_authority: 3 個提示
  ├─ hokko_system: 3 個提示
  ├─ social_reform: 3 個提示
  ├─ education: 3 個提示
  └─ generic: 3 個提示

police_officer (佐藤警官)
  ├─ governor_power: 3 個提示
  ├─ law_63: 3 個提示
  ├─ police_authority: 3 個提示
  ├─ hokko_system: 3 個提示
  ├─ resistance: 3 個提示
  └─ generic: 3 個提示

land_surveyor (山本測量員)
  ├─ land_survey: 3 個提示
  ├─ monopoly_system: 3 個提示
  ├─ governor_power: 3 個提示
  └─ generic: 3 個提示
```

## 🔍 話題偵測邏輯

系統使用關鍵字匹配來識別對話話題：

```typescript
// 範例：警察相關話題
if (message.includes('警察') || 
    message.includes('巡查') || 
    message.includes('即決') || 
    message.includes('處罰')) {
  return 'police_authority';
}
```

## 🛡️ 防呆機制

1. **無 NPC 庫** → 返回通用 fallback 提示
2. **無話題匹配** → 返回該 NPC 的 generic 提示
3. **API 錯誤** → 前端顯示空狀態，不阻塞對話

## 📈 未來擴展

- [ ] 引入機器學習話題分類器
- [ ] 根據學生進度動態調整提示難度
- [ ] 記錄學生使用提示的模式，優化推薦算法
- [ ] 多語言支持（英文、日文版本）

## 🧪 測試建議

```bash
# 測試不同話題的提示生成
curl -X POST http://localhost:3001/api/game/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "lastMessage": "警察大人很兇！"
  }'

# 測試初始提示
curl -X POST http://localhost:3001/api/game/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "lastMessage": ""
  }'
```
