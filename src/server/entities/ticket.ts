export interface Ticket {
  id: string;
  title: string;
  description: string;
  contact_info: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  due_date: string;
}

export interface ChangeLog {
  id: string;
  ticket_id: string;
  action_description: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
}

export enum TicketStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export interface CreateTicketDTO {
  title: string;
  description: string;
  contact_info: string;
  due_date: string;
  changed_by?: string;
}

export interface UpdateTicketDTO {
  status?: TicketStatus;
  title?: string;
  description?: string;
  contact_info?: string;
  due_date?: string;
  changed_by?: string;
}
