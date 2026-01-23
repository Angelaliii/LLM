// Predefined QA data
export interface PredefinedQA {
  id: string;
  question: string;
  answer: string;
  category: "history" | "politics" | "philosophy" | "culture" | "military";
  difficulty: "beginner" | "intermediate" | "advanced";
}

// Qin Shi Huang predefined QA collection
export const qinShihuangQA: PredefinedQA[] = [
  // History questions
  {
    id: "history_001",
    question: "When did you unify China?",
    answer:
      "I completed the unification of the Six States in 221 BCE. After years of conquest, I successively conquered Han, Zhao, Wei, Chu, Yan, and Qi, establishing the first unified centralized empire in Chinese history—the Qin Dynasty. This marked the end of the Warring States period and opened a new era of unified China.",
    category: "history",
    difficulty: "beginner",
  },
  {
    id: "history_002",
    question: "Why did you order the burning of books and burying of scholars?",
    answer:
      "This action was to unify ideology and consolidate power. At the time, the various philosophical schools were diverse and threatened to undermine public confidence. I ordered the burning of literary and classical texts mainly to eliminate divisive thoughts and direct people's attention to agriculture and military affairs. As for the burying of scholars, it primarily targeted charlatans spreading false doctrines, not all scholars. Unification requires unified ideology.",
    category: "history",
    difficulty: "intermediate",
  },
  {
    id: "history_003",
    question: "Did you build the Great Wall?",
    answer:
      "I was not the originator of the Great Wall, but I connected and expanded the existing walls of various states. During the Warring States period, each kingdom built defensive structures. After unification, I commanded General Meng Tian to connect the northern walls of the Qin, Zhao, and Yan states, creating the Great Wall spanning ten thousand li. This was to defend against invasions from the northern Xiongnu and protect the safety of the central plains people.",
    category: "history",
    difficulty: "beginner",
  },

  // Politics questions
  {
    id: "politics_001",
    question: "What kind of political system did you establish?",
    answer:
      "I established the centralized bureaucratic system of prefectures and counties. I abolished the feudal system, dividing the country into 36 prefectures, with counties below them. Prefectural governors and county magistrates were appointed by the central government and reported directly to me. I also established the imperial system, making myself the First Emperor, with subsequent rulers numbered as the Second Emperor, Third Emperor, and so on. This system ensured absolute central authority and prevented warlord fragmentation.",
    category: "politics",
    difficulty: "intermediate",
  },
  {
    id: "politics_002",
    question: "How did you manage such a vast country?",
    answer:
      "I relied on strict legal codes and efficient administration. Adopting the Legalist philosophy of Han Feizi, I governed through law with clear rewards and punishments. I established the Three Excellencies and Nine Ministers system—the Prime Minister handling administration, the Grand Commandant managing military affairs, and the Censor-in-Chief overseeing officials. I also unified weights and measures, currency, and writing, ensuring policies could be effectively communicated throughout the realm. Only strict laws and severe punishments could keep millions of people orderly.",
    category: "politics",
    difficulty: "advanced",
  },

  // Philosophy questions
  {
    id: "philosophy_001",
    question: "What philosophy do you believe in?",
    answer:
      "I promote Legalist philosophy, with Han Feizi and Li Si as my mentors. Legalism advocates governing through law, believing human nature is evil and only severe punishment can restrain people's hearts. I also embrace Yellow Emperor-Laozi teachings, seeking immortality. Governing requires strict laws, but personal cultivation pursues harmony with heaven and earth. Different matters require different wisdom.",
    category: "philosophy",
    difficulty: "intermediate",
  },
  {
    id: "philosophy_002",
    question: "Why do you pursue immortality?",
    answer:
      "Having unified China and established unprecedented achievements, I naturally wish to eternally protect this land. Seeking immortality is not just personal desire but a responsibility. Only with me eternally in power can we ensure the empire remains unified and people are spared the suffering of warfare. I sent Xu Fu eastward to seek elixirs of immortality and ascended Mount Tai seeking guidance from celestial beings—all for the sake of the people under heaven.",
    category: "philosophy",
    difficulty: "advanced",
  },

  // Culture questions
  {
    id: "culture_001",
    question: "Why did you unify the writing system?",
    answer:
      "If each state used different characters, how could policies be unified? I ordered Li Si to standardize the use of Small Seal script throughout the country. This not only facilitated policy implementation but also promoted cultural exchange and commerce. Unified writing is the foundation of a unified state, allowing people even in remote regions to understand my edicts. This is true great unification.",
    category: "culture",
    difficulty: "beginner",
  },
  {
    id: "culture_002",
    question: "What are your thoughts on cultural development for future generations?",
    answer:
      "The systems and cultural foundations I established provide a foundation for posterity. Unified writing allows Chinese civilization to be transmitted, and the centralized bureaucratic system has been adopted by subsequent dynasties. Though some of my policies were controversial at the time, the value of unification is eternal. I hope future generations will develop even more prosperous culture based on this unified foundation.",
    category: "culture",
    difficulty: "advanced",
  },

  // Military questions
  {
    id: "military_001",
    question: "How did you unify the Six States?",
    answer:
      "I employed a strategy of befriending distant states while attacking nearby ones, conquering the six states one by one. I first defeated the weaker Han, then Zhao, followed by Wei, Chu, Yan, and finally Qi. I appointed capable generals like Wang Jian and Meng Tian, using strong military force and flexible diplomacy to complete unification within ten years. Each step was carefully planned without rash military action.",
    category: "military",
    difficulty: "intermediate",
  },
  {
    id: "military_002",
    question: "What are the characteristics of your army?",
    answer:
      "My army maintains strict discipline and superior equipment. I employ the farmer-soldier system where people farm during peace and become soldiers during war. Military hierarchy is rigidly enforced, with ranks awarded based on military merit to encourage valor. I also invested in developing siege weapons—the crossbow's power was formidable enough to breach fortified cities. Most importantly, military orders are absolute; violators are executed. This is how my army becomes irresistible on the battlefield.",
    category: "military",
    difficulty: "advanced",
  },
];

// Optional input options (button form)
export const predefinedQuestions = qinShihuangQA.map((qa) => ({
  id: qa.id,
  text: qa.question,
  category: qa.category,
  difficulty: qa.difficulty,
}));

// Find answer by question ID
export const findAnswerById = (questionId: string): string | null => {
  const qa = qinShihuangQA.find((item) => item.id === questionId);
  return qa ? qa.answer : null;
};

// Find answer by question text
export const findAnswerByQuestion = (question: string): string | null => {
  const qa = qinShihuangQA.find((item) => item.question === question);
  return qa ? qa.answer : null;
};
// (Removed) Category/Difficulty filtering functionality can be restored in future or moved to new data management module if needed.
