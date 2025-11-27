import { getNPCConfig } from './npcConfigManager';
import { KnowledgeSearchResult } from './simpleVectorDB';

/**
 * RAG 語氣轉換 - 將課本式內容轉換成角色語氣
 */
export function convertRAGToRoleTone(
  ragResults: KnowledgeSearchResult[],
  npcId: string
): string {
  const config = getNPCConfig(npcId);
  if (!config || ragResults.length === 0) {
    return '';
  }

  const filteredKnowledge = filterKnowledgeByNPC(ragResults, npcId);
  
  if (filteredKnowledge.length === 0) {
    return '(無相關歷史資料在你的知識範圍內)';
  }

  // 根據角色特性轉換語氣
  const knowledgeText = filteredKnowledge
    .map((result, idx) => {
      let content = result.content;
      
      // 移除課本式的開頭和學術語句
      content = removeAcademicPhrases(content);
      
      // 轉換成角色視角的陳述
      content = convertToRolePerspective(content, npcId);
      
      return `[背景${idx + 1}] ${content}`;
    })
    .join('\n\n');

  // 加上角色視角的前綴說明
  const roleContext = getRoleContextPrefix(npcId);
  
  return `${roleContext}\n\n${knowledgeText}\n\n⚠️ 重要: 以上內容僅供參考,你必須用自己的話、從自己的角色視角來回答,不要直接背誦!`;
}

/**
 * 根據 NPC 角色過濾知識內容
 */
function filterKnowledgeByNPC(
  results: KnowledgeSearchResult[],
  npcId: string
): KnowledgeSearchResult[] {
  const config = getNPCConfig(npcId);
  if (!config) return [];

  return results.filter(result => {
    const contentLower = result.content.toLowerCase();
    
    // 1. 檢查是否包含 NPC 絕對不能回答的主題
    const containsForbidden = config.knowledge.cannotAnswer.some(
      forbidden => {
        const forbiddenLower = forbidden.toLowerCase();
        return contentLower.includes(forbiddenLower);
      }
    );

    if (containsForbidden) {
      console.log(`🗑️  Filtered forbidden topic for ${config.name}: ${result.id}`);
      return false;
    }

    // 2. 優先檢查 npc_role_tag (knowledge_base.json 中的標記)
    if (result.npc_role_tag && Array.isArray(result.npc_role_tag)) {
      const hasRoleTag = result.npc_role_tag.includes(config.role);
      if (hasRoleTag) {
        console.log(`✅ Matched by role tag for ${config.name}: ${result.id}`);
        return true;
      }
    }

    // 3. 檢查知識是否與 NPC 能回答的主題相關
    const isRelevant = config.knowledge.canAnswer.some(
      topic => {
        const topicLower = topic.toLowerCase();
        return contentLower.includes(topicLower);
      }
    );

    if (isRelevant) {
      console.log(`✅ Matched by topic for ${config.name}: ${result.id}`);
    }

    return isRelevant;
  });
}

/**
 * 獲取角色視角的背景說明
 */
function getRoleContextPrefix(npcId: string): string {
  const prefixes: Record<string, string> = {
    student: '以下是你在學校和日常生活中觀察到、聽到的事:',
    police_officer: '以下是你執勤時需要執行的政策和你了解的制度:',
    land_surveyor: '以下是你工作中接觸到的財政和土地政策:'
  };

  return prefixes[npcId] || '以下是相關背景資料:';
}

/**
 * 檢查回答是否包含禁止的教學口吻
 */
export function containsForbiddenTeachingTone(
  response: string,
  npcId: string
): { hasForbidden: boolean; matches: string[] } {
  const config = getNPCConfig(npcId);
  if (!config) {
    return { hasForbidden: false, matches: [] };
  }

  const matches: string[] = [];
  
  // 檢查配置中的禁止短語
  for (const phrase of config.language.forbiddenPhrases) {
    if (response.includes(phrase)) {
      matches.push(phrase);
    }
  }

  // 額外檢查一些常見的教學口吻變體
  const additionalPatterns = [
    /讓我[來為給]?[你們]?[解釋說明介紹]/,
    /讓我們[一起來]?[看討論探討分析]/,
    /從.*[角度觀點立場].*[來]?[看說講]/,
    /根據[史料歷史文獻記載]/,
    /這是一個[很]?(重要|複雜|有趣|關鍵)的/
  ];

  for (const pattern of additionalPatterns) {
    const match = response.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }

  return {
    hasForbidden: matches.length > 0,
    matches
  };
}

