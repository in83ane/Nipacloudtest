import React from 'react';
import { Ticket, TicketStatus } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { Edit2 } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  onEdit: (ticket: Ticket) => void;
}

export const TicketList: React.FC<TicketListProps> = ({ tickets, onEdit }) => {
  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING: return 'bg-slate-100 text-slate-700';
      case TicketStatus.ACCEPTED: return 'bg-blue-100 text-blue-700';
      case TicketStatus.RESOLVED: return 'bg-emerald-100 text-emerald-700';
      case TicketStatus.REJECTED: return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Updated At</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-4 px-6 text-sm font-mono text-slate-500 uppercase">{ticket.id}</td>
                <td className="py-4 px-6">
                  <div className="text-sm font-bold text-slate-900 mb-0.5">{ticket.title}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[240px]">{ticket.description}</div>
                </td>
                <td className="py-4 px-6">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    getStatusColor(ticket.status)
                  )}>
                    {ticket.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">{ticket.contact_info}</td>
                <td className="py-4 px-6 text-sm text-slate-500">
                  {format(new Date(ticket.updated_at), 'MMM dd, HH:mm')}
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                    onClick={() => onEdit(ticket)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 bg-transparent hover:bg-slate-200 rounded-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tickets.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-slate-500 text-sm">No tickets matching your filters.</p>
        </div>
      )}
    </div>
  );
};
