import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ArrowUpDown, Check, Clock, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

export type SortField = 'updated_at' | 'due_date';
export type SortOrder = 'asc' | 'desc';

interface SortOption {
  id: string;
  field: SortField;
  order: SortOrder;
  label: string;
  icon: React.ElementType;
}

const SORT_OPTIONS: SortOption[] = [
  { id: 'updated_desc', field: 'updated_at', order: 'desc', label: 'Latest Activity', icon: Clock },
  { id: 'updated_asc', field: 'updated_at', order: 'asc', label: 'Oldest Activity', icon: Clock },
  { id: 'due_asc', field: 'due_date', order: 'asc', label: 'Urgency: Soonest Deadline', icon: Calendar },
  { id: 'due_desc', field: 'due_date', order: 'desc', label: 'Latest Deadline', icon: Calendar },
];

interface SortDropdownProps {
  field: SortField;
  order: SortOrder;
  onChange: (field: SortField, order: SortOrder) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ field, order, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = SORT_OPTIONS.find(opt => opt.field === field && opt.order === order) || SORT_OPTIONS[0];

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-5 py-3 bg-white dark:bg-white/5 border rounded-2xl text-sm font-bold transition-all shadow-sm group",
          isOpen ? "border-slate-900 dark:border-white/20 ring-2 ring-slate-900/5 dark:ring-white/5" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
        )}
      >
        <ArrowUpDown className={cn(
          "w-4 h-4 transition-colors",
          isOpen ? "text-slate-900 dark:text-[#e3e3e3]" : "text-slate-400 dark:text-[#9aa0a6]"
        )} />
        
        <div className="flex items-center gap-2">
          <selectedOption.icon className="w-3.5 h-3.5 text-slate-400 dark:text-[#9aa0a6]" />
          <span className="text-slate-700 dark:text-[#e3e3e3] whitespace-nowrap">{selectedOption.label}</span>
        </div>

        <ChevronDown className={cn(
          "w-4 h-4 text-slate-400 dark:text-[#9aa0a6] transition-transform duration-300",
          isOpen && "rotate-180 text-slate-900 dark:text-[#e3e3e3]"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] rounded-2xl shadow-xl dark:shadow-black/50 z-50 overflow-hidden"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-[10px] font-black text-slate-400 dark:text-[#9aa0a6] uppercase tracking-widest border-b border-slate-50 dark:border-[#3c4043] mb-1">
                Sort Intelligence
              </div>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.field, option.order);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left",
                    selectedOption.id === option.id 
                      ? "bg-slate-900 dark:bg-[#e3e3e3] text-white dark:text-[#0e0e11]" 
                      : "text-slate-600 dark:text-[#e3e3e3] hover:bg-slate-50 dark:hover:bg-[#2d2e30]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <option.icon className={cn(
                      "w-4 h-4",
                      selectedOption.id === option.id ? "text-white dark:text-[#0e0e11]" : "text-slate-400 dark:text-[#9aa0a6]"
                    )} />
                    {option.label}
                  </div>
                  {selectedOption.id === option.id && <Check className="w-4 h-4 text-white dark:text-[#0e0e11]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