/**
 * 移除課本式的說明句型
 */
export function removeAcademicPhrases(text: string): string {
  const academicPatterns = [
    /^讓我[們]?(來|為你|給你)?[解釋說明介紹討論]/g,
    /^從.*[角度觀點]來?[看說]/g,
    /^這是一個[很]?(重要|複雜|有趣)的[問題話題]/g,
    /^根據(史料|歷史|文獻|記載)/g,
    /^歷史上.*[記載顯示表明]/g,
    /我們(今天|現在)要?[來]?[討論學習了解]/g,
    // 新增更多課本式開頭
    /^總督府.*為了/g,
    /^日本.*為配合/g,
    /此.*[政策制度運動].*旨在/g,
    /這.*反映了/g
  ];

  let cleaned = text;
  
  for (const pattern of academicPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  return cleaned.trim();
}

/**
 * 將歷史知識轉換成角色視角的陳述
 */
function convertToRolePerspective(text: string, npcId: string): string {
  const config = getNPCConfig(npcId);
  if (!config) return text;

  let converted = text;

  // 通用轉換: 移除課本式組織名稱開頭
  converted = converted
    .replace(/^總督府/g, '政府')
    .replace(/總督府為了/g, '政府為了')
    .replace(/總督府實施/g, '政府推行')
    .replace(/總督府建立/g, '政府建立')
    .replace(/總督府透過/g, '政府用')
    .replace(/總督府藉由/g, '政府靠');

  // 根據不同角色轉換陳述方式
  switch (npcId) {
    case 'student':
      // 學生視角: 轉換成「我看到/聽到」的描述
      converted = converted
        .replace(/政府在/g, '他們在')
        .replace(/政府推行/g, '他們要我們')
        .replace(/政府建立了/g, '他們建了')
        .replace(/日本.*[推動實施]/g, '日本人要我們')
        .replace(/警察.*[管理控制執行]/g, '警察大人管')
        .replace(/此政策/g, '這些事')
        .replace(/該制度/g, '這個規矩')
        .replace(/實施|推行/g, '做')
        .replace(/建立|設立/g, '弄');
      break;

    case 'police_officer':
      // 警察視角: 轉換成「執行命令」的口吻
      converted = converted
        .replace(/政府.*[頒布實施推行]/g, '總督大人命令')
        .replace(/政府為了/g, '為了')
        .replace(/為了.*目的/g, '為了維持秩序')
        .replace(/此舉.*使/g, '這樣做讓')
        .replace(/政策.*[強調主張]/g, '命令就是')
        .replace(/臺灣人|台灣人/g, '本島人')
        .replace(/使得|導致/g, '讓')
        .replace(/實施|推行/g, '執行');
      break;

    case 'land_surveyor':
      // 測量員視角: 轉換成「工作任務」的描述
      converted = converted
        .replace(/政府進行/g, '我們負責')
        .replace(/政府為了提高/g, '為了增加')
        .replace(/調查.*[確定建立]/g, '調查並記錄')
        .replace(/為增加.*收入/g, '為了提高稅收')
        .replace(/使得.*增加/g, '結果增加了')
        .replace(/此舉.*造成/g, '這樣做導致')
        .replace(/實施|推行/g, '進行')
        .replace(/建立|設立/g, '建');
      break;
  }

  // 通用轉換: 移除過於正式的用語
  converted = converted
    .replace(/然而/g, '但是')
    .replace(/因此/g, '所以')
    .replace(/透過/g, '用')
    .replace(/藉由/g, '靠')
    .replace(/實質上/g, '其實')
    .replace(/顯示/g, '表示')
    .replace(/體現/g, '代表')
    .replace(/奠定/g, '打下')
    .replace(/促進/g, '幫助')
    .replace(/強化/g, '加強');

  return converted;
}

/**
 * 檢查是否為自我介紹句
 */
export function isSelfIntroduction(text: string, npcName: string): boolean {
  // 移除空格,以便更準確匹配
  const cleanText = text.replace(/\s+/g, '');
  const cleanName = npcName.replace(/\s+/g, '');
  
  const introPatterns = [
    `我是${cleanName}`,
    `我叫${cleanName}`,
    `我的名字是${cleanName}`,
    `我叫做${cleanName}`,
    `${cleanName}是我`,
    // 通用模式
    '我是一位',
    '我是一個',
    '我在這裡負責',
    '我的職責是',
    '我是這裡的',
    '我負責'
  ];

  return introPatterns.some(pattern => cleanText.includes(pattern));
}
