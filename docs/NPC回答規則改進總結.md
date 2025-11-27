# NPC 回答規則改進總結

## 📌 改進目標
將 NPC 從「課本式 AI 歷史老師」轉變為「1905 年劇本殺角色」

## 🔥 實作的 8 大核心功能

### 1. NPC 知識白名單/黑名單系統
**檔案:** `backend/types/persona.ts`, `backend/services/npcConfigManager.ts`

每個 NPC 都有明確的知識範圍:
- ✅ **can_answer[]** - 能回答的主題清單
- ❌ **cannot_answer[]** - 絕對不能答的主題
- 📍 **knowledge_source** - 知識來源(日常生活/工作觀察/執勤職責)

#### 範例:小清(學生)
```typescript
canAnswer: [
  '公學校生活', '日語學習', '警察的干預',
  '陋習取締', '家庭生活', '村里氛圍'
]
cannotAnswer: [
  '六三法的法律細節', '日本帝國政策',
  '土地調查技術', '財政政策'
]
```

---

### 2. 話題轉接規則
**檔案:** `backend/services/npcConfigManager.ts`

當玩家問到 NPC 不懂的領域時,自動引導到對應的 NPC:

```typescript
redirectRules: {
  '六三法': {
    targetNPC: 'police_officer',
    redirectPhrase: '『六三法』是什麼?我只知道老師說要聽總督大人的話。你可以去問**警察佐藤**。'
  },
  '土地調查': {
    targetNPC: 'land_surveyor',
    redirectPhrase: '測量土地是大人們的事,你應該去問**土地測量員山本**。'
  }
}
```

#### 引導規則:
- 治安/保甲 → 警察佐藤
- 土地改革/地籍 → 測量員山本
- 學校/家庭生活 → 學生小清

---

### 3. 自我介紹檢測與過濾
**檔案:** `backend/services/ragToneFilter.ts`, `backend/services/gameService.ts`

**問題:** NPC 每次對話都說「我是小清!」

**解決方案:**
```typescript
// 檢測自我介紹句
function isSelfIntroduction(text: string, npcName: string): boolean {
  const patterns = [
    `我是${npcName}`, `我叫${npcName}`,
    '我是一位', '我的職責是'
  ];
  return patterns.some(p => text.includes(p));
}

// 在對話歷史過濾中移除
function filterConversationHistory(...) {
  // 第一輪保留,後續過濾掉
  if (idx > 1 && isSelfIntroduction(msg.content, npcName)) {
    return false; // 不納入歷史
  }
}
```

---

### 4. 教學口吻檢測
**檔案:** `backend/services/ragToneFilter.ts`

**禁止的教學口吻:**
- ❌ 「我們今天要討論歷史」
- ❌ 「讓我來解釋一下」
- ❌ 「從歷史角度來看」
- ❌ 「根據史料記載」

**實作:**
```typescript
function containsForbiddenTeachingTone(response, npcId) {
  const patterns = [
    /讓我[來為給]?[你們]?[解釋說明]/,
    /從.*[角度觀點].*[來]?[看說]/,
    /根據[史料歷史文獻]/
  ];
  // 檢測並返回問題語句
}
```

---

### 5. RAG 語氣過濾器
**檔案:** `backend/services/ragToneFilter.ts`

**問題:** RAG 內容直接塞進 prompt → NPC 用課本語氣背誦

**解決方案: 3 步驟處理**

#### Step 1: 根據 NPC 過濾知識
```typescript
function filterKnowledgeByNPC(results, npcId) {
  return results.filter(result => {
    // 檢查是否包含 NPC 不能回答的主題
    const containsForbidden = config.knowledge.cannotAnswer
      .some(topic => result.content.includes(topic));
    
    return !containsForbidden && isRelevant;
  });
}
```

#### Step 2: 移除課本式語句
```typescript
function removeAcademicPhrases(text) {
  const patterns = [
    /^讓我[們]?[來]?[解釋說明]/g,
    /^從.*[角度觀點]來?[看說]/g,
    /^根據(史料|歷史|文獻)/g
  ];
  // 清除這些開頭
}
```

