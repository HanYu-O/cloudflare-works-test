export const typeDefs = `
  type Query {
    ping: String
  }

  type Mutation {
    chat(message: String!): StreamResponse!
  }

  type StreamResponse {
    text: String!
  }
`;