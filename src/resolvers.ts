import { OpenAIService } from './openai';

export const resolvers = {
  Query: {
    ping: () => 'pong',
  },
  Mutation: {
    chat: async (_, { message }, context) => {
      const { env } = context;
      
      if (!env?.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not configured. Please check your environment variables.');
      }
      if (!env?.APP_REFERER) {
        throw new Error('APP_REFERER is not configured. Please check your environment variables.');
      }
      if (!env?.APP_TITLE) {
        throw new Error('APP_TITLE is not configured. Please check your environment variables.');
      }

      const openai = new OpenAIService({
        apiKey: env.OPENROUTER_API_KEY,
        referer: env.APP_REFERER,
        appTitle: env.APP_TITLE
      });
      
      const stream = await openai.createChatStream(message);
      
      // 创建一个 TransformStream 来处理流式响应
      const { readable, writable } = new TransformStream();
      
      // 处理流式响应
      (async () => {
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ text: content })}\n\n`));
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          await writer.write(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
        } finally {
          await writer.close();
        }
      })();

      // 返回一个 SSE 响应
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    },
  },
};