#### Step 3: 轉換成角色視角
```typescript
function convertRAGToRoleTone(ragResults, npcId) {
  const roleContext = {
    'student': '以下是你在學校和日常生活中觀察到的事:',
    'police_officer': '以下是你執勤時需要執行的政策:',
    'land_surveyor': '以下是你工作中接觸到的財政政策:'
  };
  
  return `${roleContext[npcId]}\n${filteredKnowledge}`;
}
```

---

### 6. 對話歷史過濾
**檔案:** `backend/services/gameService.ts`

**過濾規則:**
1. 移除重複的自我介紹(第一輪後)
2. 移除包含大量教學口吻的回答
3. 只保留最近 5 輪對話(避免 context 過長)

```typescript
function filterConversationHistory(history, npcId, maxTurns = 5) {
  return history
    .filter(msg => {
      // 保留用戶訊息
      if (msg.role === 'user') return true;
      
      // 過濾 NPC 的自我介紹
      if (isSelfIntroduction(msg.content, npcName)) return false;
      
      // 過濾教學口吻過多的回答
      const { hasForbidden, matches } = containsForbiddenTeachingTone(...);
      if (hasForbidden && matches.length >= 2) return false;
      
      return true;
    })
    .slice(-maxTurns * 2); // 只保留最近 N 輪
}
```

---

### 7. 強化版 System Prompt
**檔案:** `backend/services/gameService.ts`

**新增的嚴格規則:**

```typescript
async function buildSystemPrompt(npcId, userQuery, conversationTurns) {
  return `
# 🔥 NPC 回答規則 — 必須強制執行

## 1. 身份限制
- 你**只能**以「${npcName}」的身份回應
- **禁止**像老師、學者或 AI 助手的口吻
- **禁止**使用這些教學口吻: ${forbiddenPhrases}

## 2. 自我介紹規則
${conversationTurns === 0 ? 
  '- 這是第一輪對話,你可以簡單介紹自己(1句話)' : 
  '- **禁止**重複自我介紹,不要再說「我是XX」'}

