# 歷史任務制 AI 系統 - 後端 API 文檔

## 🎯 後端概要

本後端服務為歷史任務制學習系統提供核心 AI 能力，整合 Ollama LLM 服務，實現 RAG 知識檢索、雙過程評估、智能提示詞工程等功能。採用 Node.js + Express + TypeScript 架構，支援任務制學習流程（S0-S5）的完整 API 服務。

## 🏗️ 技術架構

### 核心技術棧
- **運行環境**: Node.js >= 18.0.0
- **框架**: Express.js + TypeScript
- **LLM 服務**: Ollama（llama3.2:3b 模型）
- **數據管理**: JSON 文件（任務資料）+ 記憶體快取
- **API 設計**: RESTful API + 即時評估

### 系統架構圖
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端應用      │◄──►│   後端 API      │◄──►│   Ollama LLM    │
│  (React App)    │    │  (Express.js)   │    │ (llama3.2:3b)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  任務知識庫     │
                     │ (RAG Chunks)    │
                     └─────────────────┘
```

## 🚀 快速啟動

### 1. 環境準備

```powershell
# 確保 Ollama 已安裝並運行
ollama --version

# 拉取所需模型
ollama pull llama3.2:3b

# 啟動 Ollama 服務
ollama serve
```

### 2. 安裝與啟動

```powershell
# 進入後端目錄
cd backend

# 安裝依賴
npm install

# 環境配置（創建 .env 文件）
cp .env.example .env

# 啟動開發服務器
npm run dev

# 啟動生產服務器
npm run start
```

### 3. 驗證服務

```powershell
# 測試 API 連線
curl http://localhost:4000/api/health

# 測試 Ollama 連線
curl http://localhost:4000/api/ollama/status
```

## 📁 專案結構

```
backend/
├── 📋 README.md           # 本文檔
├── 📄 package.json        # 依賴管理
├── 📄 tsconfig.json       # TypeScript 配置
├── 📄 .env.example        # 環境變數範本
├── 📁 src/
│   ├── 🚀 server.ts           # 應用入口
│   ├── 🛣 routes/
│   │   ├── index.ts             # 路由總匯
│   │   ├── ollama.ts            # Ollama LLM API
│   │   ├── missions.ts          # 任務相關 API
│   │   ├── eval.ts              # 進度評估 API
│   │   └── health.ts            # 健康檢查 API
│   ├── 🔧 services/
│   │   ├── ollamaClient.ts      # Ollama 客戶端
│   │   ├── missionPrompt.ts     # 任務提示詞工程
│   │   ├── progressEval.ts      # S3-EVAL 進度評估
│   │   ├── ragService.ts        # RAG 知識檢索
│   │   └── prompts/
│   │       ├── persona.qinShihuang.ts  # 秦始皇角色
│   │       └── safety.guardrails.ts    # 安全防護
│   ├── 📁 data/
│   │   └── missions/
│   │       ├── index.ts                # 任務資料匯出
│   │       └── e2-industrial-agri.ts   # E2 任務資料
│   ├── 📝 types/
│   │   ├── api.ts               # API 相關類型
│   │   ├── mission.ts           # 任務相關類型
│   │   ├── ollama.ts            # Ollama 相關類型
│   │   └── chat.ts              # 對話相關類型
│   ├── 🛠 utils/
│   │   ├── logger.ts            # 日誌服務
│   │   ├── errorHandler.ts      # 錯誤處理
│   │   └── validation.ts        # 輸入驗證
│   └── 🔒 middleware/
│       ├── cors.ts              # CORS 設定
│       ├── rateLimit.ts         # 頻率限制
│       └── security.ts          # 安全防護
└── 📁 tests/              # 測試檔案
    ├── integration/         # 整合測試
    └── unit/               # 單元測試
```

## 🔌 API 端點

### 1. 健康檢查

#### `GET /api/health`
檢查系統健康狀態

**回應**:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-23T10:30:00Z",
  "services": {
    "ollama": "connected",
    "database": "ready"
  }
}
```

### 2. 任務相關 API

#### `GET /api/missions`
取得所有任務列表

**回應**:
```json
{
  "missions": [
    {
      "id": "E2",
      "title": "工業日本・農業臺灣",
      "period": "日治時期 (1895-1945)",
      "difficulty": "intermediate",
      "description": "探索日治時期糖業經濟..."
    }
  ]
}
```

#### `GET /api/missions/:id`
取得特定任務詳細資料

