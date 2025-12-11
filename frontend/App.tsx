// 主應用路由 - 統合銷售頁面和主系統
import React, { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AnalyticsService } from "./app/services/analytics";
import {
  initializeABTest,
  initializeExitIntent,
  initializeScrollTracking,
  initializeTheme,
} from "./app/store/useUIStore";

// 銷售頁面
import SalesPage from "./sales/SalesPage";

// 主系統
import AppMain from "./app/AppMain";
import AppErrorBoundary from "./app/components/AppErrorBoundary";
// 臨時檢視用：檔案室組件
import FileRoom from "./app/components/FileRoom";

function App() {
  useEffect(() => {
    // 初始化各種服務
    AnalyticsService.init();
    initializeABTest();
    initializeTheme();

    const cleanupScroll = initializeScrollTracking();
    const cleanupExitIntent = initializeExitIntent();

    return () => {
      cleanupScroll();
      cleanupExitIntent();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Routes>
          {/* 銷售/行銷頁面 */}
          <Route path="/" element={<SalesPage />} />
          
          {/* 主系統 - S0-S5 使用者流程 */}
          <Route path="/game/*" element={
            <AppErrorBoundary>
              <AppMain />
            </AppErrorBoundary>
          } />

          {/* 測試/開發用：檔案室檢視（FileRoom） */}
          <Route path="/fileroom" element={<FileRoom />} />
          
          {/* 兼容舊路由 */}
          <Route path="/app/*" element={
            <AppErrorBoundary>
              <AppMain />
            </AppErrorBoundary>
          } />
          <Route path="/chat" element={
            <AppErrorBoundary>
              <AppMain />
            </AppErrorBoundary>
          } />
          
          {/* 404 重導向到首頁 */}
          <Route path="*" element={<SalesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
