export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "product" | "technical" | "pricing" | "education";
}

export const faqData: FAQItem[] = [
  {
    id: "faq-1",
    question: "How does Time Talk ensure the accuracy of historical information?",
    answer:
      "Our system is built on authoritative historical sources and academic research, including classical texts like the Records of the Grand Historian and the Comprehensive Mirror for Aid in Government. When historical records diverge, the system presents multiple perspectives, saying 'Historians have different views on this,' fostering students' critical thinking skills. All content is reviewed by history scholars to ensure academic standards.",
    category: "product",
  },
  {
    id: "faq-2",
    question: "Will there be new historical figures besides Qin Shi Huang?",
    answer:
      "Yes! We're developing other important emperors and scholars like Su Shi. We plan to release 2-3 new figures each quarter. Campus edition users enjoy early access, and personal edition users can update for free after launch.",
    category: "product",
  },
  {
    id: "faq-3",
    question: "How is campus licensing pricing calculated?",
    answer:
      "Campus licensing uses a flexible pricing model: schools under 500 students pay NT$50,000 annually, schools with 500-1000 students pay NT$80,000 annually, and schools over 1000 students pay NT$120,000 annually. This includes unlimited access for all teachers and students, teacher training, technical support, and customized content services. Installment payment plans are available.",
    category: "pricing",
  },
  {
    id: "faq-4",
    question: "Are student conversations recorded? How is privacy protected?",
    answer:
      "Student conversation records are stored only in the teacher management dashboard for teaching evaluation and learning tracking. We strictly comply with data protection regulations and never use student data for other purposes. All data uses encrypted transmission and storage.",
    category: "technical",
  },
  {
    id: "faq-5",
    question: "What are the limitations of the free trial? How do I upgrade after the trial?",
    answer:
      "The free trial provides 3 complete conversation experiences with unlimited conversation time per session, allowing you to fully understand product features. During the trial, you can experience all core functionality, but cannot access the teacher management dashboard. After the trial ends, you can upgrade directly in the system, with payment options including credit card and bank transfer.",
    category: "pricing",
  },
  {
    id: "faq-6",
    question: "Does the system comply with 108 Curriculum Guideline teaching objectives?",
    answer:
      "Completely! Our content design aligns closely with the 108 Curriculum Guideline's core competencies in history, including: historical consciousness, historical evidence, and multiple interpretations. Dialogue topics cover political, economic, social, and cultural dimensions, helping students develop historical thinking and critical analysis skills.",
    category: "education",
  },
  {
    id: "faq-7",
    question: "What happens if inappropriate content appears in conversations?",
    answer:
      "The system has multiple layers of safety mechanisms: keyword filtering, semantic analysis detection, and manual review processes. Teachers can set a blacklist of sensitive words, and the system automatically guides conversations back to historical topics. If inappropriate content is found, you can report it immediately, and we will process and optimize the system within 24 hours.",
    category: "technical",
  },
];

// 根據分類篩選 FAQ
export const getFAQByCategory = (category: FAQItem["category"]): FAQItem[] => {
  return faqData.filter((item) => item.category === category);
};

// 搜尋 FAQ
export const searchFAQ = (query: string): FAQItem[] => {
  const lowerQuery = query.toLowerCase();
  return faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(lowerQuery) ||
      item.answer.toLowerCase().includes(lowerQuery)
  );
};
