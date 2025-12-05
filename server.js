import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000;

// 中間件
app.use(cors());
app.use(express.json());

// 代理 Ollama API
app.post('/api/ollama/chat', async (req, res) => {
  try {
    console.log('Received request:', JSON.stringify(req.body, null, 2));

    const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

    // Build request body with sensible defaults
    const requestBody = {
      model: req.body.model || DEFAULT_MODEL,
      messages: Array.isArray(req.body.messages) ? req.body.messages : [],
      stream: !!req.body.stream,
    };

    if (!Array.isArray(requestBody.messages) || requestBody.messages.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: messages array is required and cannot be empty',
      });
    }

    console.log('Sending to Ollama:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ollama API error: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      return res.status(response.status).json({
        error: `Ollama API error: ${response.status}`,
        details: response.statusText,
        ollamaError: errorText,
      });
    }

    const data = await response.json();
    console.log('Ollama response:', JSON.stringify(data, null, 2));

    // Normalize response shape to match backend routes/ollama.ts
    const reply = data?.message?.content || data?.choices?.[0]?.message?.content || data;
    res.json({ message: { role: 'assistant', content: reply }, raw: data });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// 代理進度評估 API
app.post('/api/eval', async (req, res) => {
  try {
    console.log('Received eval request:', JSON.stringify(req.body, null, 2));
    
    const { missionId, conversationSummary } = req.body;
    
    // 創建評估提示
    const evalPrompt = `請評估以下對話中學習者對任務 ${missionId} 相關知識的掌握程度：

對話摘要：
${conversationSummary}

請以 JSON 格式回覆，包含：
{
  "overall": {
    "masteredCount": 數字(0-5),
    "confidence": 數字(0.0-1.0)
  }
}`;

    const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
        messages: [
          { role: "system", content: "你是一位教育評估專家，請客觀評估學習進度。" },
          { role: "user", content: evalPrompt }
        ],
        stream: false,
      }),
    });
    
    if (!response.ok) {
      console.error(`Ollama eval API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ 
        error: `Ollama eval API error: ${response.status}`,
        details: response.statusText 
      });
    }
    
    const data = await response.json();
    console.log('Ollama eval response:', JSON.stringify(data, null, 2));
    
    // 嘗試解析 JSON 回覆
    let evalResult;
    try {
      evalResult = JSON.parse(data.message?.content || '{}');
    } catch {
      // 如果解析失敗，使用預設值
      evalResult = {
        overall: {
          masteredCount: 2,
          confidence: 0.6
        }
      };
    }
    
    res.json({ eval: evalResult });
    
  } catch (error) {
    console.error('Eval proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying /api/ollama/chat to http://localhost:11434/api/chat`);
});