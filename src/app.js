import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { resolvers, typeDefs } from './graphql/index.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  const httpServer = createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production',
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use('/graphql', (req, res, next) => {
    if (req.body === undefined) {
      req.body = {};
    }

    req.headers['content-type'] = 'application/json';
    next();
  });

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ request, response }) => ({
        request: request,
        response: response,
      }),
    })
  );

  httpServer.listen(PORT, () => {
    console.log(`Apollo Server on http://localhost:${PORT}/graphql`);
  });
};

startServer();
