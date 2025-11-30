import { Router, Request, Response } from 'express';
import { handleGameChat, GameChatRequest, summarizeConversation } from '../services/gameService';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

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

export default router;
