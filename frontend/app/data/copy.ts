// Main copy content management
export interface CopyVariant {
  id: string;
  name: string;
  content: {
    hero: {
      headline: string;
      subheadline: string;
      cta: {
        primary: string;
        secondary: string;
      };
    };
    features: Array<{
      title: string;
      description: string;
      proof: string;
    }>;
    pricing: {
      title: string;
      subtitle: string;
      plans: Array<{
        name: string;
        price: string;
        features: string[];
        cta: string;
      }>;
    };
  };
}

export const copyVariants: CopyVariant[] = [
  {
    id: "default",
    name: "Version A (Scenario-Oriented)",
    content: {
      hero: {
        headline: "Time Travel: Talk with Legends",
        subheadline:
          "Experience immersive historical learning through AI-powered conversations with legendary figures from the past",
        cta: {
          primary: "Start Time Talk",
          secondary: "Preview Dialog Scenario",
        },
      },
      features: [
        {
          title: "Mission-Based Learning System",
          description:
            "Structured 6-stage journey with AI progress tracking and gamified clue collection.",
          proof: "Gamified progression keeps students engaged from start to finish",
        },
        {
          title: "Intelligent RAG-Enhanced Conversations",
          description:
            "Dual-process AI ensures accurate responses with guided prompts and auto-captured insights.",
          proof: "Contextual knowledge snippets captured automatically in student notebooks",
        },
        {
          title: "Interactive Archive Repair Mode",
          description:
            "Drag evidence cards to complete historical documents with visual tracking and validation.",
          proof: "Hands-on learning through evidence synthesis and validation",
        },
      ],
      pricing: {
        title: "Flexible Licensing for Every Need",
        subtitle: "From individual exploration to campus-wide programs, we have the right plan",
        plans: [
          {
            name: "Explore",
            price: "Free Trial",
            features: [
              "Experience full dialogue flow",
              "3 deep interaction opportunities",
              "Basic historical Q&A",
              "Understand core product features",
            ],
            cta: "Start Exploring",
          },
          {
            name: "Personal Depth",
            price: "NT$ 299/month",
            features: [
              "Unlock all historical figures",
              "Unlimited dialogue sessions",
              "Exclusive learning reports",
              "Advanced interactive features",
            ],
            cta: "Deep Learning",
          },
          {
            name: "Education Partner",
            price: "Contact for Quote",
            features: [
              "School-wide access for all faculty and students",
              "Teaching management platform",
              "Customized content",
              "Professional teacher training",
            ],
            cta: "Become a Partner",
          },
        ],
      },
    },
  },
];

export const getCurrentCopy = (
  variantId = "default"
): CopyVariant["content"] => {
  const variant = copyVariants.find((v) => v.id === variantId);
  return variant?.content || copyVariants[0].content;
};
