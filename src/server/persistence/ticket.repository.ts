import { Ticket, TicketStatus, CreateTicketDTO, UpdateTicketDTO, ChangeLog } from '../entities/ticket';
import { supabase } from './supabase';

export class TicketRepository {
  async findAll(options?: { status?: TicketStatus, sort?: string, order?: 'asc' | 'desc' }): Promise<Ticket[]> {
    let query = supabase.from('tickets').select('*');

    if (options?.status && options.status !== 'all' as any) {
      query = query.eq('status', options.status);
    }

    if (options?.sort) {
      query = query.order(options.sort, { ascending: options.order === 'asc' });
    } else {
      query = query.order('updated_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findById(id: string): Promise<Ticket | undefined> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
    return data || undefined;
  }

  async create(dto: CreateTicketDTO): Promise<Ticket> {
    const { changed_by, ...ticketData } = dto;
    const now = new Date();
    const created_at = now.toISOString();
    
    // If due_date is provided, use it. Otherwise default to +3 days.
    let finalDueDate = ticketData.due_date;
    if (!finalDueDate) {
      const due = new Date(now);
      due.setDate(due.getDate() + 3);
      finalDueDate = due.toISOString();
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        ...ticketData,
        status: TicketStatus.PENDING,
        created_at,
        updated_at: created_at,
        due_date: finalDueDate,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, dto: UpdateTicketDTO): Promise<Ticket | undefined> {
    const { changed_by, ...updateData } = dto;
    const { data, error } = await supabase
      .from('tickets')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data || undefined;
  }

  async createHistory(history: Omit<ChangeLog, 'id' | 'timestamp'>): Promise<void> {
    const dbPayload = {
      ticket_id: history.ticket_id,
      action_type: history.action_description.includes('Created') ? 'CREATE' : 'UPDATE',
      change_summary: history.action_description,
      old_value: history.old_value,
      new_value: history.new_value,
    };

    const { error } = await supabase
      .from('change_logs')
      .insert(dbPayload);
    if (error) throw error;
  }

  async findHistoryByTicketId(ticketId: string): Promise<ChangeLog[]> {
    const { data, error } = await supabase
      .from('change_logs')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map((row: any) => ({
      id: row.id,
      ticket_id: row.ticket_id,
      action_description: row.change_summary || row.action_type,
      old_value: row.old_value,
      new_value: row.new_value,
      timestamp: row.created_at,
    }));
  }
}

export const ticketRepository = new TicketRepository();
