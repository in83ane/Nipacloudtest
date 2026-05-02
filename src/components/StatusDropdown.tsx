import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Filter, Check } from 'lucide-react';
import { TicketStatus } from '../types';
import { cn } from '../lib/utils';

interface StatusOption {
  value: TicketStatus | 'all';
  label: string;
  color: string;
}

const OPTIONS: StatusOption[] = [
  { value: 'all', label: 'All Status', color: 'bg-slate-400 dark:bg-slate-500' },
  { value: TicketStatus.PENDING, label: 'Pending', color: 'bg-slate-400 dark:bg-slate-500' },
  { value: TicketStatus.ACCEPTED, label: 'Accepted', color: 'bg-blue-400 dark:bg-blue-500' },
  { value: TicketStatus.RESOLVED, label: 'Resolved', color: 'bg-emerald-400 dark:bg-emerald-500' },
  { value: TicketStatus.REJECTED, label: 'Rejected', color: 'bg-rose-400 dark:bg-rose-500' },
];

interface StatusDropdownProps {
  value: TicketStatus | 'all';
  onChange: (value: TicketStatus | 'all') => void;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = OPTIONS.find(opt => opt.value === value) || OPTIONS[0];

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
        <Filter className={cn(
          "w-4 h-4 transition-colors",
          isOpen ? "text-slate-900 dark:text-[#e3e3e3]" : "text-slate-400 dark:text-[#9aa0a6]"
        )} />
        
        <div className="flex items-center gap-2">
          <div className={cn("w-1.5 h-1.5 rounded-full", selectedOption.color)} />
          <span className="text-slate-700 dark:text-[#e3e3e3]">{selectedOption.label}</span>
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
            className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] rounded-2xl shadow-xl dark:shadow-black/50 z-50 overflow-hidden"
          >
            <div className="p-2">
              {OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                    value === option.value 
                      ? "bg-slate-900 dark:bg-[#e3e3e3] text-white dark:text-[#0e0e11]" 
                      : "text-slate-600 dark:text-[#e3e3e3] hover:bg-slate-50 dark:hover:bg-[#2d2e30]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      value === option.value ? "bg-white dark:bg-[#0e0e11]" : option.color
                    )} />
                    {option.label}
                  </div>
                  {value === option.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
