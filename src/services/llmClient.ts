import type { APIConfig } from "../types/api";
import type { ChatMode, Language, RigorLevel } from "../types/chat";
import { qinShiHuangPrompts } from "./prompts/persona.qinShihuang";
import {
  checkContentSafety,
  checkResponseSafety,
} from "./prompts/safety.guardrails";

export class LLMClient {
  private config: APIConfig;
  private abortController: AbortController | null = null;

  constructor(config: APIConfig) {
    this.config = config;
  }

  // 構建完整的提示詞
  private buildPrompt(
    userInput: string,
    personaId: string,
    mode: ChatMode,
    rigorLevel: RigorLevel,
    language: Language,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): string {
    // TODO: 根據 personaId 獲取對應的 prompts，目前使用秦始皇
    const prompts = qinShiHuangPrompts;

    let systemPrompt = prompts.system;

    // 添加模式特定指令
    systemPrompt += "\n\n" + prompts.modeInstructions[mode];

    // 添加嚴謹度指令
    systemPrompt += "\n\n" + prompts.rigorInstructions[rigorLevel];

    // 添加安全守則
    systemPrompt += "\n\n" + prompts.safety;

    // 添加語言指令
    if (language !== "zh-TW") {
      systemPrompt += `\n\n請使用${
        language === "zh-CN" ? "簡體中文" : "英文"
      }回應。`;
    }

    // 構建完整對話
    let fullPrompt = systemPrompt + "\n\n";

    // 添加對話歷史
    conversationHistory.forEach((msg) => {
      fullPrompt += `${msg.role === "user" ? "學生" : "秦始皇"}：${
        msg.content
      }\n\n`;
    });

    // 添加當前用戶輸入
    fullPrompt += `學生：${userInput}\n\n秦始皇：`;

    return fullPrompt;
  }

  // 串流對話
  async streamChat(
    userInput: string,
    options: {
      personaId: string;
      mode: ChatMode;
      rigorLevel: RigorLevel;
      language: Language;
      conversationHistory?: Array<{ role: string; content: string }>;
      onChunk: (chunk: string) => void;
      onComplete: (response: string) => void;
      onError: (error: Error) => void;
    }
  ): Promise<void> {
    try {
      // 安全檢查
      const safetyCheck = checkContentSafety(userInput);
      if (!safetyCheck.isSafe) {
        const highSeverityIssues = safetyCheck.issues.filter(
          (issue) => issue.severity === "high"
        );
        if (highSeverityIssues.length > 0) {
          throw new Error("輸入內容包含不適當的內容，請重新表達您的問題。");
        }
      }

      // 構建提示詞
      const prompt = this.buildPrompt(
        userInput,
        options.personaId,
        options.mode,
        options.rigorLevel,
        options.language,
        options.conversationHistory || []
      );

      // 創建新的中止控制器
      this.abortController = new AbortController();

      // 調用 API（模擬實現）
      await this.simulateStreamingAPI(prompt, {
        onChunk: options.onChunk,
        onComplete: options.onComplete,
        onError: options.onError,
        signal: this.abortController.signal,
      });
    } catch (error) {
      options.onError(error instanceof Error ? error : new Error("未知錯誤"));
    }
  }

  // 模擬串流 API 調用
  private async simulateStreamingAPI(
    prompt: string,
    options: {
      onChunk: (chunk: string) => void;
      onComplete: (response: string) => void;
      onError: (error: Error) => void;
      signal: AbortSignal;
    }
  ): Promise<void> {
    try {
      // 基於輸入生成回應（實際實現中這裡會調用真實的 LLM API）
      const response = this.generateMockResponse(prompt);
      const chunks = response.split("");

      let currentResponse = "";

      for (let i = 0; i < chunks.length; i++) {
        if (options.signal.aborted) {
          throw new Error("請求已取消");
        }

        currentResponse += chunks[i];
        options.onChunk(chunks[i]);

        // 模擬網路延遲
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      // 檢查回應安全性
      const responseCheck = checkResponseSafety(currentResponse);
      if (!responseCheck.isSafe) {
        console.warn("回應安全檢查發現問題:", responseCheck.issues);
        // 在生產環境中可能需要重新生成回應
      }

      options.onComplete(currentResponse);
    } catch (error) {
      if (!options.signal.aborted) {
        options.onError(
          error instanceof Error ? error : new Error("API 調用失敗")
        );
      }
    }
  }

  // 生成模擬回應
  private generateMockResponse(prompt: string): string {
    // 簡化的回應生成邏輯（實際應用中會調用真實的 LLM）
    const isTeachingMode = prompt.includes("教學模式");
    const isQuickMode = prompt.includes("快問快答");
    const isSocraticMode = prompt.includes("蘇格拉底");

    // 根據不同模式生成不同風格的回應
    if (isQuickMode) {
      return "朕推行郡縣制是為了加強中央集權，避免分封制造成的諸侯割據。郡守縣令由朝廷任免，直接對中央負責，這樣可以有效控制全國。此制度影響深遠，成為後世中央集權的基礎。";
    } else if (isSocraticMode) {
      return "你提到郡縣制，那麼請思考：如果繼續沿用分封制，會對新統一的帝國帶來什麼風險？再者，郡縣制中官員由中央任免，這與分封制中的世襲制有何根本差異？最後，你認為這種制度變革對於普通百姓的生活會產生什麼影響？";
    } else {
      return "朕統一六國後，深知分封制之弊端。戰國時期，諸侯割據，各自為政，導致戰亂不斷。朕推行郡縣制，乃是以中央直接派遣官員治理各地，而非依賴世襲貴族。此制度確保了中央政府的有效控制，避免了地方勢力的再次崛起。郡縣制的核心在於「郡守」與「縣令」皆由朝廷任免，而非世襲。這樣的安排使得地方官員必須對中央負責，而非對當地豪族效忠。此外，朕還建立了嚴密的監察體系，確保各級官員忠於職守。史學界對此制度評價頗高，認為它為後世中國的中央集權制奠定了基礎。然而，也有學者指出，過度的中央集權可能導致地方活力的喪失。你認為這種制度對於維護國家統一有何重要意義？";
    }
  }

  // 取消當前請求
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // 更新配置
  updateConfig(newConfig: Partial<APIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 獲取當前配置
  getConfig(): APIConfig {
    return { ...this.config };
  }
}

// 預設配置
export const defaultConfig: APIConfig = {
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4",
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.9,
  presencePenalty: 0.1,
  frequencyPenalty: 0.1,
};

// 創建預設客戶端實例
export const llmClient = new LLMClient(defaultConfig);
