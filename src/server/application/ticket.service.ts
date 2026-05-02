import { Ticket, CreateTicketDTO, UpdateTicketDTO, TicketStatus, ChangeLog } from '../entities/ticket';
import { ticketRepository, TicketRepository } from '../persistence/ticket.repository';

export class TicketService {
  constructor(private repository: TicketRepository) {}

  async getAllTickets(options?: { status?: TicketStatus, sort?: string, order?: 'asc' | 'desc' }): Promise<Ticket[]> {
    return await this.repository.findAll(options);
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    return await this.repository.findById(id);
  }

  async createTicket(dto: CreateTicketDTO): Promise<Ticket> {
    // Basic validation
    if (!dto.title || dto.title.trim() === '') {
      throw new Error('Issue Summary is required');
    }
    if (!dto.contact_info || dto.contact_info.trim() === '') {
      throw new Error('Contact Info is required');
    }
    
    const { changed_by, ...ticketData } = dto;
    const ticket = await this.repository.create(ticketData);
    
    // Record history
    await this.repository.createHistory({
      ticket_id: ticket.id,
      action_description: 'Ticket Created',
      new_value: JSON.stringify(ticket)
    });
    
    return ticket;
  }

  async updateTicket(id: string, dto: UpdateTicketDTO): Promise<Ticket> {
    const existing = await this.getTicketById(id);
    if (!existing) {
      throw new Error('Ticket not found');
    }
    
    const { changed_by, ...updateData } = dto;
    
    let updated: Ticket | undefined;
    try {
      updated = await this.repository.update(id, updateData);
    } catch (error: any) {
      console.error(`[TicketService] Repository update failed for ticket ${id}:`, error);
      throw new Error(`Database Update Error: ${error.message || 'Unknown error'}`);
    }

    if (!updated) {
      throw new Error('Failed to update ticket record');
    }

    // Process specific changes for the log - wrap in try/catch to avoid blocking main update
    try {
      if (dto.status && dto.status !== existing.status) {
        await this.repository.createHistory({
          ticket_id: id,
          action_description: `Status updated: ${existing.status} → ${dto.status}`,
          old_value: existing.status,
          new_value: dto.status
        });
      }

      if (dto.due_date && dto.due_date !== existing.due_date) {
        await this.repository.createHistory({
          ticket_id: id,
          action_description: 'Due Date Updated',
          old_value: existing.due_date,
          new_value: dto.due_date
        });
      }

      if (dto.title && dto.title !== existing.title) {
        await this.repository.createHistory({
          ticket_id: id,
          action_description: 'Title Updated',
          old_value: existing.title,
          new_value: dto.title
        });
      }

      if (dto.contact_info && dto.contact_info !== existing.contact_info) {
        await this.repository.createHistory({
          ticket_id: id,
          action_description: 'Contact Info Updated',
          old_value: existing.contact_info,
          new_value: dto.contact_info
        });
      }

      if (dto.description && dto.description !== existing.description) {
        await this.repository.createHistory({
          ticket_id: id,
          action_description: 'Description Updated',
          old_value: existing.description,
          new_value: dto.description
        });
      }
    } catch (historyError: any) {
      console.error(`[TicketService] History recording failed for ticket ${id}:`, historyError);
      // We don't throw here to allow the main update to succeed, 
      // but in production you might want to handle this differently.
    }

    return updated;
  }

  async getTicketHistory(ticketId: string): Promise<ChangeLog[]> {
    return await this.repository.findHistoryByTicketId(ticketId);
  }
  
  // Note: No deleteTicket method as per "No Delete Policy"
}

export const ticketService = new TicketService(ticketRepository);
