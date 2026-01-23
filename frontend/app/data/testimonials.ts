export interface Testimonial {
  id: string;
  name: string;
  role: string;
  institution: string;
  content: string;
  rating: number;
  avatar: string;
  type: "teacher" | "student" | "parent";
}

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    name: "Lin Ya-hui",
    role: "History Teacher",
    institution: "Taipei Datong High School",
    content:
      "After using Time Talk, student focus during class has noticeably improved. Students who previously had little interest in history now actively ask more questions. The teacher management interface is very intuitive—I can easily track each student's progress and significantly reduce preparation time.",
    rating: 5,
    avatar: "<IMG_PLACEHOLDER>",
    type: "teacher",
  },
  {
    id: "testimonial-2",
    name: "Wang Xiao-ming",
    role: "Grade 11 Student",
    institution: "Hsinchu Jiangong High School",
    content:
      "I used to find history boring—just memorizing dates and names. But after dialoguing with Qin Shi Huang, I understood the hardship and pressure behind his unification of China. Now I actively research history and want to learn more stories. History went from my most hated subject to my most anticipated class!",
    rating: 5,
    avatar: "<IMG_PLACEHOLDER>",
    type: "student",
  },
  {
    id: "testimonial-3",
    name: "Chen Mei-ling",
    role: "Parent",
    institution: "Parent of Grade 9 Student",
    content:
      "After my child used this system, not only did history grades improve, but communication skills got better too. He shares the dialogue content with me in vivid detail. Most importantly, through learning reports I can understand his progress—I'm confident letting him continue using it.",
    rating: 5,
    avatar: "<IMG_PLACEHOLDER>",
    type: "parent",
  },
  {
    id: "testimonial-4",
    name: "Zhang Zhi-ming",
    role: "History Department Head",
    institution: "Kaohsiung Qianzheng High School",
    content:
      "We've used this system for one semester, and average history scores increased by 15 points. Teachers report more lively classroom atmosphere and greater student participation. The technical support team is professional—the implementation was smooth.",
    rating: 5,
    avatar: "<IMG_PLACEHOLDER>",
    type: "teacher",
  },
  {
    id: "testimonial-5",
    name: "Li Xiao-hua",
    role: "Grade 9 Student",
    institution: "Taichung Juren Junior High School",
    content:
      "I was most worried about Social Studies before the high school entrance exam, especially history. With this system, review became fun. I could ask Qin Shi Huang his thoughts back then—much easier to understand than textbooks. I got A++ in Social Studies on the exam. Thank you for this magical system!",
    rating: 5,
    avatar: "<IMG_PLACEHOLDER>",
    type: "student",
  },
  {
    id: "testimonial-6",
    name: "Liu Jia-hao",
    role: "Academic Affairs Director",
    institution: "Changhua Yuanlin High School",
    content:
      "Our school's digital transformation needed an effective tool—Time Talk perfectly meets our needs. It not only improves teaching effectiveness but also strengthens our recruitment competitiveness. Parents are impressed with our innovative teaching approach.",
    rating: 5,
    avatar: "<IMG_PLACEHOLDER>",
    type: "teacher",
  },
];

// Filter testimonials by type
export const getTestimonialsByType = (
  type: Testimonial["type"]
): Testimonial[] => {
  return testimonials.filter((testimonial) => testimonial.type === type);
};

// Get random testimonials
export const getRandomTestimonials = (count: number): Testimonial[] => {
  const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Partnerships (social proof)
export const partnerships = [
  {
    name: "Taipei Department of Education",
    type: "Government Partnership",
    description: "Digital teaching innovation pilot program partner",
  },
  {
    name: "National Taiwan Normal University",
    type: "Academic Partnership",
    description: "History Education Research Center technical advisor",
  },
  {
    name: "National Association of High School Teachers",
    type: "Educational Organization",
    description: "Recommended digital teaching tool",
  },
  {
    name: "108 Curriculum Guideline Adaptive Teaching Alliance",
    type: "Educational Alliance",
    description: "Certified teaching tool for new curriculum",
  },
];