## 3. 知識範圍限制
你**只能**回答以下主題:
${config.knowledge.canAnswer.map(t => \`  • \${t}\`).join('\\n')}

你**絕對不能**回答:
${config.knowledge.cannotAnswer.map(t => \`  • \${t}\`).join('\\n')}

## 4. 知識來源限制
你的回答**只能**來自:
✓ 你的日常生活觀察 / 工作經驗 / 執勤職責
✓ 眼睛看到、耳朵聽到的事情
✗ **不能**引用「史料」「文獻」或用學者口吻

${redirectCheck.shouldRedirect ? \`
## 5. 🚨 此問題需轉接
「${redirectPhrase}」
**不要**嘗試回答,直接引導轉接!
\` : ''}

# 歷史背景參考
${convertedRAG}  // 已經過語氣轉換的 RAG

# 回答格式要求
1. **口語化、簡短** - 2~3 句話 (${maxLength} 字以內)
2. 語氣: ${tone描述}
3. **不懂就老實說不知道**,然後引導去找其他 NPC
  `;
}
```

---

### 8. 回答品質檢查
**檔案:** `backend/services/gameService.ts`

生成回答後,自動檢查品質:

```typescript
function checkResponseQuality(response, npcId) {
  const issues = [];
  
  // 檢查自我介紹
  if (isSelfIntroduction(response, npcName)) {
    issues.push('contains_self_intro');
  }
  
  // 檢查教學口吻
  const { hasForbidden, matches } = containsForbiddenTeachingTone(...);
  if (hasForbidden) {
    issues.push(\`teaching_tone: \${matches.join(',')}\`);
  }
  
  // 檢查長度
  if (response.length > maxLength * 1.5) {
    issues.push('too_long');
  }
  
  // 檢查現代詞彙
  const modernWords = ['民主', '人權', 'AI', '手機'];
  const found = modernWords.filter(w => response.includes(w));
  if (found.length > 0) {
    issues.push(\`modern_words: \${found.join(',')}\`);
  }
  
  // 計算品質分數 (1.0 = 完美)
  const score = Math.max(0, 1.0 - (issues.length * 0.2));
  
  return { hasIssues: issues.length > 0, issues, score };
}
```

回答會帶上 `qualityScore`,可用於:
- 選擇更好的回答
- 記錄回答品質統計
- 觸發重新生成(如果分數太低)

---

## 📊 三位 NPC 的配置

### 👧 小清(學生)
- **語氣:** 天真、好奇、有點害怕權威
- **知識:** 公學校生活、警察干預、陋習取締
- **不懂:** 法律細節、土地政策、帝國政策
- **轉接:** 六三法→警察 / 土地→測量員

### 👮 佐藤敬一(警察)
- **語氣:** 威嚴、命令、不耐煩
- **知識:** 六三法、保甲制度、治安管理
- **不懂:** 土地調查、財稅、測量技術
- **轉接:** 土地→測量員 / 學校→小清

### 📐 山本勘助(測量員)
- **語氣:** 務實、專業、專注數據
- **知識:** 土地調查、田賦、專賣制度
- **不懂:** 治安管理、法律執行、學生生活
- **轉接:** 保甲→警察 / 生活→小清

---

## 🧪 測試結果

執行 `npx ts-node test-npc-rules.ts`:

✅ **測試 1:** NPC 配置載入 - 3/3 通過
✅ **測試 2:** 話題轉接檢查 - 5/5 通過
✅ **測試 3:** 自我介紹檢測 - 5/5 通過
✅ **測試 4:** 教學口吻檢測 - 4/4 通過
✅ **測試 5:** 知識範圍檢查 - 全部正常

---

## 📁 修改的檔案清單

### 新增檔案:
1. `backend/services/npcConfigManager.ts` - NPC 配置管理器
2. `backend/services/ragToneFilter.ts` - RAG 語氣過濾器
3. `backend/test-npc-rules.ts` - 測試腳本

### 修改檔案:
1. `backend/types/persona.ts` - 新增 NPCGameConfig 介面
2. `backend/services/gameService.ts` - 重構對話處理邏輯
3. `backend/services/gameService.ts` - 新增 filterConversationHistory
4. `backend/services/gameService.ts` - 重寫 buildSystemPrompt
5. `backend/services/gameService.ts` - 新增 checkResponseQuality

---

## 🎯 使用效果

### 改進前:
```
玩家: 警察在地方上都怎麼管理?
NPC: 我是小清!讓我們來討論一下日治時期的警察政治。
     根據史料記載,臺灣總督府建立了保甲制度...
     (200字課本式解說)
```

### 改進後:
```
玩家: 警察在地方上都怎麼管理?
小清: 警察大人很兇!他們會叫我們大人組織「壯丁團」。
      十戶人家變成一甲,甲長會幫警察管我們,很害怕。
      你想知道更多,去問**警察佐藤**吧!
```

---

## 🚀 如何使用

### 1. 重啟後端伺服器
```bash
cd backend
npm run dev
```

### 2. API 會自動載入新規則
- NPC 配置會在 `handleGameChat` 中自動應用
- 對話歷史會自動過濾
- RAG 內容會自動轉換語氣
- 回答品質會自動檢查

### 3. 前端無需修改
- API 回傳格式相同
- 新增 `qualityScore` 欄位(可選用)

---

## 📝 工程師檢查清單

- [x] NPC 知識白名單/黑名單
- [x] 話題轉接引導規則
- [x] 自我介紹過濾
- [x] 教學口吻檢測
- [x] RAG 語氣轉換
- [x] 對話歷史過濾
- [x] 強化 System Prompt
- [x] 回答品質檢查
- [x] 單元測試通過

---

## 🎭 結論

NPC 現在能像 **1905 年劇本殺角色** 一樣回答了!

**核心改變:**
1. ❌ 不再是「AI 歷史老師」
2. ✅ 變成「活在 1905 年的角色」
3. ✅ 只說自己知道的事
4. ✅ 不懂就引導轉接
5. ✅ 口語化、簡短、有角色特色

**RAG Pipeline 改進:**
```
原本: RAG內容 → 直接塞進prompt → NPC用課本語氣背誦
現在: RAG內容 → 過濾(NPC知識範圍) → 轉換語氣 → NPC用角色口吻回答
```

**對話歷史改進:**
```
原本: 所有對話都帶回 → NPC重複自我介紹
現在: 過濾自介和教學口吻 → NPC不再重複
```

🎉 **完成!**
