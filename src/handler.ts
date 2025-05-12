import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

// 清理请求头中的IP信息
function sanitizeHeaders(request: Request): Request {
  const newHeaders = new Headers(request.headers);
  // 移除可能暴露IP的请求头
  const sensitiveHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'true-client-ip',
    'forwarded',
    'via'
  ];
  
  sensitiveHeaders.forEach(header => {
    newHeaders.delete(header);
  });
  
  // 创建新的请求对象，保持原有的配置但使用新的headers
  return new Request(request.url, {
    method: request.method,
    headers: newHeaders,
    body: request.body,
    redirect: request.redirect,
    credentials: request.credentials
  });
}

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  graphiql: true, // 开发时可以使用 GraphiQL 界面
  // 添加 CORS 配置
  cors: {
    origin: '*', // 允许所有域名访问，生产环境建议设置具体的域名
    credentials: true,
    allowedHeaders: ['content-type', 'authorization'],
    methods: ['POST', 'GET', 'OPTIONS']
  },
  context: ({ request }) => {
    return {
      env: (request as any).env
    };
  }
});

export default {
  fetch: (request: Request, env: any, ctx: any) => {
    // 清理请求头
    // const sanitizedRequest = sanitizeHeaders(request);
    
    // 将环境变量附加到请求对象
    (request as any).env = env;

    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    return yoga.fetch(request, { env, ctx });
  },
};