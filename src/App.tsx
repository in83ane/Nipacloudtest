import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { TicketList } from './components/TicketList';
import { ReportingDashboard } from './components/ReportingDashboard';
import { CustomerList } from './components/CustomerList';
import { StatusDropdown } from './components/StatusDropdown';
import { SortDropdown } from './components/SortDropdown';
import { TicketModal } from './components/CreateTicketModal';
import { Ticket, TicketStatus, CreateTicketDTO } from './types';
import { ticketApi } from './services/ticketService';
import { Search, Plus, Bell, Settings, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

const comingSoon = (feature: string) =>
  toast(`${feature} — Coming Soon!`, {
    icon: '🚧',
    style: {
      borderRadius: '14px',
      background: '#0f172a',
      color: '#f8fafc',
      fontSize: '13px',
      fontWeight: '700',
      padding: '12px 18px',
      boxShadow: '0 20px 60px -10px rgba(0,0,0,0.35)',
    },
    duration: 2500,
  });

export default function App() {
  const [activeTab, setActiveTab] = React.useState('tickets');
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTicket, setEditingTicket] = React.useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<TicketStatus | 'all'>('all');
  const [sortField, setSortField] = React.useState<'updated_at' | 'due_date'>('updated_at');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [error, setError] = React.useState<string | null>(null);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  const fetchTickets = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await ticketApi.getAll({ sort: sortField, order: sortOrder });
      setTickets(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tickets. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sortField, sortOrder]);

  React.useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleStatusChange = async (id: string, newStatus: TicketStatus) => {
    const originalTickets = [...tickets];
    const ticketToUpdate = tickets.find(t => t.id === id);
    if (!ticketToUpdate || ticketToUpdate.status === newStatus) return;

    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t
    ));

    try {
      const updated = await ticketApi.update(id, { status: newStatus });
      setTickets(prev => prev.map(t => t.id === id ? updated : t));
      setError(null);
    } catch (err) {
      setTickets(originalTickets);
      setError('Could not update ticket status. Changes reverted.');
    }
  };

  const handleTicketSubmit = async (dto: CreateTicketDTO) => {
    if (!dto.title.trim() || !dto.contact_info.trim()) {
      setError('Title and Contact Information are required.');
      return;
    }
    try {
      if (editingTicket) {
        // Pass status so the board re-sorts the card immediately
        const updated = await ticketApi.update(editingTicket.id, {
          title: dto.title,
          description: dto.description,
          contact_info: dto.contact_info,
          due_date: dto.due_date,
          status: dto.status,
          changed_by: dto.changed_by,
        });
        setTickets(prev => prev.map(t => t.id === editingTicket.id ? updated : t));
      } else {
        const newTicket = await ticketApi.create(dto);
        setTickets(prev => [newTicket, ...prev]);
      }
      setError(null);
      setIsModalOpen(false);
      setEditingTicket(null);
    } catch (err) {
      setError(`Failed to ${editingTicket ? 'update' : 'create'} ticket. Please try again.`);
    }
  };

  const openCreateModal = () => { setEditingTicket(null); setIsModalOpen(true); };
  const openEditModal = (ticket: Ticket) => { setEditingTicket(ticket); setIsModalOpen(true); };

  const filteredTickets = React.useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const filtered = tickets.filter(t => {
      if (!term) return statusFilter === 'all' || t.status === statusFilter;

      const dueDateFormatted = new Date(t.due_date).toLocaleDateString();
      const dueDateISO = t.due_date.slice(0, 10);

      const matchesSearch =
        t.title.toLowerCase().includes(term) ||
        t.id.toLowerCase().includes(term) ||
        t.contact_info.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        dueDateFormatted.includes(term) ||
        dueDateISO.includes(term);

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [tickets, searchTerm, statusFilter, sortField, sortOrder]);

  return (
    <div className="h-screen flex font-sans antialiased overflow-hidden transition-colors">
      {/* Global toast provider */}
      <Toaster position="bottom-right" />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 ml-[240px] h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0e0e11] transition-colors">
        {/* ── Header ── */}
        <header className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-[#e3e3e3] tracking-tight">
              Helpdesk Support
            </h2>
            <p className="text-slate-500 dark:text-[#9aa0a6] text-sm font-medium mt-1">
              {activeTab === 'dashboard' ? 'Portal Intelligence' :
               activeTab === 'tickets'   ? 'Service Operations'  :
               activeTab === 'customers' ? 'Resource Directory'  : 'System Metadata'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] rounded-full shadow-sm transition-colors">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-slate-400 dark:text-[#9aa0a6] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-50 dark:hover:bg-[#2d2e30] rounded-full transition-all"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>
              {/* Notifications */}
              <button
                onClick={() => comingSoon('Notifications')}
                className="p-2 text-slate-400 dark:text-[#9aa0a6] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-50 dark:hover:bg-[#2d2e30] rounded-full transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
              {/* Profile Settings */}
              <button
                onClick={() => comingSoon('Profile Settings')}
                className="p-2 text-slate-400 dark:text-[#9aa0a6] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-50 dark:hover:bg-[#2d2e30] rounded-full transition-all"
                aria-label="Profile settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              {/* Avatar */}
              <button
                onClick={() => comingSoon('Profile')}
                className="w-9 h-9 rounded-full bg-slate-900 dark:bg-[#2d2e30] overflow-hidden border-2 border-transparent hover:border-indigo-400 dark:hover:border-[#3c4043] transition-all"
                aria-label="User profile"
              >
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
              </button>
            </div>

            <button
              onClick={openCreateModal}
              className="bg-slate-900 dark:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-slate-900/10 dark:shadow-indigo-900/20 hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Ticket
            </button>
          </div>
        </header>

        {/* ── Filters (tickets tab only) ── */}
        {activeTab === 'tickets' && (
          <div className="flex flex-col md:flex-row gap-3 px-6 pb-4 shrink-0">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 dark:text-[#9aa0a6] dark:group-focus-within:text-[#e3e3e3] transition-colors" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-white/5 focus:border-slate-300 dark:focus:border-[#e3e3e3]/50 transition-all shadow-sm text-slate-900 dark:text-[#e3e3e3] placeholder-slate-400 dark:placeholder-[#9aa0a6]"
                placeholder="Search by title, contact, description, or deadline date…"
              />
            </div>

            <div className="flex gap-3">
              <SortDropdown
                field={sortField}
                order={sortOrder}
                onChange={(f, o) => { setSortField(f); setSortOrder(o); }}
              />
              <StatusDropdown value={statusFilter} onChange={setStatusFilter} />
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm transition-colors">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                    viewMode === 'kanban' ? 'bg-slate-900 dark:bg-[#2d2e30] text-white dark:text-[#e3e3e3]' : 'text-slate-500 dark:text-[#9aa0a6] hover:bg-slate-50 dark:hover:bg-[#2d2e30]/50'
                  )}
                >Kanban</button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                    viewMode === 'list' ? 'bg-slate-900 dark:bg-[#2d2e30] text-white dark:text-[#e3e3e3]' : 'text-slate-500 dark:text-[#9aa0a6] hover:bg-slate-50 dark:hover:bg-[#2d2e30]/50'
                  )}
                >List</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Error toast ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-6 right-6 z-[100] bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm backdrop-blur-sm"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {error}
              <button onClick={() => setError(null)} className="ml-4 hover:text-rose-900 dark:hover:text-white transition-colors">
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main content area ── */}
        <div className="flex-1 min-h-0 flex flex-col px-6 pb-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-xs"
              >
                <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-indigo-500 rounded-full animate-spin mr-3" />
                Loading System...
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-h-0 flex flex-col"
              >
                {activeTab === 'dashboard' && (
                  <ReportingDashboard tickets={tickets} />
                )}

                {activeTab === 'tickets' && (
                  <div className="flex-1 min-h-0">
                    {viewMode === 'kanban' ? (
                      <KanbanBoard
                        tickets={filteredTickets}
                        onStatusChange={handleStatusChange}
                        onEdit={openEditModal}
                        statusFilter={statusFilter}
                      />
                    ) : (
                      <TicketList tickets={filteredTickets} onEdit={openEditModal} />
                    )}
                  </div>
                )}

                {activeTab === 'customers' && (
                  <CustomerList tickets={tickets} onTicketClick={openEditModal} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <TicketModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleTicketSubmit}
          initialData={editingTicket}
        />
      </main>
    </div>
  );
}
