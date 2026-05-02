import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Ticket, TicketStatus } from '../types';
import { TicketCard } from './TicketCard';
import { cn } from '../lib/utils';
import { Inbox } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  tickets: Ticket[];
  color: string;
  accentBg: string;
  accentBorder: string;
  onEdit?: (ticket: Ticket) => void;
  onStatusChange?: (id: string, newStatus: TicketStatus) => void;
  className?: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id, title, tickets, color, accentBg, accentBorder, onEdit, onStatusChange, className,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        'flex flex-col h-full rounded-xl border overflow-hidden',
        'transition-all duration-200',
        isOver
          ? `${accentBg} ${accentBorder} shadow-lg scale-[1.01]`
          : 'bg-slate-50/60 dark:bg-[#1e1f20] border-slate-200 dark:border-[#3c4043]',
        className
      )}
    >
      {/* ── Sticky column header ── */}
      <div className="px-3 py-2.5 border-b border-slate-200/80 dark:border-[#3c4043]/80 flex items-center justify-between bg-white/90 dark:bg-[#1e1f20]/90 backdrop-blur-sm shrink-0 transition-colors">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', color)} />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-[#e3e3e3] transition-colors">
            {title}
          </h3>
        </div>
        <span className={cn(
          'px-2.5 py-0.5 rounded-full text-[10px] font-black transition-colors',
          isOver 
            ? 'bg-white/80 dark:bg-[#2d2e30] text-slate-600 dark:text-[#e3e3e3]' 
            : 'bg-slate-100 dark:bg-[#2d2e30] text-slate-500 dark:text-[#9aa0a6]'
        )}>
          {tickets.length}
        </span>
      </div>

      {/* ── Scrollable card list ── */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar"
      >
        <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
            />
          ))}

          {/* ── Empty state ── */}
          {tickets.length === 0 && (
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 px-4 mt-2',
                'transition-all duration-200',
                isOver
                  ? `${accentBorder} bg-white/70 dark:bg-[#2d2e30]/50`
                  : 'border-slate-200/80 dark:border-[#3c4043]/80 bg-transparent'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                isOver ? 'bg-slate-100 dark:bg-[#3c4043]' : 'bg-slate-50 dark:bg-[#2d2e30]/50'
              )}>
                <Inbox className={cn(
                  'w-4 h-4 transition-colors',
                  isOver ? 'text-slate-500 dark:text-[#e3e3e3]' : 'text-slate-300 dark:text-[#9aa0a6]'
                )} />
              </div>
              <div className="text-center space-y-1">
                <p className={cn(
                  'text-[11px] font-bold tracking-wide transition-colors',
                  isOver ? 'text-slate-600 dark:text-[#e3e3e3]' : 'text-slate-400 dark:text-[#9aa0a6]'
                )}>
                  {isOver ? 'Drop to move here' : 'No tickets in this stage'}
                </p>
              </div>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};
