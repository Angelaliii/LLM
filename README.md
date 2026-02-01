# Historical Mission-Based AI System - Complete Implementation Guide

## 🎯 System Overview

This system is an innovative historical education platform that adopts a mission-based learning model (S0→S5), combined with LLM dual-process theory (System 1/2), to provide an immersive historical learning experience. Students explore historical events through NPC dialogues, while the system intelligently assesses learning progress and automatically adjusts teaching pace.

### 📚 Learning Process Design

**S0 Mission Menu** → **S1 Mission Opening Story** → **S2 Select Dialogue Character** → **S3 NPC Dialogue (System 1)** ↔ **S3-EVAL Progress Assessment (System 2)** → **S4 System Restates Complete Story** → **S5 Quiz & Feedback**

### 🏗️ Technology Stack

#### Frontend Architecture
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand (task flow + dialogue state)
- **Styling System**: Tailwind CSS (responsive, dark mode)
- **Routing**: React Router v6

#### Backend Architecture
- **Runtime**: Node.js + Express + TypeScript
- **LLM Service**: Local Ollama (llama3.2:3b model)
- **AI Features**: RAG Retrieval + Dual-process Assessment + Intelligent Prompt Engineering
- **Safety Protection**: Multi-layer content filtering & educational redirection

## 🚀 Quick Start

### 1. Environment Requirements

```bash
Node.js >= 18.0.0
npm >= 8.0.0
Ollama >= 0.1.0 (local LLM service)
```

### 2. Installation & Startup

#### Step 1: Install and Launch Ollama
```powershell
# Download and install Ollama Desktop or CLI
# https://ollama.ai/

# Pull the model
ollama pull llama3.2:3b

# Launch Ollama service (Desktop version starts automatically)
ollama serve
```

#### Step 2: Launch Backend Service
```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start backend development server
npm run dev

# Backend will run on http://localhost:4000
```

#### Step 3: Launch Frontend Application
```powershell
# In project root directory
npm install

# Start frontend development server
npm run dev

# Frontend will run on http://localhost:3000
```

### 3. Project Structure Overview

```
🏠 Project Root/
├── 📁 frontend/           # Frontend application
│   ├── 🎨 components/
│   │   ├── chat/              # Dialogue system core components
│   │   │   ├── ChatWindow.tsx      # Main dialogue window
│   │   │   ├── MessageBubble.tsx   # Message bubble (streaming support)
│   │   │   └── PersonaSidebar.tsx  # NPC switching panel
│   │   ├── mission/           # Mission flow components (S0-S5)
│   │   │   ├── MissionList.tsx     # S0: Mission menu
│   │   │   ├── MissionIntro.tsx    # S1: Mission opening story
│   │   │   ├── NPCSelector.tsx     # S2: Select NPC
│   │   │   ├── ChatRoom.tsx        # S3: NPC dialogue
│   │   │   ├── SummaryView.tsx     # S4: Story restatement
│   │   │   └── QuizView.tsx        # S5: Quiz feedback
│   │   └── ui/               # Common UI components
│   ├── 🔧 services/
│   │   ├── llmClient.ts           # Frontend API wrapper
│   │   └── analytics.ts           # Learning data analytics
│   ├── 📊 store/
│   │   ├── useChatStore.ts        # Task & dialogue state
│   │   └── useUIStore.ts          # UI state management
│   ├── 📝 types/              # Frontend type definitions
│   └── 🛠 utils/              # Frontend utility functions
│
├── 📁 backend/            # Backend API service
│   ├── 🚀 services/
│   │   ├── ollamaClient.ts        # Ollama LLM client
│   │   ├── missionPrompt.ts       # RAG + prompt engineering
│   │   ├── progressEval.ts        # S3-EVAL progress assessment
│   │   ├── llmClient.ts           # LLM business logic
│   │   └── prompts/
│   │       └── safety.guardrails.ts    # Safety protection mechanism
│   ├── 🛣 routes/
│   │   ├── ollama.ts              # POST /api/ollama/chat
│   │   └── eval.ts                # POST /api/eval
│   ├── 📁 data/
│   │   └── missions/
│   │       └── e2-industrial-agri.ts   # E2 mission data
│   ├── 📝 types/              # Backend type definitions
│   └── 📋 README.md           # Backend detailed documentation
│
└── 📄 vite.config.ts      # Frontend build config (backend API proxy)
```

## 📚 User Journey Detailed Explanation (S0-S5 Mission-Based Learning)

### 📄 S0 - Mission Menu (Mission List)

**User Behavior**:
Select a historical scenario to challenge from the mission list (e.g., E2 Industrial Japan · Agricultural Taiwan)

**System Functions**:
- Mission card list: era tags, difficulty levels, completion status
- Load mission list from frontend static data
- No LLM involvement, proceed directly to S1

