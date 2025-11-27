/**
 * RAG 語氣過濾測試
 * 驗證知識庫檢索和角色視角轉換
 */

import { initializeVectorDB, searchKnowledge } from './services/simpleVectorDB';
import { convertRAGToRoleTone } from './services/ragToneFilter';
import { getNPCConfig } from './services/npcConfigManager';

async function testRAGFilter() {
  console.log('🧪 開始測試 RAG 語氣過濾...\n');

  // 初始化向量資料庫
  console.log('📚 初始化知識庫...');
  await initializeVectorDB();
  console.log('');

  // 測試案例
  const testCases = [
    {
      npcId: 'student',
      query: '警察在地方上怎麼管理?',
      expectedTopics: ['警察政治', '保甲制度']
    },
    {
      npcId: 'police_officer',
      query: '六三法是什麼?',
      expectedTopics: ['法律第六十三號', '總督專制']
    },
    {
      npcId: 'land_surveyor',
      query: '土地調查的目的是什麼?',
      expectedTopics: ['土地調查', '田賦收入']
    }
  ];

  for (const [idx, testCase] of testCases.entries()) {
    const config = getNPCConfig(testCase.npcId);
    if (!config) continue;

    console.log('='.repeat(70));
    console.log(`\n📝 測試 ${idx + 1}: ${config.name} - 「${testCase.query}」\n`);

    // 1. 檢索知識
    console.log('🔍 Step 1: 檢索相關知識...');
    const rawResults = await searchKnowledge(testCase.query, {
      npcRole: config.role,
      topK: 3,
      minSimilarity: 0.3
    });

    console.log(`   找到 ${rawResults.length} 條相關知識:`);
    rawResults.forEach((r, i) => {
      console.log(`   ${i + 1}. [${r.id}] 相似度: ${r.similarity.toFixed(3)}`);
      console.log(`      類別: ${r.category}`);
      console.log(`      角色標籤: ${r.npc_role_tag.join(', ')}`);
      console.log(`      內容預覽: ${r.content.substring(0, 60)}...`);
    });

    // 2. 轉換成角色語氣
    console.log('\n🎭 Step 2: 轉換成角色語氣...');
    const convertedRAG = convertRAGToRoleTone(rawResults, testCase.npcId);
    
    if (convertedRAG) {
      console.log('   轉換結果:');
      console.log('   ' + '-'.repeat(60));
      console.log(convertedRAG.split('\n').map(line => '   ' + line).join('\n'));
      console.log('   ' + '-'.repeat(60));
    } else {
      console.log('   ⚠️  無相關知識或被過濾');
    }

    // 3. 檢查是否包含禁止的學術語句
    console.log('\n✅ Step 3: 檢查品質...');
    const forbiddenPhrases = [
      '根據史料',
      '總督府實施',
      '此政策旨在',
      '歷史上',
      '讓我們來看'
    ];

    const foundForbidden = forbiddenPhrases.filter(phrase => 
      convertedRAG.includes(phrase)
    );

    if (foundForbidden.length > 0) {
      console.log(`   ❌ 發現禁止用語: ${foundForbidden.join(', ')}`);
    } else {
      console.log('   ✅ 沒有課本式語句');
    }

    console.log('\n');
  }

  console.log('='.repeat(70));
  console.log('\n✅ RAG 語氣過濾測試完成!\n');

  // 顯示統計資訊
  console.log('📊 知識庫統計:');
  const { getKnowledgeStats } = require('./services/simpleVectorDB');
  const stats = getKnowledgeStats();
  console.log(`   總條目數: ${stats.totalEntries}`);
  console.log(`   類別分布:`);
  Object.entries(stats.categories).forEach(([cat, count]) => {
    console.log(`     - ${cat}: ${count}`);
  });
  console.log(`   NPC 角色分布:`);
  Object.entries(stats.npcRoles).forEach(([role, count]) => {
    console.log(`     - ${role}: ${count}`);
  });
}

// 執行測試
testRAGFilter().catch(error => {
  console.error('❌ 測試失敗:', error);
  process.exit(1);
});
