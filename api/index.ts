import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ticketService } from '../src/server/application/ticket.service';
import { TicketStatus } from '../src/server/entities/ticket';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Parse path: /api/tickets, /api/tickets/:id, /api/tickets/:id/history
    const url = req.url || '';
    const match = url.match(/\/api\/tickets(?:\/([^/?]+))?(?:\/(history))?/);

    if (!match) {
      return res.status(404).json({ error: 'Not found' });
    }

    const ticketId = match[1]; // undefined for /api/tickets
    const isHistory = match[2] === 'history';

    // GET /api/tickets/:id/history
    if (req.method === 'GET' && ticketId && isHistory) {
      const history = await ticketService.getTicketHistory(ticketId);
      return res.status(200).json(history);
    }

    // GET /api/tickets/:id
    if (req.method === 'GET' && ticketId) {
      const ticket = await ticketService.getTicketById(ticketId);
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
      return res.status(200).json(ticket);
    }

    // GET /api/tickets
    if (req.method === 'GET') {
      const { status, sort, order } = req.query;
      const tickets = await ticketService.getAllTickets({
        status: status as TicketStatus,
        sort: sort as string,
        order: order as 'asc' | 'desc',
      });
      return res.status(200).json(tickets);
    }

    // POST /api/tickets
    if (req.method === 'POST') {
      const ticket = await ticketService.createTicket(req.body);
      return res.status(201).json(ticket);
    }

    // PATCH /api/tickets/:id
    if (req.method === 'PATCH' && ticketId) {
      const ticket = await ticketService.updateTicket(ticketId, req.body);
      return res.status(200).json(ticket);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[Vercel API Error]', error);
    const status = error.message === 'Ticket not found' ? 404 : 500;
    return res.status(status).json({ error: error.message });
  }
}
