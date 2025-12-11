import { Router, Request, Response } from 'express';
import { handleGameChat, GameChatRequest, summarizeConversation } from '../services/gameService';
import { getPersonaRouteConfig } from '../services/npcConfigManager';
import { createPersonaCache, PersonaCache } from '../services/personaCache';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const router = Router();

// NPC ID 映射
const NPC_FILE_MAPPING: Record<string, string> = {
  'student': 'NPC_JP01_Student.md',
  'police_officer': 'NPC_JP02_Police.md',
  'land_surveyor': 'NPC_JP03_LandSurveyor.md'
};

// 初始化 PersonaCache 用於路由（與 gameService 共用或獨立實例皆可）
const personaCacheForRoute: PersonaCache = createPersonaCache({
  strategy: 'lazy',
  ttlMs: 5 * 60 * 1000,
  preload: false,
  watchFs: false
});

// 遊戲 Session 儲存 (簡易版,生產環境應使用 Redis)
const gameSessions = new Map<string, {
  sessionId: string;
  missionId: string;
  npcId: string;
  conversationHistory: Array<{ role: string; content: string; timestamp: number }>;
  summaries: any[];
  keyPoints: any[];
  feedbackHistory: Array<{ responseId: string; selectedId: string; timestamp: number }>;
  startedAt: number;
}>();

/**
 * GET /api/stories - 獲取所有故事任務
 */
router.get('/stories', (req: Request, res: Response) => {
  try {
    const storiesPath = path.join(__dirname, '../data/story');
    const files = fs.readdirSync(storiesPath).filter(f => f.endsWith('.json'));
    
    const stories = files.map(file => {
      const content = fs.readFileSync(path.join(storiesPath, file), 'utf-8');
      return JSON.parse(content);
    });

    res.json({
      success: true,
      data: stories
    });
  } catch (error: any) {
    console.error('❌ Load stories error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load stories'
    });
  }
});

/**
 * POST /api/game/start - 開始遊戲
 */
router.post('/start', (req: Request, res: Response) => {
  const { missionId, npcId } = req.body;

  if (!missionId || !npcId) {
    return res.status(400).json({
      success: false,
      error: 'Missing missionId or npcId'
    });
  }

  // 生成 Session ID
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 建立遊戲 Session
  gameSessions.set(sessionId, {
    sessionId,
    missionId,
    npcId,
    conversationHistory: [],
    summaries: [],
    keyPoints: [],
    feedbackHistory: [],
    startedAt: Date.now()
  });

  console.log(`✅ Game started: ${sessionId} | Mission: ${missionId} | NPC: ${npcId}`);

  res.json({
    success: true,
    data: {
      sessionId,
      missionId,
      npcId,
      message: '遊戲開始!請開始與 NPC 對話。'
    }
  });
});

/**
 * POST /api/game/chat - 遊戲對話 (核心 RAG + LLM 端點)
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { sessionId, message, summaries, keyPoints } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({
      success: false,
      error: 'Missing sessionId or message'
    });
  }

  const session = gameSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  // 更新 session 中的記憶
  if (summaries) {
    session.summaries = summaries;
  }
  if (keyPoints) {
    session.keyPoints = keyPoints;
  }

  try {
    // 呼叫遊戲服務處理對話
    const response = await handleGameChat({
      sessionId,
      npcId: session.npcId,
      message,
      conversationHistory: session.conversationHistory,
      summaries: session.summaries,
      keyPoints: session.keyPoints
    });

    // 更新對話歷史
    session.conversationHistory.push(
      { role: 'user', content: message, timestamp: Date.now() }
    );

    // 暫時選擇第一個回答加入歷史 (玩家選擇後會更新)
    session.conversationHistory.push({
      role: 'assistant',
      content: response.responses[0].content,
      timestamp: Date.now()
    });

    console.log(`💬 Chat processed: ${sessionId} | Turn: ${session.conversationHistory.length / 2}`);

    res.json({
      success: true,
      data: response
    });
  } catch (error: any) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat',
      details: error.message
    });
  }
});

/**
 * POST /api/game/feedback - 記錄玩家選擇的回答
 */
router.post('/feedback', (req: Request, res: Response) => {
  const { sessionId, responseId, selectedId } = req.body;

  if (!sessionId || !responseId || !selectedId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  const session = gameSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  // 記錄 Feedback
  session.feedbackHistory.push({
    responseId,
    selectedId,
    timestamp: Date.now()
  });

  console.log(`👍 Feedback recorded: ${sessionId} | Response: ${responseId} | Selected: ${selectedId}`);

  res.json({
    success: true,
    data: {
      message: 'Feedback recorded'
    }
  });
});

/**
 * GET /api/game/session/:sessionId - 獲取遊戲 Session 資訊
 */
router.get('/session/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const session = gameSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  res.json({
    success: true,
    data: {
      sessionId: session.sessionId,
      missionId: session.missionId,
      npcId: session.npcId,
      conversationCount: Math.floor(session.conversationHistory.length / 2),
      feedbackCount: session.feedbackHistory.length,
      startedAt: session.startedAt,
      duration: Date.now() - session.startedAt
    }
  });
});

