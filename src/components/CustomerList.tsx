import React from 'react';
import { Ticket } from '../types';
import { User, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CustomerListProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
}

interface Customer {
  contact: string;
  ticketCount: number;
  lastInteraction: string;
  recentTickets: Ticket[];
}

export const CustomerList: React.FC<CustomerListProps> = ({ tickets, onTicketClick }) => {
  const customers = React.useMemo(() => {
    const map = new Map<string, Customer>();

    tickets.forEach(ticket => {
      const contact = ticket.contact_info;
      if (!map.has(contact)) {
        map.set(contact, {
          contact,
          ticketCount: 1,
          lastInteraction: ticket.updated_at,
          recentTickets: [ticket]
        });
      } else {
        const existing = map.get(contact)!;
        existing.ticketCount++;
        if (new Date(ticket.updated_at) > new Date(existing.lastInteraction)) {
          existing.lastInteraction = ticket.updated_at;
        }
        if (existing.recentTickets.length < 3) {
          existing.recentTickets.push(ticket);
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.ticketCount - a.ticketCount);
  }, [tickets]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {customers.map((customer, i) => (
        <div key={i} className="bg-white dark:bg-[#1e1f20] rounded-2xl border border-slate-200 dark:border-[#3c4043] shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="p-6 flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-[#2d2e30] flex items-center justify-center text-white dark:text-[#e3e3e3] transition-colors">
                <User className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 dark:text-[#9aa0a6] uppercase tracking-widest transition-colors">Total Tickets</p>
                <p className="text-xl font-black text-slate-900 dark:text-[#e3e3e3] transition-colors">{customer.ticketCount}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-[#e3e3e3] mb-1 truncate transition-colors">{customer.contact}</h3>
            <div className="flex items-center gap-2 text-slate-500 dark:text-[#9aa0a6] text-xs mb-6 transition-colors">
              <Mail className="w-3 h-3" />
              <span>{customer.contact}</span>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 dark:text-[#9aa0a6] uppercase tracking-widest transition-colors">Recent Activity</p>
              {customer.recentTickets.map((t, idx) => (
                <button 
                  key={idx} 
                  onClick={() => onTicketClick?.(t)}
                  className="w-full text-left flex items-start gap-3 p-2 bg-slate-50 dark:bg-[#0e0e11] rounded-lg group hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
                >
                  <div className="p-1.5 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] rounded-md text-slate-400 dark:text-[#9aa0a6] transition-colors">
                    <MessageSquare className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-[#e3e3e3] truncate transition-colors">{t.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-[#9aa0a6] transition-colors">#{t.id.slice(0,8)} • {t.status}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-[#0e0e11]/50 border-t border-slate-200 dark:border-[#3c4043] flex items-center justify-between transition-colors">
            <span className="text-[10px] font-medium text-slate-500 dark:text-[#9aa0a6] transition-colors">
              Active {formatDistanceToNow(new Date(customer.lastInteraction))} ago
            </span>
            <button className="text-slate-900 dark:text-[#e3e3e3] hover:text-slate-700 dark:hover:text-white font-bold text-xs flex items-center gap-1 transition-colors">
              Profile Details
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}

      {customers.length === 0 && (
        <div className="col-span-full py-20 text-center">
          <p className="text-slate-500 dark:text-[#9aa0a6] text-sm font-medium transition-colors">No customers found in current ticket database.</p>
        </div>
      )}
    </div>
  );
};