**回應**:
```json
{
  "id": "E2",
  "title": "工業日本・農業臺灣",
  "chunks": [...],
  "npcs": [...],
  "learningGoals": [...],
  "quizzes": [...]
}
```

#### `POST /api/missions/:id/intro`
產生任務開場故事（S1）

**請求**:
```json
{
  "missionId": "E2",
  "style": "engaging"
}
```

**回應**:
```json
{
  "story": "1920年代的嘉南平原...",
  "guidingQuestions": [
    "你覺得誰最清楚真相？",
    "農民為什麼會不滿？"
  ]
}
```

### 3. 對話相關 API

#### `POST /api/ollama/chat`
與 NPC 對話（S3）

**請求**:
```json
{
  "missionId": "E2",
  "npcId": "npc-farmer",
  "messages": [
    {
      "role": "user",
      "content": "為什麼你們會抱怨磅重的問題？"
    }
  ],
  "context": {
    "conversationHistory": "...",
    "currentStage": "S3"
  }
}
```

**回應**:
```json
{
  "response": {
    "content": "唉，阿兄你不知道...",
    "npcName": "陳阿中",
    "emotion": "frustrated",
    "historicalContext": ["磅重", "糖業", "日治時期"]
  },
  "metadata": {
    "responseTime": 1200,
    "chunkSources": ["e2-001", "e2-003"],
    "safetyScore": 0.95
  }
}
```

### 4. 進度評估 API

#### `POST /api/eval/progress`
評估學習進度（S3-EVAL）

**請求**:
```json
{
  "missionId": "E2",
  "conversationSummary": "學生已討論磅重問題...",
  "conversationTurns": 8,
  "learningGoals": [
    {
      "id": "e2-g1",
      "description": "理解殖民經濟分工"
    }
  ]
}
```

**回應**:
```json
{
  "evaluation": {
    "goals": [
      {
        "index": 0,
        "status": "partial",
        "confidence": 0.75,
        "evidence": ["學生提及糖業分工", "理解磅重爭議"]
      }
    ],
    "overall": {
      "masteredCount": 2,
      "partialCount": 1,
      "confidence": 0.78,
      "readyForNext": false,
      "recommendedHints": [
        "可以詢問技師角度",
        "探討會社政策動機"
      ]
    }
  },
  "metadata": {
    "evaluationTime": 800,
    "systemPromptVersion": "v2.1"
  }
}
```

#### `POST /api/eval/summary`
產生任務總結（S4）

**請求**:
```json
{
  "missionId": "E2",
  "conversationSummary": "...",
  "evaluationResult": {...},
  "style": "middle-school"
}
```

**回應**:
```json
{
  "summary": {
    "title": "工業日本・農業臺灣：糖業王國背後的真相",
    "content": "透過與不同角色的對話...",
    "keyPoints": [
      "殖民經濟的分工模式",
      "技術現代化的雙面性",
      "農民處境的複雜性"
    ],
    "historicalSignificance": "..."
  }
}
```

## 🔧 核心服務

### 1. Ollama 客戶端 (`ollamaClient.ts`)

```typescript
export class OllamaClient {
  private baseURL: string;
  private model: string;

  constructor(config: OllamaConfig) {
    this.baseURL = config.baseURL || 'http://localhost:11434';
    this.model = config.model || 'llama3.2:3b';
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseResponse(data);
  }

  async validateModel(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      const data = await response.json();
      return data.models.some(model => model.name === this.model);
    } catch (error) {
      return false;
    }
  }
}
```

### 2. RAG 知識檢索 (`ragService.ts`)

```typescript
export class RAGService {
  private chunks: Map<string, Chunk[]> = new Map();

  constructor() {
    this.loadMissionChunks();
  }

  retrieveRelevantChunks(
    missionId: string, 
    query: string, 
    limit = 4
  ): Chunk[] {
    const missionChunks = this.chunks.get(missionId) || [];
    
    // 簡易關鍵字匹配（未來可升級為向量相似度）
    const scored = missionChunks.map(chunk => ({
      chunk,
      score: this.calculateRelevanceScore(chunk, query)
    }));

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.chunk);
  }

  private calculateRelevanceScore(chunk: Chunk, query: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const chunkText = chunk.text.toLowerCase();
    
    let score = 0;
    queryWords.forEach(word => {
      if (chunkText.includes(word)) {
        score += chunk.type === 'core_fact' ? 2 : 1;
      }
    });

    return score;
  }
}
```

