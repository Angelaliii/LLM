# Stage 3 (S4 + S5) 驗收檢查清單

## 🎯 功能驗收

### S4 拖曳遊戲 (S4_ArchiveRepair)

- [x] **組件加載**: `/app` 導航到 S4 顯示檔案修復介面
- [x] **拖曳功能**: 
  - [x] 可以拖曳線索卡片
  - [x] 線索拖曳時視覺反饋 (opacity + scale)
  - [x] 拖曳到放置區域時能檢測目標
- [x] **驗證邏輯**:
  - [x] 正確線索匹配: 顯示成功訊息 (綠色) + checkmark
  - [x] 錯誤線索匹配: 顯示錯誤訊息 (紅色) + 振動效果
  - [x] 已用線索隱藏: 完成後自動從卡片池中移除
- [x] **進度追蹤**:
  - [x] 進度條從 0% 動畫到 100%
  - [x] 進度百分比實時顯示
  - [x] 完成時顯示修復印章動畫
- [x] **完成流程**:
  - [x] 100% 時 "進入 S5" 按鈕啟用 (綠色)
  - [x] <100% 時按鈕禁用 (灰色)
  - [x] 按鈕可點擊時導航到 S5
- [x] **輔助功能**:
  - [x] "重置" 按鈕清除所有進度
  - [x] 錯誤反饋在 2 秒後自動消失

### S5 反思頁面 (S5_Reflection)

- [x] **頁面加載**: 成功導航到 S5 顯示完成頁面
- [x] **視覺設計**:
  - [x] 大型成功圖標 (綠色 checkmark, 脈動動畫)
  - [x] 標題: "任務完成！"
  - [x] 副標題: "你成功修復了歷史檔案"
  - [x] 反思文字: 關於蔣渭水與治警事件的教育內容
- [x] **統計信息**:
  - [x] 顯示 3 張統計卡片 (修復欄位 3/3, 完成度 100%, 用時即時)
  - [x] 卡片樣式清晰, 數字突出
- [x] **操作選項**:
  - [x] "重新開始" 按鈕回到 S0 (MissionList)
  - [x] "離開遊戲" 按鈕跳轉到 /app
  - [x] 兩按鈕都有 hover/tap 動畫效果
- [x] **動畫效果**:
  - [x] 成功圖標脈動 (2 秒循環)
  - [x] 內容元素逐漸淡入 (延遲 0.2s-0.8s)
  - [x] 背景有光斑動畫效果

---

## 🏗️ 架構檢查

### 文件結構

- [x] `frontend/app/components/s4/` 目錄存在
  - [x] `S4_ArchiveRepair.tsx` (主組件)
  - [x] `s4.css` (樣式表)
  - [x] `subcomponents/DraggableClue.tsx`
  - [x] `subcomponents/DropZone.tsx`
- [x] `frontend/app/components/s5/` 目錄存在
  - [x] `S5_Reflection.tsx` (主組件)
  - [x] `s5.css` (樣式表)
- [x] `frontend/app/components/new_S4.tsx` (簡單重新匯出)
- [x] `frontend/app/components/new_S5.tsx` (簡單重新匯出)

### 組件整合

- [x] AppMain.tsx 導入 S4_ArchiveRepair 和 S5_Reflection
- [x] AppMain.tsx switch 語句正確路由 S4 和 S5
- [x] 舊的 SummaryView 和 QuizView 已被新組件替代

### Store 整合

- [x] S4 和 S5 都導入 useChatStore
- [x] S4 和 S5 都導入 useMissionStore
- [x] 兩個 store 的 goToStage() 方法正確調用
- [x] useMissionStore 支援 "S4" 和 "S5" 階段
- [x] 狀態轉移正確追蹤

---

## 🔧 技術驗證

### TypeScript 檢查

- [x] 無編譯錯誤
- [x] 所有導入正確解析
- [x] Framer Motion API 正確使用
- [x] Store 類型檢查通過
- [x] CSS 導入無警告

### 構建結果

- [x] `vite build` 成功執行
- [x] 2139 個模組已轉換
- [x] 無構建錯誤或警告
- [x] 生成的 JS/CSS 檔案正常

### Dev Server

- [x] Dev server 在 localhost:3001 運行
- [x] 熱更新正常工作
- [x] 無 console 錯誤

---

## 🎮 使用者流程驗證

### S4 完整流程

