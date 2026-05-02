import { Ticket, CreateTicketDTO, TicketStatus, ChangeLog } from '../types';

const API_BASE = '/api/tickets';

export const ticketApi = {
  async getAll(params?: { status?: string; sort?: string; order?: 'asc' | 'desc' }): Promise<Ticket[]> {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'all') searchParams.append('status', params.status);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.order) searchParams.append('order', params.order);

    const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch tickets');
    return res.json();
  },

  async create(dto: CreateTicketDTO): Promise<Ticket> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Failed to create ticket');
    return res.json();
  },

  async update(id: string, dto: any): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Failed to update ticket');
    return res.json();
  },

  async getHistory(id: string): Promise<ChangeLog[]> {
    const res = await fetch(`${API_BASE}/${id}/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  }
};
