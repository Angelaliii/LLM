# 簡化對話系統測試指南

## ✅ 已完成

1. **新建 SimpleChatRoom 組件** (`frontend/app/components/SimpleChatRoom.tsx`)
   - 簡潔的雙欄布局
   - 左側 NPC 選擇器
   - 右側即時對話視窗
   - 完整串接後端 API

2. **API 整合**
   - `POST /api/game/start` - 開始遊戲會話
   - `POST /api/game/chat` - 發送訊息並獲取 AI 回應
   - 使用 Mistral AI + RAG 知識檢索

## 🚀 啟動步驟

### 1. 啟動後端 (Port 4000)
```bash
cd C:\Users\linpe\LLM\backend
npm run dev
```

等待看到:
```
✅ Vector database initialized with 30 entries
✅ 向量資料庫初始化完成
Backend listening on http://localhost:4000
🚀 Server is ready! Press Ctrl+C to stop.
```

### 2. 啟動前端 (Port 3001)
```bash
cd C:\Users\linpe\LLM
npm run dev
```

### 3. 開啟瀏覽器
訪問 http://localhost:3001

## 📋 使用流程

1. **選擇任務** - 在 S0 階段選擇任務
2. **閱讀介紹** - S1 階段查看任務背景
3. **點擊「開始任務」** - 進入 SimpleChatRoom
4. **選擇 NPC** - 左側選擇對話角色:
   - 👧 學生 小清
   - 👮 警察 佐藤敬一
   - 📐 土地測量員 山本勘助
5. **開始對話** - 輸入問題,獲得 AI 回應

## 🎯 測試重點

- ✅ NPC 切換是否正常
- ✅ 消息發送與接收
- ✅ AI 回應是否符合角色設定
- ✅ RAG 知識檢索是否生效
- ✅ 對話歷史是否正確顯示

## 🔧 技術細節

### 前端
- React + TypeScript
- Zustand (狀態管理,但 SimpleChatRoom 用本地 state)
- Tailwind CSS

### 後端
- Express.js + TypeScript
- Mistral AI (mistral-small-latest)
- Ollama (nomic-embed-text 嵌入模型)
- 記憶體向量資料庫 (30 個歷史知識條目)

### API 流程
```
用戶輸入 
  → POST /api/game/chat
  → RAG 搜尋相關知識 (向量相似度)
  → 建構 System Prompt (包含 NPC persona + 知識)
  → 呼叫 Mistral API
  → 回傳 AI 回應
```

## 📝 已移除的複雜功能

原本的 ChatRoom 組件有:
- 多角色並行對話
- 複雜的 stage 管理
- 建議問題列表
- 角色切換器
- 串流顯示

新的 SimpleChatRoom 只保留核心功能:
- 單一角色對話
- 簡單訊息列表
- 基本輸入框
- 載入狀態

## 🐛 可能的問題

1. **後端連接失敗**
   - 檢查 `http://localhost:4000/api/health`
   - 確認 backend 正在運行

2. **CORS 錯誤**
   - backend/index.ts 已設定 `cors()`

3. **AI 回應緩慢**
   - Mistral API 網路延遲
   - RAG 搜尋時間 (~2-3秒)

4. **知識庫回答不準確**
   - 檢查 `backend/data/knowledge/knowledge_base.json`
   - 調整 minSimilarity 參數

## 🎨 UI 特色

- 清爽的雙欄設計
- 左側固定 NPC 選擇
- 右側滾動對話視窗
- 藍色用戶訊息
- 白色 AI 回應
- 即時載入動畫
- 響應式時間戳記

## 下一步

- [ ] 新增對話匯出功能
- [ ] 顯示 RAG 使用的知識來源
- [ ] 支援多輪對話記憶
- [ ] 新增語音輸入
- [ ] 對話評分與反饋
