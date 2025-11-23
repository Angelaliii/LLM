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
    
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    
    if (!response.ok) {
      console.error(`Ollama API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ 
        error: `Ollama API error: ${response.status}`,
        details: response.statusText 
      });
    }
    
    const data = await response.json();
    console.log('Ollama response:', JSON.stringify(data, null, 2));
    res.json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
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