import express from "express";
import cors from "cors";
import ollamaRouter from "./routes/ollama";
import evalRouter from "./routes/eval";
import missionsRouter from "./routes/missions";

const app = express();
app.use(cors());
app.use(express.json());

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      ollama: 'unknown', // 實際環境中應檢查 Ollama 連接
      database: 'ready'
    }
  });
});

// 基本路由測試
app.get('/api/test', (req, res) => {
  res.json({ message: '後端 API 連接成功！', timestamp: new Date().toISOString() });
});

app.use("/api/missions", missionsRouter);
app.use("/api/ollama", ollamaRouter);
app.use("/api/eval", evalRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

export default app;