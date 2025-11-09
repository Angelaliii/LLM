# 歷史人物對話系統

## GitHub Pages 部署指南

本專案已設定為自動部署到 GitHub Pages。

### 部署設定

1. **Vite 設定** (`vite.config.ts`)：

   ```typescript
   export default defineConfig({
     base: "/LLM/", // GitHub Pages 專案路徑
     // ...
   });
   ```

2. **React Router 設定** (`src/App.tsx`)：

   ```typescript
   <Router basename={import.meta.env.BASE_URL}>
   ```

3. **GitHub Actions 工作流程** (`.github/workflows/deploy.yml`)：
   - 自動在 push 到 main 分支時觸發
   - 執行 `npm run build` 產生 `dist/` 資料夾
   - 將 `dist/` 內容部署到 GitHub Pages

### 手動部署步驟

如果需要手動部署：

```bash
# 1. 安裝依賴
npm install

# 2. 建立生產版本
npm run build

# 3. 預覽本地版本（可選）
npm run preview
```

### 重要檔案

- `public/404.html`: SPA fallback 頁面
- `public/.nojekyll`: 允許下底線開頭的資料夾
- `.github/workflows/deploy.yml`: 自動部署設定

### 本地開發

```bash
# 開發模式
npm run dev

# 建立並預覽
npm run build && npm run preview
```

開發模式會在 `http://localhost:3000/LLM/` 運行，與部署環境保持一致。

### 故障排除

**404 錯誤**：

- 確認 `base` 設定正確
- 確認部署的是 `dist/` 內容，不是原始碼
- 確認 GitHub Pages 設定為 GitHub Actions 來源

**路由問題**：

- SPA 路由由 `404.html` 處理
- 確認 `basename` 設定正確

**資源載入問題**：

- 所有資源路徑會自動加上 `/LLM/` 前綴
- 確認沒有硬編碼的絕對路徑
