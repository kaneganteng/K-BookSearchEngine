import express from 'express';
import { ApolloServer } from '@apollo/server';// Note: Import from @apollo/server-express
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';
import type { Request, Response } from 'express';
import { authenticateToken } from './utils/auth.js';
import path from 'node:path';
import db from './config/connection';
import routes from './routes/index';
import { fileURLToPath } from 'node:url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers
});

const startApolloServer = async () => {
  // Start the Apollo Server
  await server.start();
  // Connect to MongoDB
  await db();

  // Initialize Express
  const PORT = process.env.PORT || 3001;
  const app = express();

  // Middleware for parsing
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // GraphQL endpoint with authnetication context
  app.use('/graphql', expressMiddleware(server as any,
    {
      context: authenticateToken as any
    }
  ));

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Serve React app for all unmatched routes
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  // Start Express server
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

startApolloServer();













const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
