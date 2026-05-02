import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import ticketRouter from '../src/server/presentation/ticket.controller';
import { errorHandler } from '../src/server/presentation/middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Vercel rewrites /api/* to this file. 
// We mount the router at /api/tickets so the paths align perfectly with the frontend fetch requests.
app.use('/api/tickets', ticketRouter);
app.use(errorHandler as any);

export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};

