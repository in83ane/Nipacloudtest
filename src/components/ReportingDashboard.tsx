import React from 'react';
import { Ticket, TicketStatus } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Sector
} from 'recharts';
import { CheckCircle2, Clock, AlertCircle, BarChart3 } from 'lucide-react';

interface ReportingDashboardProps {
  tickets: Ticket[];
}

export const ReportingDashboard: React.FC<ReportingDashboardProps> = ({ tickets }) => {
  const stats = React.useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter(t => t.status === TicketStatus.RESOLVED).length;
    const pending = tickets.filter(t => t.status === TicketStatus.PENDING || t.status === TicketStatus.ACCEPTED).length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const counts = {
      [TicketStatus.PENDING]: 0,
      [TicketStatus.ACCEPTED]: 0,
      [TicketStatus.RESOLVED]: 0,
      [TicketStatus.REJECTED]: 0,
    };

    tickets.forEach(t => {
      counts[t.status]++;
    });

    const chartData = [
      { name: 'Pending', value: counts[TicketStatus.PENDING], color: '#94a3b8' },
      { name: 'Accepted', value: counts[TicketStatus.ACCEPTED], color: '#60a5fa' },
      { name: 'Resolved', value: counts[TicketStatus.RESOLVED], color: '#10b981' },
      { name: 'Rejected', value: counts[TicketStatus.REJECTED], color: '#f43f5e' },
    ].filter(d => d.value > 0);

    return { total, resolved, pending, resolutionRate, chartData };
  }, [tickets]);

  const [activePieIndex, setActivePieIndex] = React.useState(-1);
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | undefined>(undefined);

  const handlePieEnter = (data: any, index: number) => {
    setActivePieIndex(index);
    if (data) {
      const RADIAN = Math.PI / 180;
      const radius = data.outerRadius + 30; // Push outside
      const x = data.cx + radius * Math.cos(-data.midAngle * RADIAN);
      const y = data.cy + radius * Math.sin(-data.midAngle * RADIAN);
      // Center the tooltip box horizontally and vertically
      setTooltipPos({ x: x - 65, y: y - 25 });
    }
  };

  const handlePieLeave = () => {
    setActivePieIndex(-1);
  };

  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const statusData = stats.chartData.find((d: any) => d.name === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="var(--chart-text-color, #64748b)" fontSize={12} fontWeight={600}>
          {payload.value}
        </text>
        <text x={0} y={0} dy={34} textAnchor="middle" fill="var(--chart-text-color, #94a3b8)" fontSize={14} fontWeight={800} className="dark:text-[#e3e3e3]">
          {statusData?.value || 0}
        </text>
      </g>
    );
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-[#3c4043] rounded-xl shadow-xl shadow-slate-900/5 dark:shadow-black/50 p-3 z-50 relative">
          <p className="text-sm font-bold text-slate-900 dark:text-[#e3e3e3]">{label || payload[0].name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color || payload[0].fill }} />
            <p className="text-xs font-medium text-slate-600 dark:text-white">
              Value: <span className="font-bold text-slate-900 dark:text-white">{payload[0].value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-[#e3e3e3] transition-colors">Command Center</h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1e1f20] p-5 rounded-2xl border border-slate-200 dark:border-[#3c4043] shadow-sm transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-100 dark:bg-[#2d2e30] rounded-xl text-slate-600 dark:text-[#e3e3e3] transition-colors">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-[#9aa0a6] uppercase tracking-widest transition-colors">Total Tickets</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-[#e3e3e3] transition-colors">{stats.total}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1e1f20] p-5 rounded-2xl border border-slate-200 dark:border-[#3c4043] shadow-sm transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-[#9aa0a6] uppercase tracking-widest transition-colors">Resolution Rate</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-[#e3e3e3] transition-colors">{stats.resolutionRate}%</h4>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1e1f20] p-5 rounded-2xl border border-slate-200 dark:border-[#3c4043] shadow-sm transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-[#9aa0a6] uppercase tracking-widest transition-colors">Active Tickets</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-[#e3e3e3] transition-colors">{stats.pending}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1e1f20] p-5 rounded-2xl border border-slate-200 dark:border-[#3c4043] shadow-sm transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 transition-colors">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-[#9aa0a6] uppercase tracking-widest transition-colors">Rejected</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-[#e3e3e3] transition-colors">{stats.total - stats.resolved - stats.pending}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1e1f20] p-5 rounded-2xl border border-slate-200 dark:border-[#3c4043] shadow-sm transition-colors">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-[#9aa0a6] uppercase tracking-[0.2em] mb-6 transition-colors">Status Volume</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid-color, #f1f5f9)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={<CustomXAxisTick />}
                />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--chart-text-color, #94a3b8)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40} isAnimationActive={false}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1f20] p-5 rounded-2xl border border-slate-200 dark:border-[#3c4043] shadow-sm transition-colors relative">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-[#9aa0a6] uppercase tracking-[0.2em] mb-6 transition-colors">Workload Distribution</h3>
          <div className="h-[240px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%" className="z-0">
              <PieChart>
                <Pie
                  data={stats.chartData}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  activeIndex={activePieIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={handlePieEnter}
                  onMouseLeave={handlePieLeave}
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} position={tooltipPos} isAnimationActive={false} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <div className="bg-white/80 dark:bg-[#1e1f20]/80 backdrop-blur-sm rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-slate-400 dark:text-[#9aa0a6] uppercase tracking-tighter transition-colors mt-1">Total</span>
                <span className="text-4xl font-black text-slate-800 dark:text-[#e3e3e3] transition-colors drop-shadow-sm">{stats.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
