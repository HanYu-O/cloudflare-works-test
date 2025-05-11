import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

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