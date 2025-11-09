// 模擬 LLM 串流回覆服務
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface StreamChunk {
  content: string;
  isComplete: boolean;
}

export class DemoStreamService {
  private static readonly demoResponses = [
    {
      trigger: /問候|你好|嗨|安/.test.bind(/問候|你好|嗨|安/),
      response:
        "朕乃秦始皇嬴政，今日能與卿對話，甚為奇妙。卿有何事欲詢問於朕？朕統一六國、建立郡縣、修築長城，皆為後世子孫謀福祉。",
    },
    {
      trigger: /統一|六國|戰爭/.test.bind(/統一|六國|戰爭/),
      response:
        "統一六國非一日之功！朕用時十年，先後滅韓、趙、魏、楚、燕、齊。每滅一國，朕皆深思熟慮，非為殺戮，乃為天下蒼生不再受戰亂之苦。統一貨幣、文字、度量衡，使天下真正成為一家。",
    },
    {
      trigger: /長城|修築|萬里/.test.bind(/長城|修築|萬里/),
      response:
        "修築長城確實耗費大量人力物力，朕亦知民間疾苦。然北方匈奴虎視眈眈，若不築城防禦，恐怖後患無窮。朕寧可承受後世之罵名，也要保護中原百姓安全。孟姜女哭長城之說，朕聞之亦心痛。",
    },
    {
      trigger: /焚書坑儒|文字|學問/.test.bind(/焚書坑儒|文字|學問/),
      response:
        "此事後世多有誤解。朕非毀滅學問，而是統一思想。各國文字不同，如何溝通？各家學說紛爭，如何治國？朕命李斯統一文字，保留醫藥、農業、卜筮等實用之書。至於儒生，確有人暗中煽動叛亂，朕不得不嚴懲。",
    },
    {
      trigger: /皇帝|稱帝|帝制/.test.bind(/皇帝|稱帝|帝制/),
      response:
        "朕創皇帝之號，蓋因功德超越三皇五帝。三皇之德，五帝之功，朕皆兼而有之。更重要的是，朕要建立萬世之業，後世子孫皆承此統，天下永無戰亂。雖然結果未如朕意，但制度思想影響深遠。",
    },
  ];

  // 根據用戶輸入選擇回應
  private static selectResponse(userInput: string): string {
    for (const demo of this.demoResponses) {
      if (demo.trigger(userInput)) {
        return demo.response;
      }
    }

    // 預設回應
    return "卿之所問甚為有趣，然朕需更多時間思索。朕統治天下時，每日都要處理各種政務，民生、軍事、法制皆要兼顧。不如卿再問問朕關於統一天下、修築長城，或是治國理念的事情？";
  }

  // 模擬打字機效果的串流
  static async *streamResponse(userInput: string): AsyncGenerator<StreamChunk> {
    const response = this.selectResponse(userInput);
    const chunks = response.split("");

    for (let i = 0; i < chunks.length; i++) {
      await new Promise((resolve) =>
        setTimeout(resolve, 50 + Math.random() * 100)
      );

      const currentContent = chunks.slice(0, i + 1).join("");
      yield {
        content: currentContent,
        isComplete: i === chunks.length - 1,
      };
    }
  }

  // 模擬網路延遲
  static async simulateNetworkDelay(): Promise<void> {
    const delay = 300 + Math.random() * 700; // 300-1000ms 隨機延遲
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // 獲取完整回應（非串流）
  static async getResponse(userInput: string): Promise<string> {
    await this.simulateNetworkDelay();
    return this.selectResponse(userInput);
  }

  // 預設對話開場白
  static getWelcomeMessage(): ChatMessage {
    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content:
        "朕乃始皇帝嬴政，一統六國、車同軌、書同文，奠定中華帝制根基。今日能與後世子民對話，實為神奇！卿欲了解何事？朕當如實告知。",
      timestamp: new Date(),
    };
  }

  // 生成訊息 ID
  static generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// React Hook for demo stream
export const useDemoStream = () => {
  return {
    streamResponse: DemoStreamService.streamResponse,
    getResponse: DemoStreamService.getResponse,
    getWelcomeMessage: DemoStreamService.getWelcomeMessage,
    generateMessageId: DemoStreamService.generateMessageId,
  };
};
