import React from 'react';
import { X, Send, History, ClipboardList, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CreateTicketDTO, Ticket, TicketStatus, ChangeLog } from '../types';
import { ticketApi } from '../services/ticketService';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateTicketDTO) => void;
  initialData?: Ticket | null;
}

const STATUS_CONFIG: { value: TicketStatus; label: string; dot: string; ring: string }[] = [
  { value: TicketStatus.PENDING,  label: 'Pending',  dot: 'bg-slate-400 dark:bg-slate-500',   ring: 'ring-slate-200 dark:ring-[#3c4043]'   },
  { value: TicketStatus.ACCEPTED, label: 'Accepted', dot: 'bg-blue-400 dark:bg-blue-500',    ring: 'ring-blue-200 dark:ring-blue-800/60'    },
  { value: TicketStatus.RESOLVED, label: 'Resolved', dot: 'bg-emerald-400 dark:bg-emerald-500', ring: 'ring-emerald-200 dark:ring-emerald-800/60' },
  { value: TicketStatus.REJECTED, label: 'Rejected', dot: 'bg-rose-400 dark:bg-rose-500',    ring: 'ring-rose-200 dark:ring-rose-800/60'    },
];

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [activeTab, setActiveTab] = React.useState<'details' | 'history'>('details');
  const [history, setHistory] = React.useState<ChangeLog[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = React.useState<CreateTicketDTO>({
    title: '',
    description: '',
    contact_info: '',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: TicketStatus.PENDING,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        contact_info: initialData.contact_info,
        due_date: new Date(initialData.due_date).toISOString().split('T')[0],
        status: initialData.status,
      });
      fetchHistory(initialData.id);
    } else {
      setFormData({
        title: '',
        description: '',
        contact_info: '',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: TicketStatus.PENDING,
      });
      setHistory([]);
    }
    setActiveTab('details');
    setIsDropdownOpen(false);
  }, [initialData, isOpen]);

  // Handle outside click for dropdown
  React.useEffect(() => {
    if (!isDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen]);

  const fetchHistory = async (id: string) => {
    try {
      setLoadingHistory(true);
      const data = await ticketApi.getHistory(id);
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, changed_by: 'Staff Agent' });
    onClose();
  };

  const dueDate = formData.due_date ? new Date(formData.due_date) : null;
  const now = new Date();
  const isDeadlineOverdue = dueDate ? dueDate < now : false;
  const isDeadlineNear = dueDate && !isDeadlineOverdue
    ? (dueDate.getTime() - now.getTime()) < 24 * 60 * 60 * 1000
    : false;
  const deadlineUrgent = isDeadlineOverdue || isDeadlineNear;

  const selectedStatus = STATUS_CONFIG.find(s => s.value === formData.status) ?? STATUS_CONFIG[0];

  const renderChangeValue = (label: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        return (
          <div className="mt-2 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 dark:text-[#9aa0a6] uppercase">{label}:</div>
            <div className="grid grid-cols-2 gap-2 bg-slate-100/50 dark:bg-black/20 p-3 rounded-lg border border-slate-200/50 dark:border-white/5">
              {Object.entries(parsed)
                .filter(([k, v]) => !['id', 'created_at', 'updated_at'].includes(k) && v)
                .map(([k, v]) => (
                <div key={k} className="flex flex-col overflow-hidden">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-[#9aa0a6] font-bold truncate">{k.replace('_', ' ')}</span>
                  <span className="text-xs text-slate-700 dark:text-[#e3e3e3] truncate" title={String(v)}>{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
    } catch (e) {
      // Not JSON
    }
    
    return (
      <div className={label === 'From' ? 'line-through opacity-70 text-slate-500 dark:text-[#9aa0a6]' : 'text-indigo-600 dark:text-[#e3e3e3] font-medium'}>
        {label}: {value}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#1e1f20] rounded-2xl border border-slate-200 dark:border-[#3c4043] shadow-2xl w-full max-w-xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 dark:border-[#3c4043] flex items-center justify-between bg-slate-50/50 dark:bg-[#0e0e11]/50">
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-[#e3e3e3]">
                    {initialData ? `Ticket #${initialData.id.slice(0, 8)}` : 'Create New Ticket'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 dark:text-[#9aa0a6] mt-0.5">
                    {initialData ? 'Helpdesk Support — Staff Control Panel' : 'Helpdesk Support'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 dark:text-[#9aa0a6] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#2d2e30] rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {initialData && (
                <div className="flex px-6 pt-4 border-b border-slate-100 dark:border-[#3c4043] gap-6">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
                      activeTab === 'details' 
                        ? 'text-slate-900 dark:text-[#e3e3e3] border-slate-900 dark:border-[#e3e3e3]' 
                        : 'text-slate-400 dark:text-[#9aa0a6] border-transparent hover:text-slate-600 dark:hover:text-[#e3e3e3]'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    Record Details
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
                      activeTab === 'history' 
                        ? 'text-slate-900 dark:text-[#e3e3e3] border-slate-900 dark:border-[#e3e3e3]' 
                        : 'text-slate-400 dark:text-[#9aa0a6] border-transparent hover:text-slate-600 dark:hover:text-[#e3e3e3]'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    Change Logs
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'details' ? (
                  <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                      <label className="block text-xs font-black text-slate-400 dark:text-[#9aa0a6] uppercase tracking-[0.2em] mb-2 px-1">
                        Issue Title
                      </label>
                      <input
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-[#0e0e11] border border-slate-200 dark:border-[#3c4043] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 dark:focus:ring-white/5 focus:border-indigo-500 dark:focus:border-[#e3e3e3]/50 transition-all font-bold text-slate-900 dark:text-[#e3e3e3]"
                        placeholder="Core problem description"
                      />
                    </div>

                    <div className={cn("grid gap-4", initialData ? "grid-cols-12" : "grid-cols-1")}>
                      <div className={initialData ? "col-span-8" : "col-span-1"}>
                        <label className="block text-xs font-black text-slate-400 dark:text-[#9aa0a6] uppercase tracking-[0.2em] mb-2 px-1">
                          Contact Email / Info
                        </label>
                        <input
                          required
                          value={formData.contact_info}
                          onChange={e => setFormData({ ...formData, contact_info: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-[#0e0e11] border border-slate-200 dark:border-[#3c4043] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 dark:focus:ring-white/5 focus:border-indigo-500 dark:focus:border-[#e3e3e3]/50 transition-all font-bold text-slate-900 dark:text-[#e3e3e3]"
                          placeholder="Email or phone"
                        />
                      </div>

                      {initialData && (
                        <div className="col-span-4">
                          <label className="block text-xs font-black text-slate-400 dark:text-[#9aa0a6] uppercase tracking-[0.2em] mb-2 px-1">
                            Status
                          </label>
                          <div className="relative w-full" ref={dropdownRef}>
                            <button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className={cn(
                                'w-full flex items-center justify-between gap-3 bg-slate-50 dark:bg-[#0e0e11] border border-slate-200 dark:border-[#3c4043] rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200',
                                isDropdownOpen ? 'ring-4 ring-indigo-500/5 dark:ring-white/5 border-indigo-500 dark:border-[#e3e3e3]/50' : `ring-2 ${selectedStatus.ring}`
                              )}
                            >
                              <div className="flex items-center gap-2 text-slate-900 dark:text-[#e3e3e3]">
                                <span className={cn('w-2 h-2 rounded-full', selectedStatus.dot)} />
                                {selectedStatus.label}
                              </div>
                              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 dark:text-[#9aa0a6] transition-transform", isDropdownOpen && "rotate-180")} />
                            </button>
                            
                            {/* Custom Dropdown Menu */}
                            <AnimatePresence>
                              {isDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute left-0 top-full mt-1.5 w-48 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] shadow-xl shadow-slate-900/10 dark:shadow-black/50 rounded-xl p-1 z-50 origin-top-left"
                                >
                                  {STATUS_CONFIG.map(s => {
                                    const isActive = s.value === formData.status;
                                    return (
                                      <button
                                        key={s.value}
                                        type="button"
                                        onClick={() => {
                                          setFormData({ ...formData, status: s.value });
                                          setIsDropdownOpen(false);
                                        }}
                                        className={cn(
                                          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors font-bold',
                                          isActive 
                                            ? 'bg-slate-900 dark:bg-[#e3e3e3] text-white dark:text-[#0e0e11]' 
                                            : 'text-slate-600 dark:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#2d2e30]'
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          {/* Use a lighter dot when the item is active to stand out against dark text/background combos, or keep original */}
                                          <span className={cn('w-2 h-2 rounded-full', s.dot, isActive && 'ring-1 ring-white/20')} />
                                          {s.label}
                                        </div>
                                        {isActive && <Check className="w-4 h-4 opacity-80" />}
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={cn(
                        'block text-xs font-black uppercase tracking-[0.2em] mb-2 px-1',
                        deadlineUrgent ? 'text-rose-500' : 'text-slate-400 dark:text-[#9aa0a6]'
                      )}>
                        Deadline {deadlineUrgent && (
                          <span className="ml-1 normal-case font-bold text-[10px] text-rose-500">
                            {isDeadlineOverdue ? '· Overdue' : '· Due soon'}
                          </span>
                        )}
                      </label>
                      <input
                        required
                        type="date"
                        value={formData.due_date}
                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                        className={cn(
                          'w-full bg-slate-50 dark:bg-[#0e0e11] border rounded-xl px-4 py-3 text-sm transition-all font-bold',
                          'focus:outline-none focus:ring-4',
                          deadlineUrgent
                            ? 'border-rose-300 dark:border-rose-500/50 text-rose-600 dark:text-rose-400 focus:ring-rose-500/10 focus:border-rose-500 dark:focus:border-rose-500'
                            : 'border-slate-200 dark:border-[#3c4043] text-slate-900 dark:text-[#e3e3e3] focus:ring-indigo-500/5 dark:focus:ring-white/5 focus:border-indigo-500 dark:focus:border-[#e3e3e3]/50',
                          'dark:[color-scheme:dark]' 
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 dark:text-[#9aa0a6] uppercase tracking-[0.2em] mb-2 px-1">
                        Description
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-[#0e0e11] border border-slate-200 dark:border-[#3c4043] rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 dark:focus:ring-white/5 focus:border-indigo-500 dark:focus:border-[#e3e3e3]/50 transition-all resize-none font-medium leading-relaxed text-slate-600 dark:text-[#9aa0a6]"
                        placeholder="Provide granular context for this support record..."
                      />
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-bold text-slate-500 dark:text-[#9aa0a6] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#2d2e30] rounded-xl transition-all"
                      >
                        Dismiss
                      </button>
                      <button
                        type="submit"
                        className="flex-[2] py-3 bg-slate-900 dark:bg-[#e3e3e3] text-white dark:text-[#0e0e11] rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 dark:shadow-white/10"
                      >
                        <Send className="w-4 h-4" />
                        {initialData ? 'Commit Changes' : 'Create Live Record'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6">
                    {loadingHistory ? (
                      <div className="flex justify-center py-12">
                        <div className="w-6 h-6 border-2 border-slate-900 dark:border-[#e3e3e3] border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 dark:text-[#3c4043]">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-medium">No system history found for this record.</p>
                      </div>
                    ) : (
                      <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-[#3c4043]">
                        {history.map((entry) => (
                          <div key={entry.id} className="relative pl-8">
                            <div className="absolute left-0 top-1.5 w-6 h-6 bg-white dark:bg-[#1e1f20] border-2 border-slate-900 dark:border-[#e3e3e3] rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-slate-900 dark:bg-[#e3e3e3] rounded-full" />
                            </div>
                            <div className="bg-slate-50 dark:bg-[#0e0e11] border border-slate-200 dark:border-[#3c4043] rounded-xl p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-[#9aa0a6] uppercase">
                                  {formatDistanceToNow(new Date(entry.timestamp))} ago
                                </span>
                              </div>
                              <p className="text-sm font-black text-slate-900 dark:text-[#e3e3e3] mb-1">
                                {entry.action_description}
                              </p>
                              {(entry.old_value || entry.new_value) && (
                                <div className="mt-3 text-xs bg-white dark:bg-[#1e1f20] p-3 rounded-xl border border-slate-100 dark:border-[#3c4043] space-y-2">
                                  {entry.old_value && renderChangeValue('From', entry.old_value)}
                                  {entry.new_value && renderChangeValue('To', entry.new_value)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
