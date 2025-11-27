import dotenv from "dotenv";

// 最優先載入環境變數
dotenv.config();

import express from "express";
import cors from "cors";
import ollamaRouter from "./routes/ollama";
import evalRouter from "./routes/eval";
import missionsRouter from "./routes/missions";
import gameRouter from "./routes/game";
import { initializeVectorDB, getKnowledgeStats } from "./services/simpleVectorDB";

const app = express();
app.use(cors());
app.use(express.json());

// 健康檢查端點
app.get('/api/health', (req, res) => {
  try {
    const stats = getKnowledgeStats();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        ollama: 'unknown',
        database: 'ready',
        vectorDB: 'initialized',
        knowledgeBase: stats
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 基本路由測試
app.get('/api/test', (req, res) => {
  res.json({ message: '後端 API 連接成功！', timestamp: new Date().toISOString() });
});

app.use("/api/missions", missionsRouter);
app.use("/api/ollama", ollamaRouter);
app.use("/api/eval", evalRouter);
app.use("/api/game", gameRouter);

const PORT = process.env.PORT || 4000;

// 初始化向量資料庫後啟動伺服器
async function startServer() {
  try {
    console.log('🔄 正在初始化向量資料庫...');
    await initializeVectorDB();
    console.log('✅ 向量資料庫初始化完成');
    
    app.listen(PORT, () => {
      console.log(`Backend listening on http://localhost:${PORT}`);
      console.log(`✅ Mistral API: ${process.env.MISTRAL_API_KEY ? '已設定' : '未設定'}`);
      console.log(`✅ Ollama URL: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);
      console.log(`\n🚀 Server is ready! Press Ctrl+C to stop.\n`);
    });
  } catch (error: any) {
    console.error('❌ 伺服器啟動失敗:', error.message);
    console.error('請確認:');
    console.error('1. 已建立 .env 檔案並設定 MISTRAL_API_KEY');
    console.error('2. Ollama 服務正在運行 (http://localhost:11434)');
    console.error('3. 知識庫檔案存在於 backend/data/knowledge/knowledge_base.json');
    process.exit(1);
  }
}

// 捕獲未處理的錯誤
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

export default app;