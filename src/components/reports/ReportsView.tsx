import React, { useState } from 'react';
import { AgentProfile, Ticket, Transaction } from '../../types';
import {
  TrendingUp,
  Calendar,
  Download,
  FileSpreadsheet,
  Award,
  Ticket as TicketIcon,
  DollarSign,
  BarChart3,
  CheckCircle,
} from 'lucide-react';

interface ReportsViewProps {
  agent: AgentProfile;
  tickets: Ticket[];
  transactions: Transaction[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ agent, tickets, transactions }) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly'>('daily');

  const totalMonthlyTickets = tickets.length || agent.totalTicketsSold;
  const totalMonthlyCommission = tickets.reduce((acc, t) => acc + (t.commissionEarned || 0), 0);
  const totalMonthlyWithdrawals = transactions
    .filter((tx) => tx.type === 'withdrawal' && tx.status === 'completed')
    .reduce((acc, tx) => acc + tx.amount, 0);

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs font-bold text-yellow-300 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
            <span>Agent Performance & Financial Reporting</span>
          </div>
          <h1 className="text-2xl font-black text-white">Commission & Sales Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Detailed breakdown of ticket volume, agent commissions, profits, winners, and audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex text-xs">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                timeframe === 'daily' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Daily Report
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                timeframe === 'monthly' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Monthly Report
            </button>
          </div>

          <button
            onClick={() => alert('Report CSV exported to browser downloads!')}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {timeframe === 'daily' ? (
        /* Daily Metrics Grid */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium">Daily Tickets Sold</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{agent.todaySalesCount}</p>
            <p className="text-[10px] text-slate-500 mt-1">Today's transactions</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium">Daily Commission</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {agent.todayCommission.toLocaleString()} Birr
            </p>
            <p className="text-[10px] text-emerald-400 mt-1">Net profit auto-credited</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium">Winners Found Today</p>
            <p className="text-2xl sm:text-3xl font-black text-purple-300 mt-1">{agent.pendingWinnersCount}</p>
            <p className="text-[10px] text-purple-400 mt-1">Unclaimed winning tickets</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium">Refunds / Pending</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">0 Birr</p>
            <p className="text-[10px] text-slate-500 mt-1">Zero disputes recorded</p>
          </div>
        </div>
      ) : (
        /* Monthly Metrics Grid */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium">Monthly Sales Volume</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{totalMonthlyTickets.toLocaleString()} Tickets</p>
            <p className="text-[10px] text-slate-500 mt-1">Total tickets processed</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium">Monthly Commission</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {totalMonthlyCommission.toLocaleString()} Birr
            </p>
            <p className="text-[10px] text-emerald-400 mt-1">Current month total</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium">Monthly Withdrawals</p>
            <p className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
              {totalMonthlyWithdrawals.toLocaleString()} Birr
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Processed bank transfers</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium">Agent Rating Score</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">99.8%</p>
            <p className="text-[10px] text-amber-400 mt-1">Top Tier Ticket Seller</p>
          </div>
        </div>
      )}

      {/* Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="font-bold text-sm text-white flex items-center space-x-2">
          <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          <span>Ticket Sales Audit Ledger</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Game Name</th>
                <th className="p-3">Player</th>
                <th className="p-3">Number</th>
                <th className="p-3">Ticket Price</th>
                <th className="p-3">Commission Earned</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-amber-300">{t.id}</td>
                  <td className="p-3">{t.gameName}</td>
                  <td className="p-3 text-white font-semibold">{t.playerName}</td>
                  <td className="p-3 font-mono font-bold text-slate-200">#{t.selectedNumber}</td>
                  <td className="p-3 text-slate-300">{t.ticketPrice} Birr</td>
                  <td className="p-3 font-bold text-emerald-400">+{t.commissionEarned} Birr</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'winner_unclaimed'
                          ? 'bg-purple-500/20 text-purple-300'
                          : t.status === 'claimed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