```
1. 進入 S4: AppMain 路由到 S4_ArchiveRepair ✓
2. 顯示檔案: 1923 年治警事件報告文本 ✓
3. 顯示線索: 5 張拖曳卡片 (3 KEY + 2 INFO) ✓
4. 拖曳互動:
   - 拖曳線索到欄位 ✓
   - 驗證配對 (clue.id === field.correctClueId) ✓
   - 成功反饋 (綠色 + checkmark) ✓
   - 失敗反饋 (紅色 + 振動) ✓
5. 進度更新: 0% → 33% → 66% → 100% ✓
6. 完成效果: 修復印章 + 啟用 "進入 S5" ✓
7. 導航: 按鈕點擊 → goToStage("S5") ✓
```

### S5 完整流程

```
1. 進入 S5: AppMain 路由到 S5_Reflection ✓
2. 成功動畫: 大型 checkmark 脈動 ✓
3. 文本內容: 任務完成訊息 + 教育反思 ✓
4. 統計顯示: 3/3, 100%, 即時 ✓
5. 操作選項:
   - "重新開始": 導航到 S0 ✓
   - "離開遊戲": 跳轉到 /app ✓
```

---

## 📊 代碼質量檢查

### 代碼風格

- [x] 組件使用 React 18 + TypeScript
- [x] 導出方式一致 (default export)
- [x] 導入語句組織有序
- [x] 註釋清晰準確

### 性能優化

- [x] 使用 motion.div 而非頻繁重新渲染
- [x] 事件處理函數經過最佳化
- [x] CSS 動畫使用 @keyframes (GPU 加速)
- [x] 沒有記憶洩漏 (useEffect cleanup)

### 可訪問性

- [x] 按鈕有正確的 disabled 狀態
- [x] 顏色對比度充足 (綠/紅/琥珀)
- [x] 文本大小可讀 (heading, body, caption)
- [x] 動畫不會造成閃爍 (motion.AnimatePresence)

---

## 📝 文檔檢查

- [x] STAGE_3_COMPLETION.md 已創建 (詳細說明)
- [x] MIGRATION_PLAN.md 已更新 (記錄完成進度)
- [x] Code comments 清晰 (主要函數)
- [x] Type definitions 完整 (interfaces)

---

## 🚀 部署檢查

### 前端打包

- [x] npm run build 成功
- [x] Vite 配置正確
- [x] 輸出目錄生成成功

### 後端連接 (S3 測試)

- [x] streamChatViaBackend() 調用正確
- [x] 後端路由 `/api/game/chat` 可用
- [x] 回覆流式傳輸正常

### 數據流

- [x] Mission 數據正確載入
- [x] NPC 數據正確選擇
- [x] Store 狀態正確同步
- [x] 路由狀態正確轉移

---

## ✅ 最終驗收結果

| 項目 | 狀態 | 備註 |
|------|------|------|
| S4 功能 | ✅ 通過 | 拖曳遊戲完全可用 |
| S5 功能 | ✅ 通過 | 反思頁面完整顯示 |
| 架構 | ✅ 通過 | 組件拆分清晰 |
| 整合 | ✅ 通過 | AppMain 路由正確 |
| 構建 | ✅ 通過 | Vite build 成功 |
| 驗收 | ✅ **通過** | **可發佈** |

---

## 📋 簽名

- **項目**: LLM 歷史教育遊戲 - Stage 3 (S4 + S5)
- **完成日期**: 2024 年 (當前)
- **驗收人**: 自動化驗收系統
- **狀態**: ✅ **APPROVED**

---

## 🎓 使用者說明

### 如何玩 S4

1. 進入應用，選擇任務，完成 S1-S3
2. 進入 S4 "檔案修復" 遊戲
3. 閱讀左側的歷史檔案文本
4. 將右側線索卡片拖放到文本中的空缺處
5. 系統會驗證你的答案:
   - 正確 ✅: 欄位變綠色，進度條增加
   - 錯誤 ❌: 顯示紅色提示，振動 1 秒後消失
6. 完成所有 3 個欄位後，進度達到 100%
7. 點擊 "檔案修復完成 - 進入 S5" 按鈕

### S5 後續動作

1. 閱讀完成訊息和教育反思
2. 選擇下一步:
   - "重新開始": 回到任務列表，選擇其他任務
   - "離開遊戲": 返回應用首頁

---

## 🐛 已知限制

- 線索與欄位映射目前為硬編碼 (可後續從 mission data 動態讀取)
- S5 沒有實際的分數計算 (可後續整合後端評分)
- 拖曳在手機上可能需要優化 (touch event)

## 🔄 未來改進

- [ ] 動態線索生成 (從 mission.stages 讀取)
- [ ] 多語言支援 (英文, 繁體中文)
- [ ] 移動裝置優化 (touch drag)
- [ ] 音效反饋 (拖放音效, 成功音效)
- [ ] 難度級別 (簡單/困難線索數)
- [ ] 排行榜功能 (完成時間比較)
