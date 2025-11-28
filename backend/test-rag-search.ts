/**
 * RAG 搜尋測試腳本
 */

import { searchKnowledge, initializeVectorDB } from './services/simpleVectorDB';

async function main() {
  console.log('='.repeat(80));
  console.log('🔍 RAG 搜尋測試 - 驗證知識庫檢索功能');
  console.log('='.repeat(80));
  console.log();

  // 初始化向量資料庫
  console.log('📚 初始化向量資料庫...');
  try {
    await initializeVectorDB();
    console.log('✅ 向量資料庫初始化完成\n');
  } catch (error: any) {
    console.log('❌ 初始化失敗:', error.message);
    return;
  }

  // 測試查詢
  const testQueries = [
    { query: '六三法是什麼?', role: '警察' },
    { query: '警察如何控制台灣社會?', role: '警察' },
    { query: '土地調查的目的是什麼?', role: '土地測量員' },
    { query: '保甲制度如何運作?', role: '學生' }
  ];

  console.log('🔍 開始測試 RAG 搜尋...\n');
  console.log('='.repeat(80));

  for (const test of testQueries) {
    console.log(`\n📝 問題: "${test.query}"`);
    console.log(`👤 角色: ${test.role}`);
    console.log('-'.repeat(80));
    
    try {
      const results = await searchKnowledge(test.query, {
        npcRole: test.role,
        topK: 3,
        minSimilarity: 0.3
      });
      
      if (results.length > 0) {
        console.log(`✅ 找到 ${results.length} 條相關知識:\n`);
        results.forEach((result, idx) => {
          console.log(`   ${idx + 1}. 知識 ID: ${result.id}`);
          console.log(`      相似度: ${(result.similarity * 100).toFixed(1)}%`);
          console.log(`      分類: ${result.category}`);
          console.log(`      適用角色: ${result.npc_role_tag.join(', ')}`);
          console.log(`      內容: ${result.content.substring(0, 100)}...`);
          console.log();
        });
      } else {
        console.log('❌ 未找到相關知識');
      }
    } catch (error: any) {
      console.log(`❌ 搜尋失敗: ${error.message}`);
    }
  }

  console.log('='.repeat(80));
  console.log('✅ RAG 搜尋測試完成');
  console.log('='.repeat(80));
}

main().catch(console.error);
