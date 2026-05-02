import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import ticketRouter from '../src/server/presentation/ticket.controller';
import { errorHandler } from '../src/server/presentation/middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Mount ticket routes at root - Vercel passes the full path
// We mount it under /api/tickets so Express can match /, /:id, /:id/history
app.use('/api/tickets', ticketRouter);
app.use(errorHandler as any);

export default (req: VercelRequest, res: VercelResponse) => {
  // @ts-ignore - VercelRequest is compatible enough with IncomingMessage
  return app(req, res);
};
