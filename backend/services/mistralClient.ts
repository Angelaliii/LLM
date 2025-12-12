import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

// 確保載入環境變數
dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.warn('⚠️  MISTRAL_API_KEY not set. Mistral client will not be available.');
}

const mistralClient = apiKey ? new Mistral({ apiKey }) : null;

export interface MistralChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MistralChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * 使用 Mistral API 進行聊天
 * 
 * 注意：NPC persona 要求輸出三個區塊：<thinking> + <reply> + <suggestions>
 * - <thinking>: 約 50-150 tokens（內部推理過程）
 * - <reply>: 約 200-500 tokens（實際回應內容，中文字符數 * 2）
 * - <suggestions>: 約 100-200 tokens（3個追問建議的 JSON）
 * 
 * 總計約需 350-850 tokens，為安全起見預設使用 2000 tokens
 * 這樣可確保 LLM 有足夠空間完整輸出所有必需區塊
 */
export async function chatWithMistral(
  messages: MistralChatMessage[],
  options: MistralChatOptions = {}
): Promise<string> {
  if (!mistralClient) {
    throw new Error('Mistral client not initialized. Please set MISTRAL_API_KEY.');
  }

  const {
    model = 'mistral-small-latest',
    temperature = 0.7,
    maxTokens = 2000,  // 提高預設值以容納 <thinking> + <reply> + <suggestions>
    stream = false
  } = options;

  try {
    const response = await mistralClient.chat.complete({
      model,
      messages,
      temperature,
      maxTokens,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from Mistral API');
    }

    const content = response.choices[0].message.content;
    return typeof content === 'string' ? content : JSON.stringify(content);
  } catch (error: any) {
    console.error('❌ Mistral API error:', error.message);
    throw new Error(`Mistral API failed: ${error.message}`);
  }
}

/**
 * 使用 Mistral API 進行串流聊天
 * 
 * 同樣需要足夠的 maxTokens 來容納完整的三區塊輸出
 */
export async function* streamChatWithMistral(
  messages: MistralChatMessage[],
  options: MistralChatOptions = {}
): AsyncGenerator<string, void, unknown> {
  if (!mistralClient) {
    throw new Error('Mistral client not initialized. Please set MISTRAL_API_KEY.');
  }

  const {
    model = 'mistral-small-latest',
    temperature = 0.7,
    maxTokens = 2000  // 同樣提高以容納完整輸出
  } = options;

  try {
    const stream = await mistralClient.chat.stream({
      model,
      messages,
      temperature,
      maxTokens,
    });

    for await (const chunk of stream) {
      const content = chunk.data.choices[0]?.delta?.content;
      if (content) {
        yield typeof content === 'string' ? content : JSON.stringify(content);
      }
    }
  } catch (error: any) {
    console.error('❌ Mistral API streaming error:', error.message);
    throw new Error(`Mistral streaming failed: ${error.message}`);
  }
}

export default mistralClient;