### 📜 S1 - Mission Opening Story (Narrative Intro)

**User Behavior**:
Read historical background story (150-200 words), understand core questions

**LLM Usage** (System 1):
```typescript
// Retrieve background chunk and task objectives from missionId
// Use llama3.2:3b to generate:
// - Mission background story
// - Guiding questions
const storyResult = await missionPrompt.generateIntro(missionId);
```

### 💭 S2 - Select Dialogue Character (NPC Select)

**User Behavior**:
Choose which NPC to interview first from the character list:
- 🏭 Japanese Engineer (Yamada Seiichi)
- 👨‍🌾 Farmer (Chen Ah-zhong)
- 🏢 Sugar Company Executive (Sato Takeshi)

### 💬 S3 - NPC Dialogue (System 1: Intuitive Chat)

**User Behavior**:
Have a back-and-forth conversation with the selected NPC in a chat-like interface

**Technical Implementation**:
```typescript
// Each time user sends a message:
// 1. RAG Retrieval: Find relevant content from mission chunks
// 2. Character Setup: Load current NPC's persona
// 3. LLM Generate Response
const response = await ollamaClient.chat({
  messages: [systemPrompt, userMessage],
  context: ragResults,
  persona: currentNPC
});
```

### 🔍 S3-EVAL - Progress Assessment (System 2: Slow-thinking Teacher)

**Trigger Timing**: Every 2-3 dialogue turns, or when key terms appear

**LLM Usage** (System 2):
```typescript
// Running in background, not directly shown to students
const evalResult = await progressEval.assess({
  learningGoals,        // Learning objectives for this mission
  conversationSummary,  // Compressed dialogue summary
  expectedOutput: 'JSON' // Mark each goal: not_mentioned|wrong|partial|mastered
});

// Threshold judgment
if (conversationTurns >= 6 && 
    evalResult.masteredCount >= 3 && 
    evalResult.confidence >= 0.7) {
  proceed to S4;
}
```

### 📜 S4 - System Restates Complete Story (Mission Summary)

**User Behavior**:
Read the system-organized complete story, connecting the scattered clues from recent dialogue

**LLM Usage**:
```typescript
// Combine all information to generate structured story
const summary = await missionPrompt.generateSummary({
  chunks: mission core content,
  goals: learning objectives,
  conversation: dialogue summary,
  evalResult: S3 assessment results,
  style: 'junior high level, clear structure, 300-500 words'
});
```

### 📋 S5 - Quiz & Feedback (Quiz & Feedback)

**User Behavior**:
Answer 3-10 multiple choice / true-false / data questions, view scores and explanations

**Technical Implementation**:
- Question source: primarily from pre-designed `missionQuizzes`
- During answering: frontend judges correctness based on `answer` in question bank, no additional LLM calls needed
- Result recording: correct count, hint usage, response time

## 📚 Learning Progress Analysis

### 1. Mission Completion Tracking

```typescript
// Monitor student learning state
const progress = useMissionStore(state => ({
  currentStage: state.currentStage, // S0-S5 current stage
  conversationTurns: state.conversationTurns, // dialogue turns
  masteredGoals: state.evalResult?.masteredCount, // mastered goals count
  timeSpent: state.sessionDuration, // learning time
}));
```

### 2. Real-time Task Control

```typescript
// Control student task parameters
const { actions } = useTeacherStore();

actions.updateClassroomSettings({
  allowStudentMissionSwitch: false, // restrict mission switching
  moderationLevel: "high", // increase monitoring level
  maxNPCInteractions: 10, // limit NPC interactions
  enableProgressHints: true, // enable progress hints
});
```

### 3. Smart Alert System

```typescript
// Monitor flagged content
actions.addFlaggedContent({
  sessionId: "student-123",
  content: "Problematic historical glorification",
  flagReason: "Contains inappropriate historical glorification",
  stage: "S3", // which stage it occurred
  resolved: false,
});

// Automatically trigger educational redirect
if (flaggedContent.severity === 'high') {
  triggerEducationalRedirect(flaggedContent.alternativePrompt);
}
```

## 🔧 Adding New Historical Missions

### Step One: Create Mission Data Structure (15 minutes)

