import express from 'express';

const router = express.Router();

// 取得所有任務列表
router.get('/', (req, res) => {
  try {
    // 目前使用靜態資料，之後可以從資料庫讀取
    const missions = [
      {
        id: 'E2',
        title: '臺南：六法下的權力與土地',
        period: '日治時期 (1895-1945)',
        difficulty: 'intermediate',
        description: '探索日治時期糖業經濟的複雜面貌',
        estimatedTime: 45
      }
    ];

    res.json({
      success: true,
      missions,
      count: missions.length
    });
  } catch (error) {
    console.error('取得任務列表錯誤:', error);
    res.status(500).json({
      success: false,
      error: '無法取得任務列表'
    });
  }
});

// 取得特定任務詳細資料
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === 'E2') {
      // 之後從 backend/data/missions/e2-industrial-agri.ts 讀取
      const mission = {
        id: 'E2',
        title: '臺南：六法下的權力與土地',
        period: '日治時期 (1895-1945)',
        difficulty: 'intermediate',
        chunks: [], // 稍後從檔案讀取
        npcs: [],   // 稍後從檔案讀取
        learningGoals: [], // 稍後從檔案讀取
        quizzes: [] // 稍後從檔案讀取
      };

      res.json({
        success: true,
        mission
      });
    } else {
      res.status(404).json({
        success: false,
        error: '找不到指定的任務'
      });
    }
  } catch (error) {
    console.error('取得任務詳細資料錯誤:', error);
    res.status(500).json({
      success: false,
      error: '無法取得任務詳細資料'
    });
  }
});

export default router;