### 3. 進度評估服務 (`progressEval.ts`)

```typescript
export class ProgressEvaluationService {
  constructor(private ollamaClient: OllamaClient) {}

  async evaluateProgress(request: EvaluationRequest): Promise<EvaluationResult> {
    const systemPrompt = this.buildEvaluationPrompt(request.learningGoals);
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: this.buildUserPrompt(request) }
    ];

    try {
      const response = await this.ollamaClient.chat({ messages });
      return this.parseEvaluationResponse(response.content);
    } catch (error) {
      console.error('評估服務錯誤:', error);
      return this.fallbackEvaluation(request);
    }
  }

  private buildEvaluationPrompt(goals: LearningGoal[]): string {
    const goalText = goals.map((g, i) => `${i + 1}. ${g.description}`).join('\n');
    
    return `你是一位國中歷史老師，負責評估學生的學習進度。

學習目標：
${goalText}

請根據學生的對話記錄，評估每個目標的掌握程度。
回覆格式必須是有效的 JSON：

{
  "goals": [
    {
      "index": 0,
      "status": "not_mentioned | wrong | partial | mastered",
      "confidence": 0.0-1.0,
      "evidence": ["具體證據1", "具體證據2"]
    }
  ],
  "overall": {
    "masteredCount": 整數,
    "partialCount": 整數, 
    "confidence": 0.0-1.0,
    "readyForNext": true/false
  }
}`;
  }
}
```

## 🛡️ 安全機制

### 1. 內容安全過濾

```typescript
// services/prompts/safety.guardrails.ts
export class SafetyGuardrails {
  private sensitiveKeywords = [
    '戰爭美化', '暴力崇拜', '種族歧視',
    '政治偏見', '現代政治', '個人資訊'
  ];

  async checkContentSafety(content: string): Promise<SafetyResult> {
    const flags: SafetyFlag[] = [];

    // 關鍵字檢查
    this.sensitiveKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        flags.push({
          type: 'keyword_match',
          severity: 'high',
          keyword,
          suggestion: this.getEducationalRedirect(keyword)
        });
      }
    });

    // 時代錯置檢查
    const anachronisms = this.detectAnachronisms(content);
    flags.push(...anachronisms);

    return {
      isSafe: flags.length === 0,
      flags,
      alternativePrompt: flags.length > 0 ? this.generateAlternative(content, flags) : null
    };
  }

  private getEducationalRedirect(issue: string): string {
    const redirects = {
      '戰爭美化': '讓我們從多元角度理解戰爭對不同群體的影響',
      '暴力崇拜': '歷史中的衝突往往有複雜的社會背景，讓我們探討其根本原因',
      '種族歧視': '歷史上的族群關係值得深入思考，讓我們了解不同觀點'
    };
    
    return redirects[issue] || '讓我們從歷史教育的角度來討論這個議題';
  }
}
```

### 2. API 安全措施

```typescript
// middleware/security.ts
export const securityMiddleware = [
  // CORS 設定
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true
  }),

  // 請求頻率限制
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分鐘
    max: 100, // 最多 100 次請求
    message: '請求過於頻繁，請稍後再試'
  }),

  // 輸入驗證
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeInput(req.body);
    }
    next();
  }
];

function sanitizeInput(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeInput(obj[key]);
    }
    return sanitized;
  }
  
  return obj;
}
```

## 🔧 任務資料結構

### 任務定義 (`data/missions/e2-industrial-agri.ts`)

