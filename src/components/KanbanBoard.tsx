import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  rectIntersection,
  getFirstCollision,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Ticket, TicketStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { TicketCard } from './TicketCard';
import { cn } from '../lib/utils';

interface KanbanBoardProps {
  tickets: Ticket[];
  onStatusChange: (id: string, newStatus: TicketStatus) => void;
  onEdit?: (ticket: Ticket) => void;
  statusFilter?: TicketStatus | 'all';
}

const COLUMNS: {
  id: TicketStatus;
  title: string;
  color: string;
  accentBg: string;
  accentBorder: string;
}[] = [
  {
    id: TicketStatus.PENDING,
    title: 'Pending',
    color: 'bg-slate-400 dark:bg-slate-500',
    accentBg: 'bg-slate-100 dark:bg-[#2d2e30]/80',
    accentBorder: 'border-slate-300 dark:border-[#3c4043]',
  },
  {
    id: TicketStatus.ACCEPTED,
    title: 'Accepted',
    color: 'bg-blue-400 dark:bg-blue-500',
    accentBg: 'bg-blue-50 dark:bg-blue-900/20',
    accentBorder: 'border-blue-200 dark:border-blue-800/60',
  },
  {
    id: TicketStatus.RESOLVED,
    title: 'Resolved',
    color: 'bg-emerald-400 dark:bg-emerald-500',
    accentBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    accentBorder: 'border-emerald-200 dark:border-emerald-800/60',
  },
  {
    id: TicketStatus.REJECTED,
    title: 'Rejected',
    color: 'bg-rose-400 dark:bg-rose-500',
    accentBg: 'bg-rose-50 dark:bg-rose-900/20',
    accentBorder: 'border-rose-200 dark:border-rose-800/60',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tickets,
  onStatusChange,
  onEdit,
  statusFilter = 'all',
}) => {
  const [activeTicket, setActiveTicket] = React.useState<Ticket | null>(null);

  const displayedColumns = React.useMemo(() => {
    if (statusFilter === 'all') return COLUMNS;
    return COLUMNS.filter(c => c.id === statusFilter);
  }, [statusFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = tickets.find(t => t.id === event.active.id);
    if (ticket) setActiveTicket(ticket);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) { setActiveTicket(null); return; }

    const ticketId = active.id as string;
    const overId = over.id as string;

    const overColumn = COLUMNS.find(c => c.id === overId);
    const overTicket = tickets.find(t => t.id === overId);
    const newStatus = overColumn?.id ?? overTicket?.status;

    if (newStatus && newStatus !== activeTicket?.status) {
      onStatusChange(ticketId, newStatus as TicketStatus);
    }
    setActiveTicket(null);
  };

  const collisionDetection = React.useCallback((args: any) => {
    const cc = closestCorners(args);
    if (getFirstCollision(cc, 'id') != null) return cc;
    return rectIntersection(args);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          'h-[calc(100vh-theme(spacing.32))]',
          'grid gap-4 w-full',
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          'overflow-y-auto lg:overflow-hidden pb-2'
        )}
      >
        {displayedColumns.map(column => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            accentBg={column.accentBg}
            accentBorder={column.accentBorder}
            tickets={tickets.filter(t => t.status === column.id)}
            onEdit={onEdit}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: '0.4' } },
          }),
        }}
      >
        {activeTicket ? <TicketCard ticket={activeTicket} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};
