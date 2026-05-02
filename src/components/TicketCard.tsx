import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Ticket, TicketStatus } from '../types';
import { MoreVertical, Mail, Clock, Calendar, ArrowRight, Edit3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TicketCardProps {
  ticket: Ticket;
  isOverlay?: boolean;
  onEdit?: (ticket: Ticket) => void;
  onStatusChange?: (id: string, newStatus: TicketStatus) => void;
}

const STATUS_OPTIONS: { label: string; value: TicketStatus; color: string }[] = [
  { label: 'Mark Pending',  value: TicketStatus.PENDING,   color: 'text-slate-600 dark:text-slate-300' },
  { label: 'Accept',        value: TicketStatus.ACCEPTED,  color: 'text-blue-600 dark:text-blue-400'  },
  { label: 'Resolve',       value: TicketStatus.RESOLVED,  color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Reject',        value: TicketStatus.REJECTED,  color: 'text-rose-600 dark:text-rose-400'  },
];

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, isOverlay, onEdit, onStatusChange }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // Close menu on outside click
  React.useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const now = new Date();
  const dueDate = new Date(ticket.due_date);
  const isOverdue = dueDate < now;
  const msUntilDue = dueDate.getTime() - now.getTime();
  const isNearDeadline = !isOverdue && msUntilDue < 24 * 60 * 60 * 1000;
  const isPending = ticket.status === 'pending';
  const deadlineUrgent = isPending && (isOverdue || isNearDeadline);

  const availableActions = STATUS_OPTIONS.filter(s => s.value !== ticket.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white dark:bg-[#1e1f20] p-3 rounded-xl border transition-all duration-200 group cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-0',
        isOverlay && 'shadow-2xl shadow-slate-900/20 dark:shadow-black/50 border-indigo-300 dark:border-[#3c4043] ring-4 ring-indigo-500/10 dark:ring-white/5 rotate-1 scale-[1.03]',
        !isOverlay && !isOverdue && 'border-slate-200 dark:border-[#3c4043] shadow-sm hover:shadow-lg hover:shadow-slate-200/80 dark:hover:shadow-black/40 hover:border-slate-300 dark:hover:border-slate-500 hover:-translate-y-0.5',
        !isOverlay && isOverdue && 'border-rose-500 shadow-sm shadow-rose-100 dark:shadow-rose-900/20 hover:shadow-lg hover:shadow-rose-100 dark:hover:shadow-rose-900/30 hover:-translate-y-0.5',
      )}
    >
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-black text-slate-400 dark:text-[#9aa0a6] uppercase tracking-tighter">Record ID</span>
          <span className="text-[9px] font-bold text-slate-500 dark:text-[#9aa0a6] font-mono tracking-tight bg-slate-100 dark:bg-[#2d2e30] px-1 rounded">
            {ticket.id.slice(0, 8)}
          </span>
        </div>

        {/* Quick Action Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onPointerDown={(e) => { e.stopPropagation(); }}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
            className="p-1 rounded-lg text-slate-300 dark:text-[#9aa0a6] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#2d2e30] transition-all"
            aria-label="Quick actions"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-6 z-50 w-44 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] rounded-xl shadow-xl shadow-slate-900/10 dark:shadow-black/50 py-1 overflow-hidden"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {onEdit && (
                <button
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-[#e3e3e3] hover:bg-slate-50 dark:hover:bg-[#2d2e30] flex items-center gap-2 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(ticket); }}
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400 dark:text-[#9aa0a6]" />
                  Edit Ticket
                </button>
              )}
              {onEdit && availableActions.length > 0 && (
                <div className="my-1 border-t border-slate-100 dark:border-[#3c4043]" />
              )}
              {availableActions.map((action) => (
                <button
                  key={action.value}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#2d2e30] flex items-center gap-2 transition-colors',
                    action.color
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onStatusChange?.(ticket.id, action.value);
                  }}
                >
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  Move to {action.label.replace('Mark ', '').replace('Move to ', '')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div {...attributes} {...listeners} className="outline-none">
        <h4 className={cn(
          'text-sm font-black mb-1 leading-tight line-clamp-2 transition-colors',
          isOverdue ? 'text-rose-900 dark:text-rose-400' : 'text-slate-900 dark:text-[#e3e3e3]'
        )}>
          {ticket.title}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-[#9aa0a6] line-clamp-2 mb-2.5 leading-relaxed font-medium">
          {ticket.description}
        </p>

        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-[#3c4043]/60">
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3 text-indigo-400 dark:text-indigo-500 shrink-0" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-[#9aa0a6] truncate">{ticket.contact_info}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-300 dark:text-[#9aa0a6]/60 shrink-0" />
            <span className="text-[10px] font-semibold text-slate-400 dark:text-[#9aa0a6]">
              Opened {formatDistanceToNow(new Date(ticket.created_at))} ago
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Calendar className={cn('w-3 h-3 shrink-0', deadlineUrgent ? 'text-rose-500' : 'text-slate-300 dark:text-[#9aa0a6]/60')} />
            <span className={cn('text-[10px] font-bold transition-colors', deadlineUrgent ? 'text-rose-500' : 'text-slate-400 dark:text-[#9aa0a6]')}>
              Deadline: {dueDate.toLocaleDateString()}
            </span>
            {deadlineUrgent && isOverdue && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-rose-600 dark:bg-rose-500/20 text-white dark:text-rose-400">
                Overdue
              </span>
            )}
            {deadlineUrgent && !isOverdue && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                Due soon
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
