import React, { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ChatWindow from "./components/chat/ChatWindow";
import Controls from "./components/controls/Controls";
import { AnalyticsService } from "./services/analytics";
import { useChatStore } from "./store/useChatStore";
import {
  initializeABTest,
  initializeExitIntent,
  initializeScrollTracking,
  initializeTheme,
} from "./store/useUIStore";

// 原有組件的保留導入
import FAQ from "./components/FAQ";
import FeatureGrid from "./components/FeatureGrid";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import LiveDemo from "./components/LiveDemo";
import NavBar from "./components/NavBar";
import PricingPlans from "./components/PricingPlans";

// 主對話頁面
const ChatPage: React.FC = () => {
  const { actions } = useChatStore();

  useEffect(() => {
    // 初始化新會話
    actions.startNewSession();
  }, [actions]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 導覽列 */}
      <div className="flex-shrink-0">
        <NavBar />
      </div>

      {/* 控制面板 */}
      <Controls />

      {/* 對話窗口 */}
      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  );
};

// 原有的登陸頁面組件
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* 跳轉至主要內容的無障礙連結 */}
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        跳轉至主要內容
      </a>

      {/* 導覽列 */}
      <NavBar />

      {/* 主要內容 */}
      <main id="main-content" className="pt-16">
        {/* Hero 區塊 */}
        <Hero />

        {/* 產品特色 */}
        <FeatureGrid />

        {/* 互動展示 */}
        <LiveDemo />

        {/* 價格方案 */}
        <PricingPlans />

        {/* 常見問題 */}
        <FAQ />
      </main>

      {/* 頁腳 */}
      <Footer />
    </div>
  );
};

function App() {
  useEffect(() => {
    // 初始化各種服務
    AnalyticsService.init();
    initializeABTest();
    initializeTheme();

    // 初始化追蹤
    const cleanupScroll = initializeScrollTracking();
    const cleanupExitIntent = initializeExitIntent();

    // 清理函數
    return () => {
      cleanupScroll();
      cleanupExitIntent();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
