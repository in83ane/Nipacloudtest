import { Router, Request, Response } from 'express';
import { ticketService } from '../application/ticket.service';

import { TicketStatus } from '../entities/ticket';

const router = Router();

// GET /api/tickets
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, sort, order } = req.query;
    
    const tickets = await ticketService.getAllTickets({
      status: status as TicketStatus,
      sort: sort as string,
      order: order as 'asc' | 'desc'
    });
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tickets/:id/history
router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const history = await ticketService.getTicketHistory(req.params.id);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tickets
router.post('/', async (req: Request, res: Response) => {
  try {
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/tickets/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.body);
    res.json(ticket);
  } catch (error: any) {
    const status = error.message === 'Ticket not found' ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

export default router;