```typescript
export const e2MissionData: MissionData = {
  id: 'E2',
  title: '工業日本・農業臺灣',
  period: '日治時期 (1895-1945)',
  difficulty: 'intermediate',
  estimatedTime: 45, // 分鐘

  // RAG 知識片段
  chunks: [
    {
      id: 'e2-001',
      topic: '殖民經濟分工',
      type: 'core_fact',
      text: '日治時期實施「工業日本、農業臺灣」政策，臺灣主要負責供應日本工業所需的原料，特別是糖業...',
      keywords: ['殖民經濟', '糖業', '分工', '原料供應'],
      difficulty: 'basic'
    },
    {
      id: 'e2-002', 
      topic: '糖業技術現代化',
      type: 'context',
      text: '日本引進現代製糖技術，建立新式糖廠，但同時也改變了傳統的農業結構...',
      keywords: ['製糖技術', '現代化', '糖廠', '農業結構'],
      difficulty: 'intermediate'
    }
    // ... 更多 chunks
  ],

  // NPC 角色設定
  npcs: [
    {
      id: 'npc-japanese-engineer',
      name: '山田清一',
      role: '日本技師', 
      avatar: '/avatars/yamada.jpg',
      persona: `你是1920年代的日本技師山田清一，負責臺灣糖廠的技術改良。
                你對現代化技術很自豪，認為這為臺灣帶來了進步，但對農民的抱怨感到困惑。`,
      personality: {
        traits: ['技術導向', '理想主義', '對效率的追求'],
        speakingStyle: '正式、專業，偶爾流露對技術的熱情',
        culturalBackground: '日本明治維新後的現代化思維'
      },
      knowledge: {
        expertise: ['製糖技術', '工廠管理', '效率改良', '日本工業政策'],
        limitations: ['對農民生活的理解有限', '語言隔閡', '文化差異'],
        bias: ['技術至上主義', '殖民現代化論']
      },
      canTalkAbout: [
        '糖廠技術改良',
        '生產效率提升', 
        '日本的工業政策',
        '現代化的必要性'
      ],
      avoid: [
        '政治敏感話題',
        '對殖民政策的批評',
        '農民痛苦的深入討論'
      ]
    },

    {
      id: 'npc-taiwanese-farmer',
      name: '陳阿中',
      role: '臺灣佃農',
      avatar: '/avatars/chen.jpg', 
      persona: `你是嘉南平原的佃農陳阿中，世代務農。
                新的糖廠雖然帶來工作機會，但磅重制度和價格讓你感到不公平。`,
      personality: {
        traits: ['實際', '堅韌', '對傳統的眷戀'],
        speakingStyle: '樸實、直接，帶有臺灣話的表達方式',
        culturalBackground: '傳統農業社會，重視人情和公平'
      },
      knowledge: {
        expertise: ['傳統農業', '甘蔗種植', '農村生活', '農民心聲'],
        limitations: ['對現代技術理解有限', '教育程度較低'],
        perspective: ['農民立場', '基層生活經驗', '傳統價值觀']
      },
      canTalkAbout: [
        '甘蔗種植經驗',
        '磅重問題',
        '生活變化',
        '對會社的不滿'
      ],
      avoid: [
        '複雜的政治論述',
        '高深的經濟理論'
      ]
    }
    // ... 更多 NPCs
  ],

  // 學習目標
  learningGoals: [
    {
      id: 'e2-g1',
      description: '理解「工業日本、農業臺灣」的殖民經濟分工模式',
      level: 'understand',
      keywords: ['殖民經濟', '分工', '原料供應', '工業化']
    },
    {
      id: 'e2-g2', 
      description: '分析糖業現代化對不同群體的影響',
      level: 'analyze',
      keywords: ['現代化', '多元影響', '技師', '農民', '會社']
    },
    {
      id: 'e2-g3',
      description: '評估殖民現代化的複雜性與爭議',
      level: 'evaluate', 
      keywords: ['殖民現代化', '複雜性', '爭議', '多元觀點']
    }
  ],

  // 測驗題庫
  quizzes: [
    {
      id: 'e2-q1',
      type: 'multiple_choice',
      stem: '「工業日本、農業臺灣」政策的主要目的是什麼？',
      options: [
        { key: 'A', text: '促進臺灣經濟獨立發展' },
        { key: 'B', text: '讓臺灣為日本工業提供原料' },
        { key: 'C', text: '平衡兩地的經濟發展' },
        { key: 'D', text: '保護臺灣傳統農業' }
      ],
      answer: 'B',
      explanation: '這個政策的核心是讓臺灣扮演原料供應地的角色，支持日本本土的工業發展，體現了典型的殖民經濟分工模式。',
      difficulty: 'basic',
      learningGoals: ['e2-g1']
    }
    // ... 更多題目
  ],

  // 任務流程配置
  flowConfig: {
    s1IntroStyle: 'narrative', // 故事導向
    s3MaxTurns: 15, // 最多對話輪數
    s3EvalTrigger: 3, // 每3輪評估一次
    s4SummaryLength: 'medium', // 中等長度總結
    s5QuizCount: 8 // 8題測驗
  }
};
```

## 🧪 測試

### 單元測試

```powershell
# 運行所有測試
npm run test

# 運行特定測試
npm run test -- --grep "RAG服務"

# 測試覆蓋率
npm run test:coverage
```

### 整合測試

