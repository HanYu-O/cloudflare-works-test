import OpenAI from 'openai';

interface OpenAIServiceConfig {
  apiKey: string;
  referer: string;
  appTitle: string;
}

export class OpenAIService {
  private client: OpenAI;

  constructor(config: OpenAIServiceConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': config.referer,
        'X-Title': config.appTitle
      }
    });
  }

  async createChatStream(message: string) {
    const stream = await this.client.chat.completions.create({
      model: 'google/gemini-2.5-flash-preview', // OpenRouter 的模型标识符
      messages: [{ role: 'user', content: message }],
      stream: true,
    });

    return stream;
  }
}