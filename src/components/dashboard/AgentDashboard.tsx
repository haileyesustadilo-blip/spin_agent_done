import React, { useState, useMemo } from 'react';
import { AgentProfile, Ticket, Transaction, SoloGame, UniversalGame, AuditLog } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Ticket as TicketIcon,
  TrendingUp,
  Award,
  Dices,
  Wallet,
  QrCode,
  CheckCircle,
  PlusCircle,
  Receipt,
  Users,
  Bell,
  HelpCircle,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  BarChart3,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface AgentDashboardProps {
  agent: AgentProfile;
  tickets: Ticket[];
  transactions: Transaction[];
  soloGames: SoloGame[];
  universalGames: UniversalGame[];
  auditLogs?: AuditLog[];
  onNavigate: (tab: string) => void;
  onOpenSellTicketModal: (gameType?: string) => void;
  onOpenCreateSoloModal: () => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  agent,
  tickets,
  transactions,
  soloGames,
  universalGames,
  auditLogs,
  onNavigate,
  onOpenSellTicketModal,
  onOpenCreateSoloModal,
}) => {
  const isApproved = agent.status === 'approved';
  const [chartView, setChartView] = useState<'both' | 'commission' | 'sales'>('both');

  // Greeting time logic
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  // Compute 7-day performance trend data for Recharts strictly from real tickets data
  const chartData = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const label = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Calculate actual tickets sold on this date
      const dayTickets = tickets.filter((t) => new Date(t.issuedAt).toDateString() === dateStr);
      const daySales = dayTickets.reduce((sum, t) => sum + (t.ticketPrice || 0), 0);
      const dayCommission = dayTickets.reduce((sum, t) => sum + (t.commissionEarned || 0), 0);

      days.push({
        date: label,
        sales: daySales,
        commission: dayCommission,
        ticketsCount: dayTickets.length,
      });
    }

    return days;
  }, [tickets]);

  // Total 7-day aggregates
  const total7DaySales = useMemo(() => chartData.reduce((acc, curr) => acc + curr.sales, 0), [chartData]);
  const total7DayCommission = useMemo(() => chartData.reduce((acc, curr) => acc + curr.commission, 0), [chartData]);

  return (
    <div className="space-y-6 text-slate-300 pb-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#16191F] p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Agent Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {greetingTime}, <span className="text-emerald-400">{agent.fullName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Spain Game Platform • Agent Portal • Phone: <span className="font-mono text-slate-200">{agent.phone}</span>
            </p>
          </div>

          {/* Top Quick Primary CTA Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenSellTicketModal('universal')}
              disabled={!isApproved}
              className={`px-5 py-3 rounded-2xl font-bold text-xs shadow-lg flex items-center space-x-2 transition-all ${
                isApproved
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <TicketIcon className="w-4 h-4" />
              <span>Sell Universal Ticket</span>
            </button>

            <button
              onClick={onOpenCreateSoloModal}
              disabled={!isApproved}
              className={`px-5 py-3 rounded-2xl font-bold text-xs shadow-sm flex items-center space-x-2 transition-all ${
                isApproved
                  ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-purple-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-purple-200" />
              <span>Create Solo Game</span>
            </button>

            <button
              onClick={() => onNavigate('verify-winners')}
              className="px-5 py-3 rounded-2xl font-bold text-xs shadow-sm flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer transition-all shadow-amber-500/20"
            >
              <QrCode className="w-4 h-4" />
              <span>Verify Winners & QR</span>
            </button>
          </div>
        </div>
      </div>

      {!isApproved && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold">Agent Account Pending Approval</p>
              <p className="text-[11px] text-amber-200/80">
                Ticket selling is disabled until Admin approves your application. Click "Admin Sandbox" above to activate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary Quick Actions Section */}
      <div className="bg-[#16191F] rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Quick Actions Terminal</h2>
              <p className="text-[11px] text-slate-400">Immediate access to primary counter tools</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-400">
            One-Click Terminal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Action 1: Sell Ticket */}
          <button
            onClick={() => onOpenSellTicketModal('universal')}
            disabled={!isApproved}
            className={`group relative overflow-hidden p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              isApproved
                ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10'
                : 'bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <TicketIcon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                Primary
              </span>
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
              Sell Ticket
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Issue Universal, Solo, or Syndicate tickets instantly to players.
            </p>
          </button>

          {/* Action 2: Create Solo Game */}
          <button
            onClick={onOpenCreateSoloModal}
            disabled={!isApproved}
            className={`group relative overflow-hidden p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              isApproved
                ? 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border-purple-500/30 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/10'
                : 'bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Dices className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                Fast Room
              </span>
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
              Create Solo Game
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Launch 10-seat 0-9 number room with live lucky wheel spin.
            </p>
          </button>

          {/* Action 3: Verify Winners / Scan QR */}
          <button
            onClick={() => onNavigate('verify-winners')}
            className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                Verifier
              </span>
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
              Verify Winners & QR
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Verify player winning tickets via camera scanner or 17-digit serial ID.
            </p>
          </button>
        </div>
      </div>

      {/* 6 Key Agent Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Metric 1: Today's Sales */}
        <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Sales</span>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <TicketIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{agent.todaySalesCount}</span>
            <span className="text-xs text-slate-400 font-semibold">Tickets</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Active daily transactions</p>
        </div>

        {/* Metric 2: Today's Commission */}
        <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Commission</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-emerald-400">
              {agent.todayCommission.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-bold">ETB</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Auto-credited to wallet</p>
        </div>

        {/* Metric 3: Total Tickets Sold */}
        <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tickets Sold</span>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">
              {agent.totalTicketsSold.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Lifetime ticket sales volume</p>
        </div>

        {/* Metric 4: Pending Winners */}
        <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Winners</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-amber-400">{agent.pendingWinnersCount}</span>
            <span className="text-xs text-amber-400 font-semibold">Unclaimed</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Ready for QR verification</p>
        </div>

        {/* Metric 5: Active Games */}
        <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Games</span>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Dices className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{agent.activeGamesCount}</span>
            <span className="text-xs text-slate-400 font-semibold">Solo & Universal</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Rooms waiting for draws/spins</p>
        </div>

        {/* Metric 6: Wallet Balance */}
        <div className="p-6 rounded-2xl bg-[#16191F] border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Wallet Balance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-emerald-400">
              {agent.walletBalance.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-bold">ETB</span>
          </div>
          <button
            onClick={() => onNavigate('wallet')}
            className="text-[11px] text-emerald-400 hover:underline font-bold mt-2 inline-flex items-center space-x-1"
          >
            <span>Withdraw Funds</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 📊 Recharts Section: 7-Day Performance Trend Chart */}
      <div className="bg-[#16191F] rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">7-Day Sales vs Commission Analytics</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing daily sales volume (ETB) vs earned agent commission (ETB) over the last 7 days
            </p>
          </div>

          {/* Chart Filter Toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => setChartView('both')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                chartView === 'both' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setChartView('sales')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                chartView === 'sales' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setChartView('commission')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                chartView === 'commission' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Commission
            </button>
          </div>
        </div>

        {/* Aggregate Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">7-Day Sales Volume</span>
            <p className="text-base font-black text-purple-400 mt-0.5">{total7DaySales.toLocaleString()} ETB</p>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">7-Day Total Commission</span>
            <p className="text-base font-black text-emerald-400 mt-0.5">{total7DayCommission.toLocaleString()} ETB</p>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Daily Avg. Commission</span>
            <p className="text-base font-black text-amber-400 mt-0.5">
              {Math.round(total7DayCommission / 7).toLocaleString()} ETB / Day
            </p>
          </div>
        </div>

        {/* Recharts Area Chart Container */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(val) => `${val}`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#16191F',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
                formatter={(value: any, name: any) => [
                  `${value.toLocaleString()} ETB`,
                  name === 'sales' ? "Today's Sales" : "Today's Commission",
                ]}
              />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: '600' }}
                formatter={(value) => (
                  <span className="text-slate-300 ml-1">
                    {value === 'sales' ? "Today's Sales (ETB)" : "Today's Commission (ETB)"}
                  </span>
                )}
              />

              {(chartView === 'both' || chartView === 'sales') && (
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="sales"
                  stroke="#A855F7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                  activeDot={{ r: 6, stroke: '#C084FC', strokeWidth: 2 }}
                />
              )}

              {(chartView === 'both' || chartView === 'commission') && (
                <Area
                  type="monotone"
                  dataKey="commission"
                  name="commission"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#commissionGradient)"
                  activeDot={{ r: 6, stroke: '#34D399', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Navigation Hub */}
      <div className="bg-[#16191F] rounded-2xl border border-slate-800 p-6 shadow-sm">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Agent Operations & Navigation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {[
            { id: 'sell-tickets', label: 'Sell Ticket', icon: TicketIcon, color: 'text-emerald-400 bg-emerald-500/10' },
            { id: 'solo-games', label: 'Create Solo', icon: Dices, color: 'text-slate-300 bg-slate-800' },
            { id: 'verify-winners', label: 'Verify Winners & QR', icon: QrCode, color: 'text-amber-400 bg-amber-500/10' },
            { id: 'transactions', label: 'Transactions', icon: Receipt, color: 'text-slate-300 bg-slate-800' },
            { id: 'reports', label: 'Commission', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10' },
            { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-slate-300 bg-slate-800' },
            { id: 'wallet', label: 'Wallet', icon: Wallet, color: 'text-emerald-400 bg-emerald-500/10' },
            { id: 'support', label: 'Support', icon: HelpCircle, color: 'text-slate-300 bg-slate-800' },
          ].map((act, i) => {
            const Icon = act.icon;
            return (
              <button
                key={i}
                onClick={() => onNavigate(act.id)}
                className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex flex-col items-center justify-center text-center group transition-all cursor-pointer"
              >
                <div className={`p-2.5 rounded-xl ${act.color} mb-2 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets Sold */}
        <div className="bg-[#16191F] border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <TicketIcon className="w-4 h-4 text-emerald-400" />
              <span>Recent Ticket Sales</span>
            </h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {tickets.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-200">{t.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                      #{t.selectedNumber}
                    </span>
                  </div>
                  <p className="text-slate-300 font-medium mt-0.5">{t.playerName} ({t.playerPhone})</p>
                  <p className="text-[10px] text-slate-500">{t.gameName}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400">+{t.commissionEarned} ETB</span>
                  <p className="text-[10px] text-slate-500">Price: {t.ticketPrice} ETB</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Solo Games */}
        <div className="bg-[#16191F] border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Dices className="w-4 h-4 text-amber-400" />
              <span>Active Solo Game Rooms</span>
            </h3>
            <button
              onClick={() => onNavigate('solo-games')}
              className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              Manage Solo
            </button>
          </div>

          <div className="space-y-3">
            {soloGames.map((sg) => {
              const picksCount = Object.keys(sg.selectedNumbers).length;

              return (
                <div
                  key={sg.id}
                  className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{sg.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                        {sg.ticketPrice} ETB/Seat
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Players: <span className="font-bold text-slate-200">{picksCount}</span> / {sg.playerLimit} • Win: {sg.winningPercentage}%
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('solo-games')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
                  >
                    Open Room
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

