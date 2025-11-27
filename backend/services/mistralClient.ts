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
    maxTokens = 1000,
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
    maxTokens = 1000
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