```typescript
// tests/integration/mission-flow.test.ts
describe('任務流程整合測試', () => {
  test('E2任務完整流程', async () => {
    // S1: 產生開場故事
    const introResponse = await request(app)
      .post('/api/missions/E2/intro')
      .send({ style: 'engaging' });
    
    expect(introResponse.status).toBe(200);
    expect(introResponse.body.story).toBeDefined();

    // S3: NPC對話測試
    const chatResponse = await request(app)
      .post('/api/ollama/chat') 
      .send({
        missionId: 'E2',
        npcId: 'npc-taiwanese-farmer',
        messages: [{ role: 'user', content: '磅重的問題讓你們很困擾嗎？' }]
      });

    expect(chatResponse.status).toBe(200);
    expect(chatResponse.body.response.content).toContain('磅重');

    // S3-EVAL: 進度評估測試 
    const evalResponse = await request(app)
      .post('/api/eval/progress')
      .send({
        missionId: 'E2',
        conversationSummary: '學生已討論磅重問題...',
        conversationTurns: 6
      });

    expect(evalResponse.status).toBe(200);
    expect(evalResponse.body.evaluation.overall.confidence).toBeGreaterThan(0);
  });
});
```

## 📈 監控與日誌

### 系統監控

```typescript
// utils/logger.ts
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// 記錄 LLM 請求
export function logLLMRequest(request: any, response: any, duration: number) {
  logger.info('LLM Request', {
    requestId: request.id,
    model: 'llama3.2:3b',
    duration,
    tokenCount: response.tokenCount,
    cacheHit: response.fromCache
  });
}
```

### 性能監控

```typescript
// middleware/performance.ts
export function performanceMonitor(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('API Performance', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent')
    });

    // 慢請求警告
    if (duration > 5000) {
      logger.warn('Slow Request Detected', {
        path: req.path,
        duration
      });
    }
  });
  
  next();
}
```

## 🚀 部署

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 安裝依賴
COPY package*.json ./
RUN npm ci --only=production

# 複製原始碼
COPY . .

# 編譯 TypeScript
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_MODELS=llama3.2:3b

volumes:
  ollama_data:
```

### 生產環境設定

```bash
# .env.production
NODE_ENV=production
PORT=4000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
LOG_LEVEL=warn

# CORS 設定
CORS_ORIGIN=https://yourapp.com

# 安全設定
SESSION_SECRET=your_session_secret
API_RATE_LIMIT=100
```

## 🔧 故障排除

### 常見問題

#### 1. Ollama 連接失敗
```bash
# 檢查 Ollama 服務狀態
ollama list

# 重啟 Ollama
ollama serve

# 檢查網路連接
curl http://localhost:11434/api/tags
```

#### 2. 模型載入錯誤
```bash
# 確認模型存在
ollama list

# 重新拉取模型
ollama pull llama3.2:3b
```

#### 3. 記憶體不足
```bash
# 檢查系統資源
htop

# 調整模型參數（減少內存使用）
# 在 ollamaClient.ts 中調整：
options: {
  num_ctx: 2048,  // 減少上下文長度
  num_gpu: 0      // 關閉 GPU（如果有問題）
}
```

---

## 📚 開發指南

### 新增任務

1. **建立任務資料文件**
```typescript
// data/missions/e3-new-mission.ts
export const e3MissionData: MissionData = {
  // 任務配置...
};
```

2. **註冊到任務索引**
```typescript
// data/missions/index.ts
export { e3MissionData } from './e3-new-mission';
```

3. **測試任務**
```bash
npm run test -- --grep "E3"
```

### 新增 NPC

1. **定義 NPC 角色**
```typescript
const newNPC: NPC = {
  id: 'npc-new-character',
  name: '新角色名稱',
  role: '角色職業',
  persona: '詳細的角色設定...',
  // ...其他配置
};
```

2. **創建角色提示詞**
```typescript
// services/prompts/persona.newCharacter.ts
export const newCharacterPrompts = {
  system: `角色系統提示詞...`,
  // ...更多提示詞
};
```

### API 版本控制

```typescript
// routes/v1/index.ts
const router = express.Router();

router.use('/missions', missionRoutes);
router.use('/ollama', ollamaRoutes);

export default router;

// 在主應用中使用
app.use('/api/v1', v1Router);
```

本後端服務為歷史任務制學習系統提供了完整的 AI 能力支援，具備良好的可擴展性、安全性和性能表現。透過模組化設計，開發者可以輕鬆添加新的歷史任務和 NPC 角色，構建更豐富的歷史學習體驗。