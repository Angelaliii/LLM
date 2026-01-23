/**
 * Mission: Rights and Land Under Japanese Rule: Historical Restoration Task
 * Era: Early Japanese Period (1905)
 */

export interface Stage {
  id: string;
  type: 'explore' | 'key_question' | 'summary';
  title: string;
  description: string;
  question: string;
  keywords: string[];
  availableNPCs: string[];
  hint?: string;
  completionNote: string;
  requiredKnowledgeIds: string[]; // Corresponds to knowledge_base.json id
}

export interface MissionData {
  id: string;
  title: string;
  period: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  description: string;
  mainGoal: string;
  
  // Player persona
  playerPersona: {
    name: string;
    role: string;
    backgroundStory: string;
    relationships: string[];
  };
  
  // Stages
  stages: Stage[];
  
  // Learning goals
  learningGoals: string[];
  
  // Related knowledge IDs
  relatedKnowledgeIds: string[];
}

export const tainanColonialRuleMission: MissionData = {
  id: 'E2',
  title: 'Rights and Land Under Japanese Rule: Historical Restoration Task',
  period: 'Early Japanese Period (1905)',
  difficulty: 'Intermediate',
  estimatedTime: '15-20 minutes',
  description: 'Become a junior official at the Governor-General\'s Office and explore how Japan established a repressive yet fiscally self-sufficient colonial governance system through law, police systems, and financial means.',
  mainGoal: 'Understand how the Japanese government, in a short time, established a repressive and fiscally self-sufficient colonial system through legal and economic means, while grasping its colonial philosophy.',
  
  playerPersona: {
    name: 'Suzuki',
    role: 'Junior Official at Taiwan Governor-General\'s Office (Local Assistant)',
    backgroundStory: 'You were just assigned to Taiwan in 1905 to assist with civil administration in the Tainan area. Though your rank is not high, you understand that the Governor-General\'s power derives from \"Law Number 63\" (the 63 Law). Your task is to ensure the basic colonial system operates smoothly and maintain stable fiscal revenues to achieve the colony\'s goal of financial self-sufficiency.',
    relationships: [
      'Japanese Police Officer Sato Keiichi: Your colleague responsible for local law enforcement. His power is immense, commanding your respect.',
      'Land Surveyor Yamamoto Kansuke: Your colleague, primarily responsible for complex land surveys and forest inventory.',
      'Taiwan Student Xiaojing: A student at the local public school, evidence of the government\'s modern education implementation, offering perspective on grassroots life.'
    ]
  },
  
  stages: [
    {
      id: 'stage_1_intro',
      type: 'explore',
      title: 'Stage 1: The Basis of Law and Power',
      description: 'You just arrived in Tainan city center, one of the colonial power centers in the early period. You see your colleague, Japanese Police Officer Sato, instructing several Taiwan citizens.',
      question: 'Ask NPCs to understand how the colonial government achieved absolute political power.',
      keywords: ['Governor-General Autocracy', '63 Law', 'Military Governor', 'Law Number 63'],
      availableNPCs: ['police_officer', 'student', 'land_surveyor'],
      hint: 'Police Officer Sato should best understand the legal and power execution. You could ask him about the \"63 Law\" first.',
      completionNote: 'You\'ve grasped the legal foundation of rule. However, to deeply understand policy, you need to know the philosophy and repressive means behind it.',
      requiredKnowledgeIds: ['JP002']
    },
    {
      id: 'stage_1_5_philosophy',
      type: 'key_question',
      title: 'Stage 2: Ruling Philosophy and Repressive Measures',
      description: 'You now understand the Governor-General\'s legal foundation. Now explore the ruling philosophy behind these systems and the harsh measures used to suppress resistance in the early period.',
      question: 'What was the government\'s ruling philosophy in the early colonial period? What was the most severe law they used to suppress resistance?',
      keywords: ['Goto Shinpei', 'Biological Principles', 'Bandit Punishment Ordinance', 'Custom Survey'],
      availableNPCs: ['police_officer', 'land_surveyor'],
      completionNote: 'You successfully understood Goto Shinpei\'s biological principles and the Bandit Punishment Ordinance. This laid the foundation for implementing grassroots control. Move to the next task.',
      requiredKnowledgeIds: ['JP003', 'JP029']
    },
    {
      id: 'stage_2_power',
      type: 'key_question',
      title: 'Stage 3: Grassroots Social Control',
      description: 'Now you must clarify how this power penetrated Taiwan\'s most basic social corners.',
      question: 'Besides the central Governor-General\'s Office, what methods did they use to control Taiwan\'s most grassroots social areas?',
      keywords: ['Police Politics', 'Baojia System', 'Strong Youth Corps', 'Collective Punishment Law'],
      availableNPCs: ['police_officer', 'student'],
      completionNote: 'You successfully understood grassroots control methods. Implementing these strict controls requires enormous funding. Now explore how the government raised funds.',
      requiredKnowledgeIds: ['JP004']
    },
    {
      id: 'stage_3_finance',
      type: 'key_question',
      title: 'Stage 4: Establishing the Financial Foundation',
      description: 'You\'ve grasped political control measures. Now, your second task is to clarify the colonial government\'s financial foundation. The colony must be fiscally self-sufficient, and land surveying and monopoly systems are key clues.',
      question: 'How was the colonial government\'s main revenue established in the early period? (Hint: Include two main methods)',
      keywords: ['Land Survey', 'Monopoly System', 'Land Tax', 'Forest Inventory', 'Opium Monopoly', 'Camphor Monopoly'],
      availableNPCs: ['land_surveyor', 'police_officer', 'student'],
      hint: 'Land Surveyor Yamamoto is responsible for surveying and tax collection. Police Officer Sato enforces monopoly products. You need to ask both to get complete revenue clues.',
      completionNote: 'Excellent! You understand the colony\'s main revenue sources.',
      requiredKnowledgeIds: ['JP008', 'JP009']
    },
    {
      id: 'stage_3_5_infrastructure',
      type: 'explore',
      title: 'Stage 5: Modern Infrastructure Development',
      description: 'You now understand the colony\'s main revenue sources. Now investigate what infrastructure the government undertook using these funds to aid rule and modernization.',
      question: 'Ask NPCs what important infrastructure the Governor-General\'s Office built in finance and transportation.',
      keywords: ['North-South Railway', 'Bank of Taiwan', 'Unified Currency', 'Port Construction'],
      availableNPCs: ['land_surveyor', 'student'],
      completionNote: 'Congratulations! You\'ve mastered all core information about the colonial system: politics, social control, finance, and infrastructure. You can now begin your summary report.',
      requiredKnowledgeIds: ['JP010']
    },
    {
      id: 'stage_4_summary',
      type: 'summary',
      title: 'Final Stage: Summary Report',
      description: 'You\'ve completed all investigations. Now submit a concise report to the Governor-General\'s Office summarizing your understanding of the colonial rule foundation.',
      question: 'Use three core policies or systems (law, social control, finance) to summarize how the colonial governance system was established during this period.',
      keywords: ['Governor-General Autocracy', 'Police Politics', 'Land Survey', '63 Law', 'Baojia System', 'Monopoly System'],
      availableNPCs: ['police_officer'],
      completionNote: 'Mission complete! You\'ve comprehensively understood how the colonial governance system was established in the early Japanese period.',
      requiredKnowledgeIds: ['JP002', 'JP004', 'JP008', 'JP009']
    }
  ],
  
  learningGoals: [
    'Understand how \"Law Number 63\" granted the Governor-General absolute power',
    'Recognize Goto Shinpei\'s \"biological principles\" governing philosophy',
    'Understand how police politics and the baojia system controlled grassroots society',
    'Master how land surveys and monopoly systems established the financial foundation',
    'Recognize early Japanese period modern infrastructure development',
    'Comprehensively evaluate the dual characteristics of \"colonization\" and \"modernization\" in colonial rule'
  ],
  
  relatedKnowledgeIds: [
    'JP002', // Establishment of colonial system and Governor-General autocracy
    'JP003', // Goto Shinpei and governing principles
    'JP004', // Police politics and baojia system operations
    'JP008', // Land, forest surveys and fiscal reform
    'JP009', // Monopoly systems and substantial revenue
    'JP010', // Transportation and financial infrastructure
    'JP029', // Bandit Punishment Ordinance and repressive rule
  ]
};
