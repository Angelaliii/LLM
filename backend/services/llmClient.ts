import type { APIConfig } from "../../src/types/api";
import type { ChatMode, Language, RigorLevel } from "../../src/types/chat";
import { qinShiHuangPrompts } from "./prompts/persona.qinShihuang";
import { checkContentSafety, checkResponseSafety } from "./prompts/safety.guardrails";

export class LLMClient {
  private config: APIConfig;
  private abortController: AbortController | null = null;

  constructor(config: APIConfig) {
    this.config = config;
  }

  private buildPrompt(
    userInput: string,
    _personaId: string,
    mode: ChatMode,
    rigorLevel: RigorLevel,
    language: Language,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): string {
    const prompts = qinShiHuangPrompts;

    let systemPrompt = prompts.system;

    systemPrompt += "\n\n" + prompts.modeInstructions[mode];

    systemPrompt += "\n\n" + prompts.rigorInstructions[rigorLevel];

    systemPrompt += "\n\n" + prompts.safety;

    if (language !== "zh-TW") {
      systemPrompt += `\n\n請使用${
        language === "zh-CN" ? "簡體中文" : "英文"
      }回應。`;
    }

    let fullPrompt = systemPrompt + "\n\n";

    conversationHistory.forEach((msg) => {
      fullPrompt += `${msg.role === "user" ? "學生" : "秦始皇"}：${
        msg.content
      }\n\n`;
    });

    fullPrompt += `學生：${userInput}\n\n秦始皇：`;

    return fullPrompt;
  }

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
      const safetyCheck = checkContentSafety(userInput);
      if (!safetyCheck.isSafe) {
        const highSeverityIssues = safetyCheck.issues.filter(
          (issue) => issue.severity === "high"
        );
        if (highSeverityIssues.length > 0) {
          throw new Error("輸入內容包含不適當的內容，請重新表達您的問題。");
        }
      }

      const prompt = this.buildPrompt(
        userInput,
        options.personaId,
        options.mode,
        options.rigorLevel,
        options.language,
        options.conversationHistory || []
      );

      this.abortController = new AbortController();

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
      const response = this.generateMockResponse(prompt);
      const chunks = response.split("");

      let currentResponse = "";

      for (let i = 0; i < chunks.length; i++) {
        if (options.signal.aborted) {
          throw new Error("請求已取消");
        }

        currentResponse += chunks[i];
        options.onChunk(chunks[i]);

        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      const responseCheck = checkResponseSafety(currentResponse);
      if (!responseCheck.isSafe) {
        console.warn("回應安全檢查發現問題:", responseCheck.issues);
      }

      options.onComplete(currentResponse);
    } catch (error) {
      if (!options.signal.aborted) {
        options.onError(error instanceof Error ? error : new Error("API 調用失敗"));
      }
    }
  }

  private generateMockResponse(prompt: string): string {
    const lower = prompt.toLowerCase();

    const quick =
      "朕推行郡縣制是為了加強中央集權，避免分封制造成的諸侯割據。郡守縣令由朝廷任免，直接對中央負責，這樣可以有效控制全國。此制度影響深遠，成為後世中央集權的基礎。";

    const socratic =
      "你提到郡縣制，那麼請思考：如果繼續沿用分封制，會對新統一的帝國帶來什麼風險？再者，郡縣制中官員由中央任免，這與分封制中的世襲制有何根本差異？最後，你認為這種制度變革對於普通百姓的生活會產生什麼影響？";

    const teachingShort =
      "郡縣制是朕為了加強中央集權而推行的重要制度，目的是減少地方割據與世襲勢力的影響，並由朝廷直接任命地方官員以穩定統治。";

    if (
      lower.includes("快問快答") ||
      lower.includes("快答") ||
      lower.includes("quick")
    ) {
      return quick;
    }

    if (lower.includes("蘇格拉底") || lower.includes("socratic")) {
      return socratic;
    }

    if (lower.includes("焚書") || lower.includes("坑儒")) {
      return "焚書坑儒是朕為了鞏固統一與思想一致性所採取的極端政策，重點在於消除分裂勢力與統一典籍標準，但其對學術自由造成了長期負面影響。";
    }

    if (lower.includes("長城") || lower.includes("修長城")) {
      return "長城的現代形象是多個時期防禦工程的總稱。朕曾整合與加強邊防工事以保衛疆域，但後代對長城的擴建與改造也相當重要。";
    }

    if (
      lower.includes("統一") ||
      lower.includes("何時") ||
      lower.includes("六國")
    ) {
      return quick;
    }

    return teachingShort;
  }

  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  updateConfig(newConfig: Partial<APIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): APIConfig {
    return { ...this.config };
  }
}

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

export const llmClient = new LLMClient(defaultConfig);