/**
 * POST /api/game/summarize - 濃縮對話記憶
 */
router.post('/summarize', async (req: Request, res: Response) => {
  const { messages, personaId, existingSummaries, existingKeyPoints } = req.body;

  if (!messages || !personaId) {
    return res.status(400).json({
      success: false,
      error: 'Missing messages or personaId'
    });
  }

  try {
    console.log(`📝 開始濃縮對話... (${messages.length} 條訊息)`);
    
    const result = await summarizeConversation(
      messages,
      personaId,
      existingSummaries || [],
      existingKeyPoints || []
    );

    console.log(`✅ 濃縮完成`);

    res.json({
      success: true,
      summary: result.summary,
      newKeyPoints: result.newKeyPoints
    });
  } catch (error: any) {
    console.error('❌ Summarize error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to summarize conversation',
      details: error.message
    });
  }
});

/**
 * GET /api/persona/:npcId - 獲取 NPC Persona 內容
 * 
 * Query Parameters:
 * - source: 'cache' | 'file' (預設從配置讀取)
 * - meta: '1' | 'true' (是否包含 metadata)
 * 
 * Headers:
 * - x-internal-token 或 Authorization: Bearer <token> (需與配置的 token 匹配)
 */
router.get('/persona/:npcId', async (req: Request, res: Response) => {
  const config = getPersonaRouteConfig();
  
  // 檢查路由是否啟用
  if (!config.enabled) {
    console.log('🚫 persona_route_disabled');
    return res.status(404).json({
      success: false,
      error: 'persona_route_disabled',
      message: 'Persona route is not enabled'
    });
  }

  // 檢查授權
  if (config.requireToken) {
    const token = req.headers['x-internal-token'] || 
                  (req.headers.authorization?.startsWith('Bearer ') 
                    ? req.headers.authorization.slice(7) 
                    : null);
    
    if (!token || token !== config.token) {
      console.warn('🚫 persona_route_denied: invalid token');
      return res.status(401).json({
        success: false,
        error: 'unauthorized',
        message: 'Invalid or missing authentication token'
      });
    }
  }

  const { npcId } = req.params;
  const source = (req.query.source as 'cache' | 'file') || config.defaultSource || 'cache';
  const includeMeta = req.query.meta === '1' || req.query.meta === 'true';

  // 檢查 npcId 是否存在
  if (!NPC_FILE_MAPPING[npcId]) {
    console.warn(`🚫 persona_route_not_found: ${npcId}`);
    return res.status(404).json({
      success: false,
      error: 'persona_not_found',
      message: `NPC '${npcId}' not found`,
      npcId
    });
  }

  try {
    let content: string;
    let cacheStats: any = undefined;
    let mtimeMs: number | undefined;
    let fromCache: boolean;

    if (source === 'cache') {
      // 從快取讀取
      const result = await personaCacheForRoute.get(npcId);
      content = result.content;
      fromCache = true;
      
      if (includeMeta) {
        cacheStats = personaCacheForRoute.stats();
      }
    } else {
      // 直接從檔案讀取（不污染快取）
      const filename = NPC_FILE_MAPPING[npcId];
      const filePath = path.join(__dirname, '../data/persona', filename);
      
      content = await fs.promises.readFile(filePath, 'utf-8');
      fromCache = false;
      
      if (includeMeta) {
        const stat = await fs.promises.stat(filePath);
        mtimeMs = stat.mtimeMs;
      }
    }

    // 建構回應 payload
    const payload: any = {
      success: true,
      npcId,
      source: fromCache ? 'cache' : 'file'
    };

    // 根據 allowRawContent 決定是否返回完整內容
    if (config.allowRawContent) {
      payload.content = content;
    } else {
      // 僅返回摘要
      const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
      payload.summary = {
        length: content.length,
        preview: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
        hash
      };
    }

    // 添加 metadata
    if (includeMeta) {
      payload.meta = {
        length: content.length,
        hash: crypto.createHash('sha256').update(content).digest('hex'),
        ...(mtimeMs && { mtimeMs }),
        ...(cacheStats && { cacheStats })
      };
    }

    console.log(`✅ persona_route_ok: ${npcId}, source=${source}, length=${content.length}`);
    res.json(payload);

  } catch (error: any) {
    console.error(`❌ persona_route_error: ${npcId}`, error.message);
    res.status(500).json({
      success: false,
      error: 'persona_route_error',
      message: 'Failed to retrieve persona',
      details: error.message
    });
  }
});

export default router;
