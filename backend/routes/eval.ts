import express from 'express';
import { evaluateProgress } from '../services/progressEval';
import { e2Chunks, e2Npcs, e2Quizzes } from '../data/missions/e2-industrial-agri';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { missionId, conversationSummary } = req.body;

    // For now load learning goals text from mission quizzes (if missionId matches E2)
    // In a more complete implementation we'd read missions index by missionId.
    const goals = (e2Quizzes || []).slice(0, 6).map((q, i) => `${i + 1}. ${q.stem}`);
    const learningGoalsText = goals.join('\n');

    const evalResult = await evaluateProgress({ missionId, learningGoalsText, conversationSummary });
    res.json({ ok: true, eval: evalResult });
  } catch (err) {
    console.error('eval error', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