```typescript
// New file: backend/data/missions/e3-ming-qing-transition.ts
export const e3MissionData: MissionData = {
  id: "E3",
  title: "Ming-Qing Transition & Cultural Change",
  period: "Late Ming to Early Qing (1600-1700)",
  difficulty: "intermediate",

  // RAG knowledge chunks
  chunks: [
    {
      id: "e3-001",
      topic: "Ming-Qing Transition Background",
      type: "core_fact",
      text: "Political corruption at the end of Ming, peasant uprisings were frequent..."
    },
    // ... more chunks
```
  ],

  // NPC character cards
  npcs: [
    {
      id: "npc-ming-scholar",
      name: "Wang Fuzhi",
      role: "Ming Dynasty Scholar-Official",
      persona: "You are a scholar-official of the late Ming dynasty...",
      canTalkAbout: ["Examination System", "Political Reform", "Cultural Tradition"],
      avoid: ["Foreknowledge of Qing Dynasty"]
    },
    // ... more NPCs
  ],

  // Learning goals
  learningGoals: [
    {
      id: "e3-g1",
      description: "Understand the historical reasons for the Ming-Qing transition"
    },
    // ... more goals
  ],

  // Quiz questions
  quizzes: [
    {
      id: "e3-q1",
      stem: "What was the main political issue at the end of Ming?",
      options: [
        { key: "A", text: "Peasant uprisings" },
        // ... more options
      ],
      answer: "A",
      explanation: "Peasant uprisings were frequent at the end of Ming..."
    }
  ]
};
```

### Step Two: Register with the System

```typescript
// Add to backend/data/missions/index.ts
import { e3MissionData } from './e3-ming-qing-transition';

export const allMissions = [
  e2IndustrialAgriData,
  e3MissionData, // New mission
];
```

### Step Three: Testing and Optimization

```typescript
// Test cases
const testCases = [
  {
    missionId: "E3",
    stage: "S3",
    input: "Why does the examination system affect politics?",
    expectedNPCResponse: includes["examination system", "scholars", "political participation"],
    expectedGoalProgress: "partial"
  },
];
```

## 🔧 Technical Architecture Detailed

### 1. Frontend-Backend Integration Architecture

```typescript
// vite.config.ts - Frontend proxy configuration
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Backend API
        changeOrigin: true,
      },
    },
  },
});

// frontend/services/llmClient.ts - API wrapper
export async function sendMessage(data: ChatRequest) {
  const response = await fetch('/api/ollama/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### 2. Ollama Integration Architecture

```typescript
// backend/services/ollamaClient.ts
export class OllamaClient {
  private baseURL = 'http://localhost:11434';
  private model = 'llama3.2:3b';

  async chat(messages: ChatMessage[], options?: ChatOptions) {
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: options?.stream ?? false,
        ...options,
      }),
    });

    return this.parseResponse(response);
  }
}
```

### 3. RAG Retrieval System

```typescript
// backend/services/missionPrompt.ts - Simple RAG
export function retrieveChunks(
  chunks: Chunk[],
  query: string,
  limit = 4
): Chunk[] {
  // Currently uses keyword matching, can be upgraded to vector similarity
  const scored = chunks
    .filter(c => c.text.includes(query) || c.topic.includes(query))
    .slice(0, limit);
  
  return scored;
}
```

## 🚀 Deployment Recommendations

### Production Environment Configuration

```bash
# Docker deployment (recommended)
docker-compose up -d

# Or manual deployment
npm run build          # Frontend build
npm run start:backend  # Backend production service
```

### Environment Variables

```bash
# .env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
PORT=4000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
```

## 📈 Success Metrics Achievement

### ✅ Completed Standards

- [x] **Mission-Based Learning Flow**: Complete S0-S5 contextual learning
- [x] **LLM Dual-Process Theory**: System 1/2 separated architecture
- [x] **RAG Knowledge Retrieval**: Historical knowledge chunk management
- [x] **Safety Protection Mechanism**: Multi-layer content filtering and educational guidance
- [x] **Progress Evaluation System**: Intelligent learning progress tracking

### 🟡 Partially Completed Standards

- [~] **Historical Mission Extension**: Framework complete, more missions needed
- [~] **Student Progress Tracking**: State management complete, UI pending
- [~] **Learning Data Analysis**: Basic mechanism complete, needs enhancement

### 📋 Future Development Priorities

**P0 (Immediate)**:
1. Improve error handling and edge cases
2. Add more historical missions (E3, E4...)

**P1 (Short-term)**:
1. Enhance user interface design
2. Add data persistence (learning history records)
3. Improve readability analysis algorithm

**P2 (Long-term)**:
1. Multi-language support (English, Japanese)
2. Voice dialogue functionality
3. Mobile optimization

## 💡 Innovation Features Summary

1. **Mission-Based Learning Design**: S0-S5 gamified historical learning experience
2. **LLM Dual-Process Architecture**: System 1 intuitive dialogue + System 2 progress evaluation
3. **Immersive Historical Context**: Multi-angle NPC dialogue to explore historical truth
4. **Intelligent Adaptive Learning**: Automatically adjust teaching pace based on learning progress
5. **Educational Safety Protection**: Transform safety issues into teaching opportunities
6. **Highly Extensible**: Efficient 15-minute workflow for adding new historical missions

This system provides a professional, safe, and efficient solution for historical education digitalization with excellent teaching applicability and technical sustainability.

---

🔗 **Related Documentation**:
- [User Manual](User%20Manual.md)
